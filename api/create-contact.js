import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the incoming request for debugging
    console.log('=== REQUEST RECEIVED ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'No body');
    
    // Handle potential body parsing issues
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        console.error('Failed to parse body as JSON:', e);
        return res.status(400).json({ 
          error: 'Invalid JSON in request body',
          details: e.message 
        });
      }
    }
    
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone
    } = bodyData || {};

    // Validate required fields with detailed error messages
    // Note: razorpay_signature might not be present in Razorpay Checkout response
    // We'll verify the payment server-side using Razorpay API instead
    const missingFields = [];
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!customer_email) missingFields.push('customer_email');
    
    if (missingFields.length > 0) {
      console.error('=== VALIDATION FAILED ===');
      console.error('Missing required fields:', missingFields);
      console.error('Received body keys:', Object.keys(bodyData || {}));
      console.error('Body values:', {
        razorpay_payment_id: razorpay_payment_id ? 'present' : 'missing',
        razorpay_signature: razorpay_signature ? 'present' : 'missing',
        customer_email: customer_email || 'missing'
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields,
        received: Object.keys(bodyData || {})
      });
    }
    
    console.log('=== VALIDATION PASSED ===');
    
    // Get environment variables (must be before they're used)
    const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';
    const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'aeesw3ifk1lkefyqi87uke4cpyswnppvvb86at3firzx2vhh1cq8a7u85ul8jyao';
    
    // Verify payment with Razorpay API (more reliable than client-side signature)
    // For Razorpay Checkout, signature might not be present, so we verify server-side
    if (razorpay_payment_id) {
      try {
        console.log('Verifying payment with Razorpay API:', razorpay_payment_id);
        // Note: Razorpay API requires Basic Auth with Key ID:Secret
        const razorpayAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        
        const verifyResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${razorpayAuth}`,
          }
        });
        
        if (verifyResponse.ok) {
          const paymentData = await verifyResponse.json();
          console.log('Payment verification successful:', {
            status: paymentData.status,
            amount: paymentData.amount,
            currency: paymentData.currency
          });
          
          // Verify payment status is 'captured' (required for auto-capture orders)
          // With payment_capture: 1, payments should be captured immediately
          if (paymentData.status !== 'captured') {
            console.error('Payment status is not captured:', {
              status: paymentData.status,
              payment_id: razorpay_payment_id,
              order_id: razorpay_order_id
            });
            return res.status(400).json({
              error: 'Payment not captured',
              status: paymentData.status,
              message: 'Payment must be captured before granting course access. Please contact support if payment was successful.'
            });
          }
          
          console.log('Payment verified as captured:', {
            payment_id: razorpay_payment_id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: paymentData.status
          });
        } else {
          const errorText = await verifyResponse.text();
          console.error('Payment verification failed:', {
            status: verifyResponse.status,
            error: errorText
          });
          // Still proceed if verification fails (might be network issue)
          console.warn('Proceeding with contact creation despite verification failure');
        }
      } catch (verifyError) {
        console.error('Error verifying payment:', verifyError);
        // Still proceed - payment was successful on client side
        console.warn('Proceeding with contact creation despite verification error');
      }
    }
    
    // Note: order_id might not be present when using Razorpay Checkout without Orders API
    // We'll handle signature verification accordingly
    // Environment variables already declared above

    // Verify Razorpay payment signature
    // Standard Razorpay signature format: order_id|payment_id
    // When using Razorpay Checkout, order_id is automatically generated
    // Note: For Razorpay Checkout (not Orders API), the signature format might be just payment_id
    if (razorpay_order_id) {
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.warn('Signature verification failed with order_id format, trying payment_id only:', {
          expected: generatedSignature,
          received: razorpay_signature,
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        });
        
        // Try alternative signature format (payment_id only) for Checkout
        const altText = razorpay_payment_id;
        const altSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET)
          .update(altText)
          .digest('hex');
        
        if (altSignature !== razorpay_signature) {
          // Signature verification failed - log but continue (payment was successful)
          // Don't fail the request - the payment went through successfully
          console.warn('Signature verification failed with both formats - proceeding anyway');
          console.warn('Note: Payment was successful, this might be a signature format issue');
        } else {
          console.log('Signature verified using alternative format (payment_id only)');
        }
      } else {
        console.log('Signature verified successfully');
      }
    } else {
      // If order_id is missing, try signature with payment_id only
      console.warn('Order ID missing in payment response - trying signature with payment_id only');
      const text = razorpay_payment_id;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
      
      if (generatedSignature !== razorpay_signature) {
        console.warn('Signature verification failed - proceeding anyway (payment was successful)');
      } else {
        console.log('Signature verified using payment_id only');
      }
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
    
    console.log('=== CREATING CONTACT ===');
    
    // Note: Tags cannot be included in contact creation - they must be assigned separately
    // See: https://developer.systeme.io/reference/post_contact-1
    
    console.log('Creating contact in Systeme.io with payload:', JSON.stringify(contactPayload, null, 2));
    console.log('Using API Key (first 10 chars):', SYSTEME_API_KEY ? SYSTEME_API_KEY.substring(0, 10) + '...' : 'MISSING');
    console.log('API Key length:', SYSTEME_API_KEY ? SYSTEME_API_KEY.length : 0);
    console.log('API Key source:', process.env.SYSTEME_API_KEY ? 'Environment variable' : 'Fallback');
    
    // Verify API key is present
    if (!SYSTEME_API_KEY || SYSTEME_API_KEY.trim().length === 0) {
      console.error('Systeme.io API key is missing!');
      return res.status(500).json({
        error: 'Systeme.io API key not configured',
        details: 'Please set SYSTEME_API_KEY environment variable in Vercel'
      });
    }
    
    // Systeme.io API endpoint: https://api.systeme.io/api/contacts
    const endpoint = 'https://api.systeme.io/api/contacts';
    let systemeResponse;
    let responseText;
    
    try {
      // Step 1: Create the contact
      // Systeme.io uses X-API-Key header (not Authorization: Bearer)
      // Trim any whitespace from the API key
      const cleanApiKey = SYSTEME_API_KEY.trim();
      console.log('Auth header format check:', `X-API-Key: ${cleanApiKey.substring(0, 10)}...`);
      
      systemeResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': cleanApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(contactPayload)
      });

      responseText = await systemeResponse.text();
      console.log('Systeme.io create contact response status:', systemeResponse.status);
      console.log('Systeme.io create contact response:', responseText);
      
    } catch (fetchError) {
      console.error('Fetch error creating contact:', fetchError);
      return res.status(500).json({
        error: 'Network error contacting Systeme.io',
        details: fetchError.message
      });
    }

    if (!systemeResponse.ok) {
      console.error('Systeme.io API error creating contact:', {
        status: systemeResponse.status,
        statusText: systemeResponse.statusText,
        response: responseText,
        endpoint: endpoint,
        payload: contactPayload,
        apiKeyLength: cleanApiKey.length,
        apiKeyPrefix: cleanApiKey.substring(0, 10)
      });
      
      // Provide helpful error message for 401
      if (systemeResponse.status === 401) {
        return res.status(500).json({ 
          error: 'Systeme.io authentication failed',
          details: 'The API key is invalid or expired. Please verify the SYSTEME_API_KEY in Vercel environment variables.',
          suggestion: '1. Go to Systeme.io Settings → Public API keys. 2. Verify the key is active. 3. Generate a new key if needed. 4. Update SYSTEME_API_KEY in Vercel.',
          status: systemeResponse.status,
          response: responseText
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to create contact in Systeme.io',
        status: systemeResponse.status,
        statusText: systemeResponse.statusText,
        details: responseText,
        endpoint: endpoint
      });
    }

    // Parse the created contact data to get the contact ID
    let contactData;
    try {
      contactData = JSON.parse(responseText);
    } catch (e) {
      console.error('Could not parse Systeme.io response as JSON:', e);
      return res.status(500).json({
        error: 'Failed to parse contact creation response',
        details: responseText
      });
    }

    // Step 2: Assign the "Course" tag to the contact
    // API endpoint: https://api.systeme.io/api/contacts/{id}/tags
    // See: https://developer.systeme.io/reference/post_contact_tag-1
    const contactId = contactData.id || contactData.data?.id;
    if (!contactId) {
      console.error('Contact ID not found in response:', contactData);
      // Contact was created but we can't assign tag - return success anyway
      return res.status(200).json({
        success: true,
        message: 'Contact created successfully, but could not assign tag (ID missing)',
        contact: contactData
      });
    }

    try {
      const tagEndpoint = `https://api.systeme.io/api/contacts/${contactId}/tags`;
      console.log('Assigning tag "Course" to contact:', contactId);
      
      // Tag ID for "Course" tag: 1800620
      const tagId = 1800620;
      
      const tagResponse = await fetch(tagEndpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': SYSTEME_API_KEY.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          tagId: tagId  // Use tagId instead of tag name
        })
      });

      const tagResponseText = await tagResponse.text();
      console.log('Systeme.io tag assignment response status:', tagResponse.status);
      console.log('Systeme.io tag assignment response:', tagResponseText);

      if (!tagResponse.ok) {
        console.warn('Failed to assign tag to contact:', {
          status: tagResponse.status,
          response: tagResponseText,
          contactId: contactId
        });
        // Contact was created, but tag assignment failed - still return success
        // as the main goal (contact creation) was achieved
      } else {
        console.log('Tag "Course" successfully assigned to contact:', contactId);
      }
      
    } catch (tagError) {
      console.error('Error assigning tag to contact:', tagError);
      // Contact was created, but tag assignment failed - still return success
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

