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
    // GET - Get single lesson with resources
    if (req.method === 'GET') {
      const { id, module_id } = req.query;

      if (id) {
        // Get single lesson with resources
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();

        if (lessonError) throw lessonError;

        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('lesson_id', id)
          .order('order_index');

        if (resourcesError) throw resourcesError;

        return res.status(200).json({ lesson, resources });
      } else if (module_id) {
        // Get all lessons for a module
        const { data: lessons, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', module_id)
          .order('order_index');

        if (error) throw error;

        return res.status(200).json({ lessons });
      }

      return res.status(400).json({ error: 'id or module_id required' });
    }

    // POST - Create new lesson
    if (req.method === 'POST') {
      const { module_id, title, description, loom_url, duration, status } = req.body;

      if (!module_id || !title) {
        return res.status(400).json({ error: 'module_id and title are required' });
      }

      // Get max order_index for this module
      const { data: maxOrder } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('module_id', module_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex = (maxOrder?.[0]?.order_index || 0) + 1;

      const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
          module_id,
          title,
          description: description || null,
          loom_url: loom_url || null,
          duration: duration || null,
          status: status || 'available',
          order_index: newOrderIndex
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ lesson });
    }

    // PUT - Update lesson
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { title, description, loom_url, duration, status, is_published, module_id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (loom_url !== undefined) updates.loom_url = loom_url;
      if (duration !== undefined) updates.duration = duration;
      if (status !== undefined) updates.status = status;
      if (is_published !== undefined) updates.is_published = is_published;
      if (module_id !== undefined) updates.module_id = module_id;

      const { data: lesson, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ lesson });
    }

    // DELETE - Delete lesson
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Lessons API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

