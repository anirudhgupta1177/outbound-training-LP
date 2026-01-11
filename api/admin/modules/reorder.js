import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../../admin-auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    const { moduleIds } = req.body;

    if (!moduleIds || !Array.isArray(moduleIds)) {
      return res.status(400).json({ error: 'moduleIds array is required' });
    }

    // Update order_index for each module
    const updates = moduleIds.map((id, index) => 
      supabase
        .from('modules')
        .update({ order_index: index + 1 })
        .eq('id', id)
    );

    await Promise.all(updates);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Reorder modules error:', error);
    return res.status(500).json({ error: error.message });
  }
}

