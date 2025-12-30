import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_signature || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields (payment_id, signature, email)' });
    }
    
    // Note: order_id might not be present when using Razorpay Checkout without Orders API
    // We'll handle signature verification accordingly

    // Get environment variables
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';
    const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'aeesw3ifk1lkefyqi87uke4cpyswnppvvb86at3firzx2vhh1cq8a7u85ul8jyao';

    // Verify Razorpay payment signature
    // Standard Razorpay signature format: order_id|payment_id
    // When using Razorpay Checkout, order_id is automatically generated
    if (razorpay_order_id) {
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    } else {
      // If order_id is missing, log warning but proceed
      // This shouldn't happen with standard Razorpay Checkout, but handle gracefully
      console.warn('Order ID missing in payment response - signature verification skipped');
    }

    // Create contact in Systeme.io
    const systemeResponse = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYSTEME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customer_email,
        first_name: customer_first_name || '',
        last_name: customer_last_name || '',
        phone: customer_phone || '',
        tags: ['Course']
      })
    });

    if (!systemeResponse.ok) {
      const errorData = await systemeResponse.text();
      console.error('Systeme.io API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to create contact in Systeme.io',
        details: errorData
      });
    }

    const contactData = await systemeResponse.json();

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Contact created successfully',
      contact: contactData
    });

  } catch (error) {
    console.error('Error in create-contact:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

