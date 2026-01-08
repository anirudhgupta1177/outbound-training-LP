import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Generate a random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the incoming request for debugging
    console.log('=== REQUEST RECEIVED ===');
    console.log('Method:', req.method);
    
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

    // Validate required fields
    const missingFields = [];
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!customer_email) missingFields.push('customer_email');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields,
        received: Object.keys(bodyData || {})
      });
    }
    
    console.log('=== VALIDATION PASSED ===');
    
    // Get environment variables
    const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Rqg7fNmYIF1Bbb';
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'AQToxDjz8WRYHvSbmcmzkgWo';
    const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'aeesw3ifk1lkefyqi87uke4cpyswnppvvb86at3firzx2vhh1cq8a7u85ul8jyao';
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    // Verify payment with Razorpay API
    if (razorpay_payment_id) {
      try {
        console.log('Verifying payment with Razorpay API:', razorpay_payment_id);
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
          
          if (paymentData.status !== 'captured') {
            console.error('Payment status is not captured:', paymentData.status);
            return res.status(400).json({
              error: 'Payment not captured',
              status: paymentData.status,
              message: 'Payment must be captured before granting course access.'
            });
          }
        } else {
          const errorText = await verifyResponse.text();
          console.error('Payment verification failed:', errorText);
          console.warn('Proceeding with contact creation despite verification failure');
        }
      } catch (verifyError) {
        console.error('Error verifying payment:', verifyError);
        console.warn('Proceeding with contact creation despite verification error');
      }
    }

    // ============================================
    // STEP 1: Create Supabase user
    // ============================================
    let supabaseUser = null;
    let generatedPassword = null;
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      console.log('=== CREATING SUPABASE USER ===');
      
      try {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Generate a password for the user
        generatedPassword = generatePassword(12);
        
        // Create the user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: customer_email,
          password: generatedPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: customer_first_name || '',
            last_name: customer_last_name || '',
            phone: customer_phone || '',
            payment_id: razorpay_payment_id,
          }
        });
        
        if (userError) {
          // Check if user already exists
          if (userError.message.includes('already been registered')) {
            console.log('User already exists, skipping Supabase user creation');
          } else {
            console.error('Error creating Supabase user:', userError);
          }
        } else {
          supabaseUser = userData.user;
          console.log('Supabase user created:', supabaseUser.id);
          
          // Initialize user progress record
          const { error: progressError } = await supabaseAdmin
            .from('user_progress')
            .insert({
              user_id: supabaseUser.id,
              completed_lessons: [],
              current_lesson: null,
            });
          
          if (progressError && !progressError.message.includes('duplicate')) {
            console.error('Error creating progress record:', progressError);
          } else {
            console.log('User progress record initialized');
          }
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Continue with Systeme.io even if Supabase fails
      }
    } else {
      console.log('Supabase credentials not configured, skipping user creation');
    }

    // ============================================
    // STEP 2: Send Welcome Email via Resend
    // ============================================
    if (RESEND_API_KEY && generatedPassword) {
      console.log('=== SENDING WELCOME EMAIL ===');
      
      try {
        const loginUrl = 'https://www.theorganicbuzz.com/login';
        const courseUrl = 'https://www.theorganicbuzz.com/course';
        
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 16px; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; background: linear-gradient(to right, #60a5fa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Welcome to Outbound Mastery! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${customer_first_name || 'there'},
              </p>
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for purchasing Outbound Mastery! Your course access is now ready. Here are your login credentials:
              </p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #333; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Email</p>
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px;">${customer_email}</p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Password</p>
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background: #0a0a0a; padding: 8px 12px; border-radius: 6px; display: inline-block;">${generatedPassword}</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
                ⚠️ Please save this password somewhere safe. You can change it anytime from your account settings.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${loginUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #2563eb, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px;">
                      Access Your Course →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- What's Next -->
              <div style="border-top: 1px solid #333; padding-top: 24px; margin-top: 10px;">
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 16px;">What's Next?</p>
                <ol style="color: #e5e5e5; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                  <li>Log in using the credentials above</li>
                  <li>Start with the Welcome video</li>
                  <li>Work through Module 1 to define your ICP</li>
                  <li>Join the WhatsApp community for support</li>
                </ol>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #333;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px;">
                Need help? Reply to this email or contact us at <a href="mailto:anirudh@theorganicbuzz.com" style="color: #60a5fa;">anirudh@theorganicbuzz.com</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2026 The Organic Buzz. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Outbound Mastery <course@theorganicbuzz.com>',
            to: [customer_email],
            subject: '🎉 Your Outbound Mastery Access is Ready!',
            html: emailHtml,
          }),
        });
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log('Welcome email sent successfully:', emailData.id);
        } else {
          const emailError = await emailResponse.text();
          console.error('Failed to send welcome email:', emailError);
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue even if email fails
      }
    } else {
      console.log('Resend not configured or no password generated, skipping welcome email');
    }

    // ============================================
    // STEP 3: Create contact in Systeme.io (keep existing flow)
    // ============================================
    console.log('=== CREATING SYSTEME.IO CONTACT ===');
    
    const contactPayload = {
      email: customer_email,
      first_name: customer_first_name || '',
      last_name: customer_last_name || '',
    };
    
    if (customer_phone) {
      contactPayload.phone = customer_phone;
    }
    
    if (!SYSTEME_API_KEY || SYSTEME_API_KEY.trim().length === 0) {
      console.warn('Systeme.io API key not configured, skipping');
    } else {
      try {
        const endpoint = 'https://api.systeme.io/api/contacts';
        const cleanApiKey = SYSTEME_API_KEY.trim();
        
        const systemeResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'X-API-Key': cleanApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(contactPayload)
        });

        const responseText = await systemeResponse.text();
        console.log('Systeme.io response status:', systemeResponse.status);
        
        if (systemeResponse.ok) {
          const contactData = JSON.parse(responseText);
          const contactId = contactData.id || contactData.data?.id;
          
          // Assign "Course" tag
          if (contactId) {
            const tagResponse = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
              method: 'POST',
              headers: {
                'X-API-Key': cleanApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ tagId: 1800620 })
            });
            console.log('Tag assignment status:', tagResponse.status);
          }
        } else {
          console.error('Systeme.io error:', responseText);
        }
      } catch (systemeError) {
        console.error('Systeme.io error:', systemeError);
        // Continue even if Systeme.io fails
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      supabaseUser: supabaseUser ? { id: supabaseUser.id, email: supabaseUser.email } : null,
      emailSent: !!RESEND_API_KEY && !!generatedPassword,
    });

  } catch (error) {
    console.error('Error in create-contact:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
