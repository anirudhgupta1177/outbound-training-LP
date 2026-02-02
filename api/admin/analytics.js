import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Parse query parameters
    const { month, region } = req.query;
    
    // Build date range for the month filter
    let startDate, endDate;
    if (month) {
      // month format: YYYY-MM
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // Last day of month
    }

    // Build query
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply date filter if month specified
    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }

    // Apply region filter if specified
    if (region && region !== 'all') {
      query = query.eq('region', region.toUpperCase());
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const summary = {
      totalOrders: orders?.length || 0,
      totalRevenue: {
        INR: 0,
        USD: 0
      },
      byRegion: {
        INDIA: { count: 0, revenue: 0 },
        SAARC: { count: 0, revenue: 0 },
        INTERNATIONAL: { count: 0, revenue: 0 }
      },
      gstInvoices: {
        total: 0,
        sent: 0
      }
    };

    if (orders) {
      orders.forEach(order => {
        // Amount is in smallest unit (paise/cents), convert to main unit
        const amountInMainUnit = (order.amount || 0) / 100;
        
        // Add to currency totals
        if (order.currency === 'INR') {
          summary.totalRevenue.INR += amountInMainUnit;
        } else if (order.currency === 'USD') {
          summary.totalRevenue.USD += amountInMainUnit;
        }
        
        // Add to region stats
        const region = order.region || 'INDIA';
        if (summary.byRegion[region]) {
          summary.byRegion[region].count++;
          summary.byRegion[region].revenue += amountInMainUnit;
        }
        
        // GST invoice stats
        if (order.has_gst) {
          summary.gstInvoices.total++;
          if (order.invoice_sent) {
            summary.gstInvoices.sent++;
          }
        }
      });
    }

    // Round revenue values
    summary.totalRevenue.INR = Math.round(summary.totalRevenue.INR * 100) / 100;
    summary.totalRevenue.USD = Math.round(summary.totalRevenue.USD * 100) / 100;
    Object.keys(summary.byRegion).forEach(key => {
      summary.byRegion[key].revenue = Math.round(summary.byRegion[key].revenue * 100) / 100;
    });

    // Get available months for the filter dropdown
    const { data: monthsData } = await supabase
      .from('orders')
      .select('created_at')
      .order('created_at', { ascending: false });
    
    const availableMonths = [...new Set(
      (monthsData || []).map(o => {
        const d = new Date(o.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })
    )];

    return res.status(200).json({
      orders: orders || [],
      summary,
      availableMonths,
      filters: {
        month: month || null,
        region: region || 'all'
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
