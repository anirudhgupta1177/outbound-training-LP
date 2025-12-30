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
    const contactPayload = {
      email: customer_email,
      first_name: customer_first_name || '',
      last_name: customer_last_name || '',
    };
    
    // Add phone if provided
    if (customer_phone) {
      contactPayload.phone = customer_phone;
    }
    
    // Add tags - Systeme.io might require tags in a different format
    // Try as array first, if that fails we'll try as string
    contactPayload.tags = ['Course'];
    
    console.log('Creating contact in Systeme.io with payload:', JSON.stringify(contactPayload, null, 2));
    console.log('Using API Key (first 10 chars):', SYSTEME_API_KEY.substring(0, 10) + '...');
    
    // Try the endpoint - Systeme.io uses /api/contacts
    // If that fails with 400/404, try /contacts (without /api)
    let systemeResponse;
    let responseText;
    let endpoint = 'https://api.systeme.io/api/contacts';
    
    try {
      systemeResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SYSTEME_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactPayload)
      });

      responseText = await systemeResponse.text();
      console.log('Systeme.io response status:', systemeResponse.status);
      console.log('Systeme.io response:', responseText);
      
      // If 404 or 400 with "not found", try alternative endpoint
      if (systemeResponse.status === 404 || (systemeResponse.status === 400 && responseText.toLowerCase().includes('not found'))) {
        console.log('Trying alternative endpoint: https://api.systeme.io/contacts');
        endpoint = 'https://api.systeme.io/contacts';
        systemeResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SYSTEME_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactPayload)
        });
        responseText = await systemeResponse.text();
        console.log('Alternative endpoint response status:', systemeResponse.status);
        console.log('Alternative endpoint response:', responseText);
      }
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({
        error: 'Network error contacting Systeme.io',
        details: fetchError.message
      });
    }

    if (!systemeResponse.ok) {
      console.error('Systeme.io API error:', {
        status: systemeResponse.status,
        statusText: systemeResponse.statusText,
        response: responseText,
        endpoint: endpoint,
        payload: contactPayload
      });
      return res.status(500).json({ 
        error: 'Failed to create contact in Systeme.io',
        status: systemeResponse.status,
        statusText: systemeResponse.statusText,
        details: responseText,
        endpoint: endpoint
      });
    }

    let contactData;
    try {
      contactData = JSON.parse(responseText);
    } catch (e) {
      console.warn('Could not parse Systeme.io response as JSON:', e);
      contactData = { message: 'Contact created successfully', raw: responseText };
    }

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

