import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

// Admin CRUD for the Offer Vault. Everything the vault needs lives behind one
// function, selected by `?entity=`:
//   (none)        offers
//   part          ordered phases within an offer, each with its own video
//   resource      resource links, attached to an offer or to one of its parts
//   settings      portal-wide settings (booking link, vault copy)
//   entitlement   grant/revoke a member's access to an offer
//   reorder       persist offer card order

const OFFER_FIELDS = [
  'slug',
  'title',
  'subtitle',
  'description',
  'kind',
  'badge',
  'duration_label',
  'highlights',
  'portal_path',
  'landing_page_url',
  'cta_url',
  'cta_label',
  'locked_cta_label',
  'primary_video_url',
  'primary_video_title',
  'accent',
  'unlocked_by_default',
  'is_active',
];

const PART_FIELDS = [
  'title',
  'subtitle',
  'description',
  'video_url',
  'duration_label',
  'is_published',
];

const RESOURCE_FIELDS = ['title', 'url', 'type', 'description'];

// Empty strings from HTML inputs should clear a column, not store ''.
function pick(body, fields) {
  const out = {};
  for (const field of fields) {
    if (body[field] === undefined) continue;
    const value = body[field];
    out[field] = typeof value === 'string' && value.trim() === '' ? null : value;
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authResult = verifyAdminToken(req.headers.authorization, JWT_SECRET);

  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { entity, id, user_id: userIdParam, offer_slug: offerSlugParam } = req.query;
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  try {
    // ---------------------------------------------------------------- settings
    if (entity === 'settings') {
      if (req.method === 'GET') {
        const { data, error } = await supabase
          .from('portal_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();
        if (error) throw error;
        return res.status(200).json({ settings: data || {} });
      }

      if (req.method === 'PUT') {
        const updates = pick(body, ['booking_url', 'vault_heading', 'vault_subheading']);
        updates.id = 'default';
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('portal_settings')
          .upsert(updates, { onConflict: 'id' })
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json({ settings: data });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ------------------------------------------------------------ entitlements
    if (entity === 'entitlements') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

      let query = supabase.from('user_entitlements').select('user_id, offer_slug, source, granted_at');
      if (userIdParam) query = query.eq('user_id', userIdParam);

      const { data, error } = await query;
      if (error) throw error;

      // Shape as { [user_id]: [slug, ...] } so the members table can render fast.
      const byUser = {};
      for (const row of data || []) {
        (byUser[row.user_id] ||= []).push(row.offer_slug);
      }
      return res.status(200).json({ entitlements: byUser });
    }

    if (entity === 'entitlement') {
      if (req.method === 'POST') {
        const targetUser = body.user_id;
        const targetSlug = body.offer_slug;
        if (!targetUser || !targetSlug) {
          return res.status(400).json({ error: 'user_id and offer_slug are required' });
        }

        const { data, error } = await supabase
          .from('user_entitlements')
          .upsert(
            {
              user_id: targetUser,
              offer_slug: targetSlug,
              source: 'admin',
              granted_by: authResult.email || 'admin',
            },
            { onConflict: 'user_id,offer_slug' }
          )
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json({ entitlement: data });
      }

      if (req.method === 'DELETE') {
        if (!userIdParam || !offerSlugParam) {
          return res.status(400).json({ error: 'user_id and offer_slug are required' });
        }
        const { error } = await supabase
          .from('user_entitlements')
          .delete()
          .eq('user_id', userIdParam)
          .eq('offer_slug', offerSlugParam);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ------------------------------------------------------------------- parts
    if (entity === 'part') {
      if (req.method === 'POST') {
        const { offer_id: offerId } = body;
        if (!offerId || !body.title) {
          return res.status(400).json({ error: 'offer_id and title are required' });
        }

        const { data: maxOrder } = await supabase
          .from('portal_offer_parts')
          .select('order_index')
          .eq('offer_id', offerId)
          .order('order_index', { ascending: false })
          .limit(1);

        const { data, error } = await supabase
          .from('portal_offer_parts')
          .insert({
            offer_id: offerId,
            ...pick(body, PART_FIELDS),
            title: body.title,
            order_index: (maxOrder?.[0]?.order_index || 0) + 1,
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json({ part: data });
      }

      if (req.method === 'PUT') {
        if (!id) return res.status(400).json({ error: 'Part ID is required' });
        const { data, error } = await supabase
          .from('portal_offer_parts')
          .update(pick(body, PART_FIELDS))
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json({ part: data });
      }

      if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ error: 'Part ID is required' });
        // Resources attached to this part cascade away with it.
        const { error } = await supabase.from('portal_offer_parts').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (entity === 'reorder-parts') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const { partIds } = body;
      if (!Array.isArray(partIds) || partIds.length === 0) {
        return res.status(400).json({ error: 'partIds array is required' });
      }
      await Promise.all(
        partIds.map((partId, index) =>
          supabase.from('portal_offer_parts').update({ order_index: index + 1 }).eq('id', partId)
        )
      );
      return res.status(200).json({ success: true });
    }

    // --------------------------------------------------------------- resources
    if (entity === 'resource') {
      if (req.method === 'POST') {
        const { offer_id: offerId, part_id: partId } = body;
        if (!offerId || !body.title || !body.url) {
          return res.status(400).json({ error: 'offer_id, title and url are required' });
        }

        // Order within the list the resource actually renders in.
        let orderQuery = supabase
          .from('portal_offer_resources')
          .select('order_index')
          .eq('offer_id', offerId);
        orderQuery = partId ? orderQuery.eq('part_id', partId) : orderQuery.is('part_id', null);

        const { data: maxOrder } = await orderQuery
          .order('order_index', { ascending: false })
          .limit(1);

        const { data, error } = await supabase
          .from('portal_offer_resources')
          .insert({
            offer_id: offerId,
            part_id: partId || null,
            ...pick(body, RESOURCE_FIELDS),
            type: body.type || 'link',
            order_index: (maxOrder?.[0]?.order_index || 0) + 1,
          })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json({ resource: data });
      }

      if (req.method === 'PUT') {
        if (!id) return res.status(400).json({ error: 'Resource ID is required' });
        const updates = pick(body, RESOURCE_FIELDS);
        if (body.order_index !== undefined) updates.order_index = body.order_index;
        // Lets an admin move a resource between phases (or back to the offer).
        if (body.part_id !== undefined) updates.part_id = body.part_id || null;

        const { data, error } = await supabase
          .from('portal_offer_resources')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json({ resource: data });
      }

      if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ error: 'Resource ID is required' });
        const { error } = await supabase.from('portal_offer_resources').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ----------------------------------------------------------------- reorder
    if (entity === 'reorder') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      const { offerIds } = body;
      if (!Array.isArray(offerIds) || offerIds.length === 0) {
        return res.status(400).json({ error: 'offerIds array is required' });
      }

      await Promise.all(
        offerIds.map((offerId, index) =>
          supabase.from('portal_offers').update({ order_index: index + 1 }).eq('id', offerId)
        )
      );
      return res.status(200).json({ success: true });
    }

    // ------------------------------------------------------------------ offers
    if (req.method === 'GET') {
      if (id) {
        const [
          { data: offer, error: offerError },
          { data: parts, error: partsError },
          { data: resources, error: resError },
        ] = await Promise.all([
          supabase.from('portal_offers').select('*').eq('id', id).single(),
          supabase
            .from('portal_offer_parts')
            .select('*')
            .eq('offer_id', id)
            .order('order_index'),
          supabase
            .from('portal_offer_resources')
            .select('*')
            .eq('offer_id', id)
            .order('order_index'),
        ]);

        if (offerError) throw offerError;
        if (partsError) throw partsError;
        if (resError) throw resError;

        return res.status(200).json({
          offer,
          parts: parts || [],
          resources: resources || [],
        });
      }

      const [{ data: offers, error }, { data: resources }, { data: parts }, { data: settings }] =
        await Promise.all([
          supabase.from('portal_offers').select('*').order('order_index'),
          supabase.from('portal_offer_resources').select('offer_id'),
          supabase.from('portal_offer_parts').select('offer_id'),
          supabase.from('portal_settings').select('*').eq('id', 'default').maybeSingle(),
        ]);

      if (error) throw error;

      const counts = {};
      for (const r of resources || []) counts[r.offer_id] = (counts[r.offer_id] || 0) + 1;
      const partCounts = {};
      for (const p of parts || []) partCounts[p.offer_id] = (partCounts[p.offer_id] || 0) + 1;

      const { count: entitlementCount } = await supabase
        .from('user_entitlements')
        .select('*', { count: 'exact', head: true });

      return res.status(200).json({
        offers: (offers || []).map((o) => ({
          ...o,
          resource_count: counts[o.id] || 0,
          part_count: partCounts[o.id] || 0,
        })),
        settings: settings || {},
        entitlement_count: entitlementCount || 0,
      });
    }

    if (req.method === 'POST') {
      if (!body.title || !body.slug) {
        return res.status(400).json({ error: 'Title and slug are required' });
      }

      const { data: maxOrder } = await supabase
        .from('portal_offers')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const { data, error } = await supabase
        .from('portal_offers')
        .insert({
          ...pick(body, OFFER_FIELDS),
          slug: body.slug,
          title: body.title,
          kind: body.kind || 'course',
          accent: body.accent || 'cyan',
          order_index: (maxOrder?.[0]?.order_index || 0) + 1,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'An offer with that slug already exists' });
        }
        throw error;
      }
      return res.status(201).json({ offer: data });
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Offer ID is required' });

      const { data, error } = await supabase
        .from('portal_offers')
        .update(pick(body, OFFER_FIELDS))
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'An offer with that slug already exists' });
        }
        throw error;
      }
      return res.status(200).json({ offer: data });
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Offer ID is required' });
      // Resources cascade; entitlements are keyed by slug and are cleaned up here.
      const { data: offer } = await supabase
        .from('portal_offers')
        .select('slug')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase.from('portal_offers').delete().eq('id', id);
      if (error) throw error;

      if (offer?.slug) {
        await supabase.from('user_entitlements').delete().eq('offer_slug', offer.slug);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin offers API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
