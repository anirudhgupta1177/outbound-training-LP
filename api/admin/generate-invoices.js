import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

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

  // Business details for invoices
  const BUSINESS_NAME = process.env.BUSINESS_NAME || 'The Organic Buzz';
  const BUSINESS_GSTIN = process.env.BUSINESS_GSTIN || '23DSDPG2452N1ZR';
  const BUSINESS_ADDRESS = process.env.BUSINESS_ADDRESS || 'Plot No. 43, Shri Achleshwer Vihar Colony, Near Kanti Nagar, Tansen Road, Gwalior, Madhya Pradesh, India - 474002';

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

  // Get Razorpay credentials for fetching historical payments
  const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';

  try {
    const { month } = req.body;
    
    if (!month) {
      return res.status(400).json({ error: 'Month is required (format: YYYY-MM)' });
    }

    // Parse month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    let domesticOrders = [];

    // First try to fetch from local orders table
    const { data: localOrders, error: localError } = await supabase
      .from('orders')
      .select('*')
      .eq('region', 'INDIA')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (!localError && localOrders && localOrders.length > 0) {
      domesticOrders = localOrders;
    } else {
      // Fallback to Razorpay
      const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      
      const params = new URLSearchParams({
        count: '100',
        from: Math.floor(startDate.getTime() / 1000).toString(),
        to: Math.floor(endDate.getTime() / 1000).toString()
      });
      
      const response = await fetch(`https://api.razorpay.com/v1/payments?${params.toString()}`, {
        headers: {
          'Authorization': `Basic ${razorpayAuth}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const payments = (data.items || [])
          .filter(p => p.status === 'captured' && p.currency === 'INR');
        
        domesticOrders = payments.map(payment => ({
          id: payment.id,
          razorpay_payment_id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          region: 'INDIA',
          customer_email: payment.email || payment.notes?.email || '-',
          customer_name: payment.notes?.customer_name || payment.notes?.name || 'Customer',
          gst_number: payment.notes?.gst_number || null,
          gst_company_name: payment.notes?.gst_company_name || null,
          has_gst: !!payment.notes?.gst_number,
          created_at: new Date(payment.created_at * 1000).toISOString()
        }));
      }
    }

    if (domesticOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No domestic orders found for this month',
        invoices: []
      });
    }

    // Separate B2B (with GST) and B2C (without GST) orders
    const b2bOrders = domesticOrders.filter(o => o.has_gst || o.gst_number);
    const b2cOrders = domesticOrders.filter(o => !o.has_gst && !o.gst_number);

    const invoices = [];
    const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Generate individual invoices for B2C orders
    b2cOrders.forEach((order, index) => {
      const invoiceNumber = `INV-B2C-${month.replace('-', '')}-${String(index + 1).padStart(3, '0')}`;
      const amountInRupees = (order.amount || 0) / 100;
      const gstRate = 18;
      const baseAmount = amountInRupees / (1 + gstRate / 100);
      const gstAmount = amountInRupees - baseAmount;

      invoices.push({
        type: 'B2C',
        invoiceNumber,
        date: invoiceDate,
        customerName: order.customer_name || 'Customer',
        customerEmail: order.customer_email,
        customerId: order.razorpay_payment_id || order.id,
        orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
        amount: amountInRupees,
        baseAmount: Math.round(baseAmount * 100) / 100,
        cgst: Math.round((gstAmount / 2) * 100) / 100,
        sgst: Math.round((gstAmount / 2) * 100) / 100,
        totalGst: Math.round(gstAmount * 100) / 100,
        seller: {
          name: BUSINESS_NAME,
          gstin: BUSINESS_GSTIN,
          address: BUSINESS_ADDRESS
        }
      });
    });

    // Generate individual invoices for B2B orders
    b2bOrders.forEach((order, index) => {
      const invoiceNumber = `INV-B2B-${month.replace('-', '')}-${String(index + 1).padStart(3, '0')}`;
      const amountInRupees = (order.amount || 0) / 100;
      const gstRate = 18;
      const baseAmount = amountInRupees / (1 + gstRate / 100);
      const gstAmount = amountInRupees - baseAmount;

      invoices.push({
        type: 'B2B',
        invoiceNumber,
        date: invoiceDate,
        customerName: order.gst_company_name || order.customer_name || 'Business',
        customerEmail: order.customer_email,
        customerGstin: order.gst_number,
        customerId: order.razorpay_payment_id || order.id,
        orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
        amount: amountInRupees,
        baseAmount: Math.round(baseAmount * 100) / 100,
        cgst: Math.round((gstAmount / 2) * 100) / 100,
        sgst: Math.round((gstAmount / 2) * 100) / 100,
        totalGst: Math.round(gstAmount * 100) / 100,
        seller: {
          name: BUSINESS_NAME,
          gstin: BUSINESS_GSTIN,
          address: BUSINESS_ADDRESS
        }
      });
    });

    // Calculate totals
    const totalB2C = b2cOrders.reduce((sum, o) => sum + (o.amount || 0) / 100, 0);
    const totalB2B = b2bOrders.reduce((sum, o) => sum + (o.amount || 0) / 100, 0);
    const grandTotal = totalB2C + totalB2B;
    
    const gstRate = 18;
    const totalBaseAmount = grandTotal / (1 + gstRate / 100);
    const totalGst = grandTotal - totalBaseAmount;

    return res.status(200).json({
      success: true,
      month: monthName,
      summary: {
        totalOrders: domesticOrders.length,
        b2cOrders: b2cOrders.length,
        b2bOrders: b2bOrders.length,
        totalRevenue: Math.round(grandTotal * 100) / 100,
        totalBaseAmount: Math.round(totalBaseAmount * 100) / 100,
        totalGst: Math.round(totalGst * 100) / 100,
        cgst: Math.round((totalGst / 2) * 100) / 100,
        sgst: Math.round((totalGst / 2) * 100) / 100
      },
      invoices,
      seller: {
        name: BUSINESS_NAME,
        gstin: BUSINESS_GSTIN,
        address: BUSINESS_ADDRESS
      }
    });

  } catch (error) {
    console.error('Generate invoices error:', error);
    return res.status(500).json({ error: error.message });
  }
}
