import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Get user from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify the token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Handle GET request - fetch progress
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        progress: data || {
          completed_lessons: [],
          current_lesson: null,
        }
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
  }

  // Handle POST request - save progress
  if (req.method === 'POST') {
    try {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        bodyData = JSON.parse(bodyData);
      }
      
      const { completed_lessons, current_lesson } = bodyData;
      
      if (!Array.isArray(completed_lessons)) {
        return res.status(400).json({ error: 'completed_lessons must be an array' });
      }
      
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          completed_lessons: completed_lessons,
          current_lesson: current_lesson || null,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        progress: data
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

