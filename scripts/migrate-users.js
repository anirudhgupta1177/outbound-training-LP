/**
 * Migration Script: Import existing users to Supabase
 * 
 * Run with: node scripts/migrate-users.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://ldgtuzxzjrkloimayyid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3R1enh6anJrbG9pbWF5eWlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg5MjA3OCwiZXhwIjoyMDgzNDY4MDc4fQ.x6ZquyfGdUZIBruMUgnmMi-d5Sc2H0te2hDR7qBXM0o';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Users to migrate
const usersToMigrate = [
  'bettersouvik@gmail.com',
  'ak8140d@gmail.com',
  'abrarkazi533@gmail.com',
  'chirag@lstleadgen.com',
  'tayyebanoor111@gmail.com',
  'ansh.bindal1996@gmail.com',
  'ayushkr7894@gmail.com',
  'ashwinkedarpawar2005@gmail.com',
  'saransh@sahaita.in',
  'davesales91@gmail.com',
  'hi@shivadudigama.com',
  'rahulchandan1991@gmail.com',
  'Parthjasrapuria2@gmail.com',
  'eshanrathi0702@gmail.com',
];

// Generate random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email
async function sendWelcomeEmail(email, password) {
  if (!RESEND_API_KEY) {
    console.log(`  ⚠️  No RESEND_API_KEY - skipping email for ${email}`);
    console.log(`     Password: ${password}`);
    return false;
  }

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
                🎉 Your New Course Platform is Ready!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Great news! We've upgraded the Outbound Mastery course to a brand new platform with a better learning experience.
              </p>
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Here are your new login credentials:
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
                ⚠️ Please save this password somewhere safe. You can change it anytime from your account.
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
              
              <!-- What's New -->
              <div style="border-top: 1px solid #333; padding-top: 24px; margin-top: 10px;">
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 16px;">What's New?</p>
                <ul style="color: #e5e5e5; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                  <li>Better video player experience</li>
                  <li>Track your progress across devices</li>
                  <li>All resources in one place</li>
                  <li>Faster loading times</li>
                </ul>
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

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Outbound Mastery <course@theorganicbuzz.com>',
        to: [email],
        subject: '🎉 Your New Outbound Mastery Platform is Ready!',
        html: emailHtml,
      }),
    });

    if (response.ok) {
      console.log(`  ✅ Email sent to ${email}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`  ❌ Failed to send email to ${email}: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error sending email to ${email}: ${error.message}`);
    return false;
  }
}

// Main migration function
async function migrateUsers() {
  console.log('🚀 Starting user migration...\n');
  
  // Initialize Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  for (const email of usersToMigrate) {
    console.log(`\n📧 Processing: ${email}`);
    
    // Generate password
    const password = generatePassword(12);
    
    try {
      // Create user in Supabase
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password,
        email_confirm: true,
        user_metadata: {
          migrated_from: 'systeme.io',
          migrated_at: new Date().toISOString(),
        }
      });

      if (userError) {
        if (userError.message.includes('already been registered')) {
          console.log(`  ⏭️  User already exists, skipping`);
          results.skipped.push({ email, reason: 'already exists' });
          continue;
        }
        throw userError;
      }

      console.log(`  ✅ Supabase user created: ${userData.user.id}`);

      // Initialize progress record
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userData.user.id,
          completed_lessons: [],
          current_lesson: null,
        });

      if (progressError && !progressError.message.includes('duplicate')) {
        console.log(`  ⚠️  Progress record error: ${progressError.message}`);
      }

      // Send welcome email
      await sendWelcomeEmail(email, password);

      results.success.push({ email, password });

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.failed.push({ email, error: error.message });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully migrated: ${results.success.length}`);
  console.log(`⏭️  Skipped (already exist): ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.success.length > 0) {
    console.log('\n📝 Credentials for successfully migrated users:');
    console.log('-'.repeat(50));
    for (const user of results.success) {
      console.log(`${user.email}: ${user.password}`);
    }
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed migrations:');
    for (const user of results.failed) {
      console.log(`${user.email}: ${user.error}`);
    }
  }
}

// Run migration
migrateUsers().catch(console.error);

