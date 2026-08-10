import { createClient } from '@supabase/supabase-js';

// Member-facing read for the Offer Vault.
//
// Offer metadata (title, badge, pitch) is safe for any signed-in member to see —
// that's what makes a locked card sellable. The actual deliverables (main video,
// resource links) are only attached to offers the caller is entitled to, so a
// locked offer can never leak its content through this endpoint.

const PUBLIC_FIELDS = [
  'id',
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
  'accent',
  'order_index',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Resolve the caller. A missing/invalid token is not an error here — the
    // vault simply renders every offer locked.
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) user = data.user;
    }

    const [offersResult, settingsResult] = await Promise.all([
      supabase
        .from('portal_offers')
        .select('*')
        .eq('is_active', true)
        .order('order_index'),
      supabase.from('portal_settings').select('*').eq('id', 'default').maybeSingle(),
    ]);

    if (offersResult.error) throw offersResult.error;

    const offers = offersResult.data || [];
    const settings = settingsResult.data || {};

    let entitlements = [];
    if (user) {
      const { data: rows, error: entError } = await supabase
        .from('user_entitlements')
        .select('offer_slug')
        .eq('user_id', user.id);

      if (entError) throw entError;
      entitlements = (rows || []).map((r) => r.offer_slug);
    }

    const unlockedOffers = offers.filter(
      (o) => user && (o.unlocked_by_default || entitlements.includes(o.slug))
    );

    // One query for every unlocked offer's resources.
    let resourcesByOffer = {};
    if (unlockedOffers.length > 0) {
      const { data: resources, error: resError } = await supabase
        .from('portal_offer_resources')
        .select('*')
        .in('offer_id', unlockedOffers.map((o) => o.id))
        .order('order_index');

      if (resError) throw resError;

      for (const r of resources || []) {
        (resourcesByOffer[r.offer_id] ||= []).push({
          id: r.id,
          title: r.title,
          url: r.url,
          type: r.type,
          description: r.description,
        });
      }
    }

    const payload = offers.map((offer) => {
      const unlocked = unlockedOffers.some((o) => o.id === offer.id);
      const base = {};
      for (const field of PUBLIC_FIELDS) base[field] = offer[field];
      base.highlights = offer.highlights || [];
      base.unlocked = unlocked;

      if (unlocked) {
        base.primary_video_url = offer.primary_video_url;
        base.primary_video_title = offer.primary_video_title;
        base.resources = resourcesByOffer[offer.id] || [];
      } else {
        base.primary_video_url = null;
        base.primary_video_title = null;
        base.resources = [];
      }

      // The consult upsell always points at the booking link the admin set.
      if (offer.kind === 'consult') {
        base.cta_url = offer.cta_url || settings.booking_url || null;
      }

      return base;
    });

    return res.status(200).json({
      authenticated: !!user,
      entitlements,
      offers: payload,
      settings: {
        booking_url: settings.booking_url || null,
        vault_heading: settings.vault_heading || 'Your Offer Vault',
        vault_subheading: settings.vault_subheading || '',
      },
    });
  } catch (error) {
    console.error('Offers API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
