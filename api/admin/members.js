import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../admin-auth.js';

// Generate a random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email via Resend
async function sendWelcomeEmail(email, firstName, password, resendApiKey) {
  const loginUrl = 'https://www.theorganicbuzz.com/login';
  
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
                Hi ${firstName || 'there'},
              </p>
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your course access is now ready. Here are your login credentials:
              </p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #333; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Email</p>
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px;">${email}</p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Password</p>
                    <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background: #0a0a0a; padding: 8px 12px; border-radius: 6px; display: inline-block;">${password}</p>
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
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Outbound Mastery <course@theorganicbuzz.com>',
      to: [email],
      subject: '🎉 Your Outbound Mastery Access is Ready!',
      html: emailHtml,
    }),
  });
  
  return response.ok;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
  const resendApiKey = process.env.RESEND_API_KEY;
  
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
    // GET - List all members
    if (req.method === 'GET') {
      // Get all users from auth.users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (usersError) throw usersError;

      // Get progress data for all users
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, completed_lessons, current_lesson, last_accessed');

      if (progressError) {
        console.error('Progress fetch error:', progressError);
      }

      // Create a map of user_id to progress
      const progressMap = {};
      if (progressData) {
        progressData.forEach(p => {
          progressMap[p.user_id] = p;
        });
      }

      // Combine user data with progress
      const members = users.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        email_confirmed: user.email_confirmed_at ? true : false,
        progress: progressMap[user.id] || null,
        lessons_completed: progressMap[user.id]?.completed_lessons?.length || 0,
        last_accessed: progressMap[user.id]?.last_accessed || null
      }));

      // Sort by created_at descending (newest first)
      members.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({ 
        members,
        total: members.length
      });
    }

    // POST - Create new member or resend email
    if (req.method === 'POST') {
      const { action, email, first_name, last_name, phone, user_id } = req.body;

      // Handle resend email action
      if (action === 'resend') {
        if (!user_id || !email) {
          return res.status(400).json({ error: 'User ID and email are required for resend' });
        }

        // Generate new password
        const newPassword = generatePassword(12);

        // Update user password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
          password: newPassword
        });

        if (updateError) {
          console.error('Error updating password:', updateError);
          return res.status(500).json({ error: 'Failed to update password' });
        }

        // Get user metadata for name
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);
        const firstName = user?.user_metadata?.first_name || '';

        // Send welcome email
        if (resendApiKey) {
          const emailSent = await sendWelcomeEmail(email, firstName, newPassword, resendApiKey);
          if (!emailSent) {
            console.error('Failed to send welcome email');
          }
        }

        return res.status(200).json({ 
          success: true, 
          message: 'New credentials sent to ' + email 
        });
      }

      // Handle create new member
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Generate password
      const generatedPassword = generatePassword(12);

      // Create user in Supabase
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          first_name: first_name || '',
          last_name: last_name || '',
          phone: phone || '',
          added_manually: true
        }
      });

      if (userError) {
        if (userError.message.includes('already been registered')) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
        throw userError;
      }

      // Initialize user progress record
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userData.user.id,
          completed_lessons: [],
          current_lesson: null,
        });

      if (progressError && !progressError.message.includes('duplicate')) {
        console.error('Error creating progress record:', progressError);
      }

      // Send welcome email
      let emailSent = false;
      if (resendApiKey) {
        emailSent = await sendWelcomeEmail(email, first_name, generatedPassword, resendApiKey);
      }

      return res.status(201).json({
        success: true,
        member: {
          id: userData.user.id,
          email: userData.user.email,
          first_name: first_name || '',
          last_name: last_name || '',
          created_at: userData.user.created_at
        },
        emailSent
      });
    }

    // DELETE - Remove member
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Delete user progress first
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', id);

      // Delete user from auth
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Members API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
