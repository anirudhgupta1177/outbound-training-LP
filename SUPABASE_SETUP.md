# Supabase Setup Guide

Follow these steps to set up Supabase for the course platform.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `outbound-course` (or any name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup (~2 minutes)

## 2. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **Settings**
4. Under "Email Auth":
   - **Enable email confirmations**: Turn OFF (so auto-generated passwords work immediately)
   - **Enable email change confirmations**: Keep ON
5. Under "Password":
   - Set minimum password length to 8
6. Save changes

## 3. Run Database Schema

1. Go to **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" (or Cmd/Ctrl + Enter)
5. You should see "Success" message

## 4. Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

## 5. Add Environment Variables

### Local Development (.env file)
Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel Production
Add these environment variables in Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

## 6. Configure Password Reset URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://www.theorganicbuzz.com`
3. Add to **Redirect URLs**:
   - `https://www.theorganicbuzz.com/reset-password`
   - `http://localhost:5173/reset-password` (for local dev)
4. Save changes

## Done!

Your Supabase backend is now configured. The course platform will:
- Create users automatically after payment
- Store login credentials securely
- Track lesson progress per user
- Allow password resets via email

