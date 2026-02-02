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

  // Get Razorpay credentials (with fallbacks matching create-contact.js)
  const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';

  // Initialize Supabase client (optional - may not have orders table yet)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  let supabase = null;
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

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

    let orders = [];
    let localOrders = [];

    // Try to fetch from Supabase orders table first
    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (startDate && endDate) {
          query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        }

        // Region filter: INDIA or INTERNATIONAL (SAARC counts as INTERNATIONAL)
        if (region && region !== 'all') {
          if (region === 'INDIA') {
            query = query.eq('region', 'INDIA');
          } else if (region === 'INTERNATIONAL') {
            query = query.or('region.eq.INTERNATIONAL,region.eq.SAARC');
          }
        }

        const { data: dbOrders, error } = await query;
        
        if (!error && dbOrders) {
          localOrders = dbOrders;
        }
      } catch (e) {
        console.log('Orders table may not exist yet, falling back to Razorpay');
      }
    }

    // Always fetch from Razorpay API to get complete historical data
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      console.log('Fetching payments from Razorpay API...');
      debugInfo.razorpayFetchAttempted = true;
      
      const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      
      // Fetch payments from Razorpay (up to 100 at a time)
      let allPayments = [];
      let skip = 0;
      const count = 100;
      let hasMore = true;
      
      try {
        while (hasMore) {
          const params = new URLSearchParams({
            count: count.toString(),
            skip: skip.toString()
          });
          
          // Add date filters if specified
          if (startDate) {
            params.append('from', Math.floor(startDate.getTime() / 1000).toString());
          }
          if (endDate) {
            params.append('to', Math.floor(endDate.getTime() / 1000).toString());
          }
          
          const response = await fetch(`https://api.razorpay.com/v1/payments?${params.toString()}`, {
            headers: {
              'Authorization': `Basic ${razorpayAuth}`
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Razorpay API error:', errorText);
            debugInfo.razorpayError = `HTTP ${response.status}: ${errorText.substring(0, 200)}`;
            break;
          }
          
          const data = await response.json();
          const payments = data.items || [];
          debugInfo.totalPaymentsFetched += payments.length;
          
          // Filter for only captured payments (successful)
          const capturedPayments = payments.filter(p => p.status === 'captured');
          debugInfo.capturedPayments += capturedPayments.length;
          allPayments = allPayments.concat(capturedPayments);
          
          // Check if there are more payments
          if (payments.length < count) {
            hasMore = false;
          } else {
            skip += count;
            // Safety limit to prevent infinite loops
            if (skip > 1000) hasMore = false;
          }
        }
      } catch (fetchError) {
        console.error('Razorpay fetch error:', fetchError);
        debugInfo.razorpayError = fetchError.message;
      }
      
      // Convert Razorpay payments to order format
      orders = allPayments.map(payment => {
        const isIndia = payment.currency === 'INR';
        return {
          id: payment.id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount, // Already in paise/cents
          currency: payment.currency,
          region: isIndia ? 'INDIA' : 'INTERNATIONAL',
          customer_email: payment.email || payment.notes?.email || '-',
          customer_name: payment.notes?.customer_name || payment.notes?.name || '-',
          coupon_code: payment.notes?.coupon_code || null,
          has_gst: false,
          invoice_sent: false,
          created_at: new Date(payment.created_at * 1000).toISOString(),
          source: 'razorpay' // Mark as coming from Razorpay
        };
      });
      
      // Apply region filter for Razorpay data
      if (region && region !== 'all') {
        if (region === 'INDIA') {
          orders = orders.filter(o => o.region === 'INDIA');
        } else if (region === 'INTERNATIONAL') {
          orders = orders.filter(o => o.region !== 'INDIA');
        }
      }
      
      // Sort by date descending
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Merge local orders with Razorpay orders (deduplicate by payment_id)
    const localPaymentIds = new Set(localOrders.map(o => o.razorpay_payment_id));
    const razorpayOnly = orders.filter(o => !localPaymentIds.has(o.razorpay_payment_id));
    
    // Combine: local orders first (they have more data like GST info), then Razorpay-only
    orders = [...localOrders, ...razorpayOnly];
    
    // Re-sort after merging
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate summary statistics (simplified: India vs International)
    const summary = {
      totalOrders: orders.length,
      totalRevenue: {
        INR: 0,
        USD: 0
      },
      byRegion: {
        INDIA: { count: 0, revenue: 0 },
        INTERNATIONAL: { count: 0, revenue: 0 }
      },
      gstInvoices: {
        total: 0,
        sent: 0
      }
    };

    orders.forEach(order => {
      // Amount is in smallest unit (paise/cents), convert to main unit
      const amountInMainUnit = (order.amount || 0) / 100;
      
      // Add to currency totals
      if (order.currency === 'INR') {
        summary.totalRevenue.INR += amountInMainUnit;
      } else {
        summary.totalRevenue.USD += amountInMainUnit;
      }
      
      // Simplified region: India vs International (SAARC = International)
      const orderRegion = order.region === 'INDIA' ? 'INDIA' : 'INTERNATIONAL';
      summary.byRegion[orderRegion].count++;
      summary.byRegion[orderRegion].revenue += amountInMainUnit;
      
      // GST invoice stats
      if (order.has_gst) {
        summary.gstInvoices.total++;
        if (order.invoice_sent) {
          summary.gstInvoices.sent++;
        }
      }
    });

    // Round revenue values
    summary.totalRevenue.INR = Math.round(summary.totalRevenue.INR * 100) / 100;
    summary.totalRevenue.USD = Math.round(summary.totalRevenue.USD * 100) / 100;
    summary.byRegion.INDIA.revenue = Math.round(summary.byRegion.INDIA.revenue * 100) / 100;
    summary.byRegion.INTERNATIONAL.revenue = Math.round(summary.byRegion.INTERNATIONAL.revenue * 100) / 100;

    // Get available months from orders
    const availableMonths = [...new Set(
      orders.map(o => {
        const d = new Date(o.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })
    )].sort().reverse();

    return res.status(200).json({
      orders,
      summary,
      availableMonths,
      filters: {
        month: month || null,
        region: region || 'all'
      },
      source: localOrdersExist ? 'database' : 'razorpay'
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
