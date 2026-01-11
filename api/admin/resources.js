import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify admin token
  const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authResult = verifyAdminToken(req.headers.authorization, JWT_SECRET);
  
  if (!authResult.valid) {
    return res.status(401).json({ error: authResult.error });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // GET - Get resources
    if (req.method === 'GET') {
      const { lesson_id, module_id, global } = req.query;

      let query = supabase.from('resources').select('*').order('order_index');

      if (lesson_id) {
        query = query.eq('lesson_id', lesson_id);
      } else if (module_id) {
        query = query.eq('module_id', module_id);
      } else if (global === 'true') {
        query = query.eq('is_global', true);
      }

      const { data: resources, error } = await query;

      if (error) throw error;

      return res.status(200).json({ resources });
    }

    // POST - Create new resource
    if (req.method === 'POST') {
      const { lesson_id, module_id, title, url, type, category, description, is_global } = req.body;

      if (!title || !url) {
        return res.status(400).json({ error: 'title and url are required' });
      }

      // Get max order_index
      let orderQuery = supabase.from('resources').select('order_index');
      if (lesson_id) {
        orderQuery = orderQuery.eq('lesson_id', lesson_id);
      } else if (module_id) {
        orderQuery = orderQuery.eq('module_id', module_id);
      }
      
      const { data: maxOrder } = await orderQuery
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex = (maxOrder?.[0]?.order_index || 0) + 1;

      const { data: resource, error } = await supabase
        .from('resources')
        .insert({
          lesson_id: lesson_id || null,
          module_id: module_id || null,
          title,
          url,
          type: type || 'link',
          category: category || 'resource',
          description: description || null,
          is_global: is_global || false,
          order_index: newOrderIndex
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ resource });
    }

    // PUT - Update resource
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, url, type, category, description, is_global } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (url !== undefined) updates.url = url;
      if (type !== undefined) updates.type = type;
      if (category !== undefined) updates.category = category;
      if (description !== undefined) updates.description = description;
      if (is_global !== undefined) updates.is_global = is_global;

      const { data: resource, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ resource });
    }

    // DELETE - Delete resource
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Resources API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

