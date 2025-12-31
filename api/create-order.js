export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';

    // Parse request body
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        return res.status(400).json({ 
          error: 'Invalid JSON in request body',
          details: e.message 
        });
      }
    }

    const {
      amount,
      currency,
      couponCode,
      receipt
    } = bodyData || {};

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Missing or invalid amount',
        details: 'Amount must be provided in smallest currency unit (paise for INR, cents for USD)'
      });
    }

    if (!currency || (currency !== 'INR' && currency !== 'USD')) {
      return res.status(400).json({ 
        error: 'Missing or invalid currency',
        details: 'Currency must be either "INR" or "USD"'
      });
    }

    // Validate amount is in smallest currency unit (integer)
    if (!Number.isInteger(amount)) {
      return res.status(400).json({ 
        error: 'Invalid amount format',
        details: 'Amount must be an integer (in smallest currency unit)'
      });
    }

    console.log('=== CREATING RAZORPAY ORDER ===');
    console.log('Amount:', amount, 'Currency:', currency, 'Coupon:', couponCode || 'none');

    // Prepare order payload
    const orderPayload = {
      amount: amount, // Already in smallest currency unit
      currency: currency,
      payment_capture: 1, // Auto-capture enabled
      receipt: receipt || `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    // Add notes if coupon was applied
    if (couponCode) {
      orderPayload.notes = {
        coupon_code: couponCode
      };
    }

    // Create order via Razorpay API
    const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    const responseText = await orderResponse.text();
    console.log('Razorpay order creation response status:', orderResponse.status);
    console.log('Razorpay order creation response:', responseText);

    if (!orderResponse.ok) {
      console.error('Failed to create Razorpay order:', {
        status: orderResponse.status,
        response: responseText
      });
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch (e) {
        errorDetails = { message: responseText };
      }

      return res.status(orderResponse.status).json({
        error: 'Failed to create Razorpay order',
        details: errorDetails
      });
    }

    // Parse order response
    let orderData;
    try {
      orderData = JSON.parse(responseText);
    } catch (e) {
      console.error('Could not parse Razorpay order response as JSON:', e);
      return res.status(500).json({
        error: 'Failed to parse order creation response',
        details: responseText
      });
    }

    console.log('Order created successfully:', {
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      status: orderData.status
    });

    // Return order_id and key_id to frontend
    return res.status(200).json({
      success: true,
      order_id: orderData.id,
      key_id: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency
    });

  } catch (error) {
    console.error('Error in create-order:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

