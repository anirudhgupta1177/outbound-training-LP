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
    // GET - List all modules or get single module
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        // Get single module with its lessons
        const { data: module, error: moduleError } = await supabase
          .from('modules')
          .select('*')
          .eq('id', id)
          .single();

        if (moduleError) throw moduleError;

        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', id)
          .order('order_index');

        if (lessonsError) throw lessonsError;

        return res.status(200).json({ module, lessons });
      } else {
        // Get all modules with lesson counts
        const { data: modules, error } = await supabase
          .from('modules')
          .select(`
            *,
            lessons:lessons(count)
          `)
          .order('order_index');

        if (error) throw error;

        // Transform to include lesson_count
        const modulesWithCount = modules.map(m => ({
          ...m,
          lesson_count: m.lessons?.[0]?.count || 0
        }));

        return res.status(200).json({ modules: modulesWithCount });
      }
    }

    // POST - Create new module
    if (req.method === 'POST') {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Get max order_index
      const { data: maxOrder } = await supabase
        .from('modules')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex = (maxOrder?.[0]?.order_index || 0) + 1;

      const { data: module, error } = await supabase
        .from('modules')
        .insert({
          title,
          description: description || null,
          order_index: newOrderIndex
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ module });
    }

    // PUT - Update module
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, is_published } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Module ID is required' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (is_published !== undefined) updates.is_published = is_published;

      const { data: module, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ module });
    }

    // DELETE - Delete module
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Module ID is required' });
      }

      // This will cascade delete all lessons due to foreign key
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Modules API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

