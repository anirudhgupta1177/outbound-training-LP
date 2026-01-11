import { createClient } from '@supabase/supabase-js';

// Public API to fetch course data from Supabase
// Falls back to static data if Supabase tables are empty

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured', useStatic: true });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Fetch modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return res.status(200).json({ useStatic: true });
    }

    // If no modules in database, return flag to use static data
    if (!modules || modules.length === 0) {
      return res.status(200).json({ useStatic: true });
    }

    // Fetch lessons for all modules
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return res.status(200).json({ useStatic: true });
    }

    // Fetch all resources
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .order('order_index');

    if (resourcesError) {
      console.error('Error fetching resources:', resourcesError);
    }

    // Transform data to match expected format
    const courseData = {
      title: 'Outbound Mastery',
      description: 'Comprehensive outbound marketing and lead generation training',
      modules: modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        order: module.order_index,
        lessons: lessons
          .filter(l => l.module_id === module.id)
          .map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            loomUrl: lesson.loom_url,
            duration: lesson.duration,
            order: lesson.order_index,
            status: lesson.status,
            resources: (resources || [])
              .filter(r => r.lesson_id === lesson.id)
              .map(r => ({
                id: r.id,
                title: r.title,
                url: r.url,
                type: r.type
              }))
          }))
      }))
    };

    // Get global resources
    const globalResources = (resources || [])
      .filter(r => r.is_global)
      .map(r => ({
        id: r.id,
        title: r.title,
        url: r.url,
        type: r.type,
        category: r.category,
        description: r.description
      }));

    return res.status(200).json({
      useStatic: false,
      courseData,
      globalResources
    });

  } catch (error) {
    console.error('Course data API error:', error);
    return res.status(200).json({ useStatic: true });
  }
}

