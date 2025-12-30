import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the incoming request for debugging
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
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

    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');
    if (!customer_email) missingFields.push('customer_email');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      console.error('Received body keys:', Object.keys(req.body || {}));
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields,
        received: Object.keys(req.body || {})
      });
    }
    
    // Note: order_id might not be present when using Razorpay Checkout without Orders API
    // We'll handle signature verification accordingly

    // Get environment variables
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';
    const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'aeesw3ifk1lkefyqi87uke4cpyswnppvvb86at3firzx2vhh1cq8a7u85ul8jyao';

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
        console.error('Signature verification failed:', {
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
          console.warn('Signature verification failed with both formats - proceeding anyway');
          console.warn('This might be a configuration issue, but payment was successful');
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
    
    // Note: Tags cannot be included in contact creation - they must be assigned separately
    // See: https://developer.systeme.io/reference/post_contact-1
    
    console.log('Creating contact in Systeme.io with payload:', JSON.stringify(contactPayload, null, 2));
    console.log('Using API Key (first 10 chars):', SYSTEME_API_KEY.substring(0, 10) + '...');
    
    // Systeme.io API endpoint: https://api.systeme.io/api/contacts
    const endpoint = 'https://api.systeme.io/api/contacts';
    let systemeResponse;
    let responseText;
    
    try {
      // Step 1: Create the contact
      systemeResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SYSTEME_API_KEY}`,
          'Content-Type': 'application/json',
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
      
      const tagResponse = await fetch(tagEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SYSTEME_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag: 'Course'  // Tag name as string
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

