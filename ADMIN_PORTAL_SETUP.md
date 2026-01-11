# Admin Portal Setup Guide

## Overview

The Admin Portal allows you to manage course modules, lessons, and resources without code changes.

- **Admin URL**: `https://www.theorganicbuzz.com/admin`
- **Login**: `/admin/login`

## Setup Steps

### 1. Run Database Migrations

Go to your Supabase project → SQL Editor and run the contents of:

```
supabase/admin-schema.sql
```

This creates:
- `modules` table - for course modules
- `lessons` table - for lessons within modules  
- `resources` table - for links, documents, etc.
- `admin_sessions` table - for admin authentication

### 2. Add Environment Variables to Vercel

Go to Vercel → Your Project → Settings → Environment Variables and add:

```
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=generate-a-random-string-here
```

To generate a JWT_SECRET, run:
```bash
openssl rand -base64 32
```

### 3. Redeploy

After adding environment variables, redeploy the project for changes to take effect.

## Using the Admin Portal

### Login
1. Go to `/admin/login`
2. Enter the admin email and password you configured

### Managing Modules
1. Click "New Module" to create a module
2. Use up/down arrows to reorder modules
3. Click "Edit" to modify a module and manage its lessons
4. Click the trash icon to delete a module (this also deletes all its lessons)

### Managing Lessons
1. From a module's edit page, click "Add Lesson"
2. Click "Edit" on a lesson to:
   - Update title and description
   - Add/change the Loom video URL (paste share or embed URL)
   - Set status (Available, Coming Soon, Draft)
   - Add resources (links, documents, etc.)
3. Use up/down arrows to reorder lessons

### Adding Videos
1. Record your video on Loom
2. Copy the share URL (e.g., `https://www.loom.com/share/abc123...`)
3. Paste it in the Loom URL field - it will automatically convert to embed format
4. The preview will show how the video looks

### Managing Resources
Resources are links attached to lessons:
- **Types**: Link, Whimsical, Google Drive, Google Doc, Notion, File
- Each resource needs a title and URL
- Resources appear below the lesson video

## How It Works

- If the database tables are empty, the course falls back to static data (`src/constants/courseData.js`)
- Once you add content via the admin portal, the course uses the database
- Changes are reflected immediately (with 5-minute cache on the frontend)

## Troubleshooting

### "Supabase not configured" error
- Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel

### "Invalid credentials" on login
- Double-check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel environment variables
- Remember these are case-sensitive

### Changes not showing
- The frontend caches course data for 5 minutes
- Hard refresh (Ctrl+Shift+R) or wait a few minutes

### Database tables don't exist
- Make sure you ran the `supabase/admin-schema.sql` script in Supabase SQL Editor

