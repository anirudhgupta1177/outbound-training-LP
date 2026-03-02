# Cloudflare Worker Proxy for Supabase

This guide explains how to deploy a Cloudflare Worker to proxy Supabase requests, which helps users in regions where Supabase is blocked (e.g., India).

## Why Use a Proxy?

Some ISPs or government policies may block access to Supabase domains. By routing requests through Cloudflare Workers, users connect to Cloudflare's global network instead of directly to Supabase, bypassing these restrictions.

## Deployment Options

### Option 1: Cloudflare Dashboard (Quick & Easy)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create Application** → **Create Worker**
3. Name your worker (e.g., `supabase-proxy`)
4. Click **Deploy**
5. After deployment, click **Edit Code**
6. Replace the default code with the contents of `cloudflare-worker/supabase-proxy.js`
7. **Important**: Update `SUPABASE_URL` on line 14 with your actual Supabase project URL:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   ```
8. Click **Save and Deploy**
9. Your worker URL will be something like: `https://supabase-proxy.your-account.workers.dev`

### Option 2: Wrangler CLI (For Developers)

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Navigate to the worker directory:
   ```bash
   cd cloudflare-worker
   ```

4. Update `supabase-proxy.js` line 14 with your Supabase URL:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   ```

5. Deploy:
   ```bash
   wrangler deploy
   ```

6. Your worker URL will be displayed after deployment

## Configure Your App

After deploying the worker, update your environment variables:

### For Local Development

In your `.env` file:
```
VITE_SUPABASE_PROXY_URL=https://supabase-proxy.your-account.workers.dev
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - Key: `VITE_SUPABASE_PROXY_URL`
   - Value: `https://supabase-proxy.your-account.workers.dev`
4. Redeploy your app

## Custom Domain (Recommended for Production)

Using a custom domain provides:
- Professional appearance
- Better caching
- Additional security options

### Steps:

1. In Cloudflare Dashboard, go to **Workers & Pages** → your worker
2. Click **Settings** → **Triggers** → **Add Custom Domain**
3. Enter a subdomain like `api.theorganicbuzz.com`
4. Cloudflare will automatically configure DNS and SSL
5. Update your `VITE_SUPABASE_PROXY_URL` to use the custom domain

## Security Considerations

### CORS Configuration

The default configuration allows requests from any origin (`*`). For production, update the `CORS_HEADERS` in the worker:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://theorganicbuzz.com',
  // ... rest of headers
};
```

### Rate Limiting

Consider adding Cloudflare Rate Limiting rules to prevent abuse:

1. Go to **Security** → **WAF** → **Rate limiting rules**
2. Create a rule for your worker domain
3. Set appropriate thresholds (e.g., 100 requests per minute per IP)

## Testing

1. After deployment, test the proxy by visiting:
   ```
   https://your-worker.workers.dev/rest/v1/
   ```
   You should see a Supabase response (likely an error about missing API key, which confirms the proxy is working).

2. Test authentication by trying to log in to your app.

## Troubleshooting

### "Failed to fetch" errors persist

1. Verify the worker is deployed and accessible
2. Check browser console for CORS errors
3. Ensure `VITE_SUPABASE_PROXY_URL` is set correctly
4. Clear browser cache and try again

### CORS Errors

1. Check that your domain is allowed in `CORS_HEADERS`
2. Verify OPTIONS requests return 204 status
3. Check response headers include CORS headers

### Worker Returns 500 Error

1. Check Cloudflare Workers logs: Dashboard → Workers → your worker → Logs
2. Verify `SUPABASE_URL` is correct
3. Test the Supabase URL directly to ensure it's accessible

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request

This is more than sufficient for most applications. Monitor usage in the Cloudflare dashboard.

## Support

If you encounter issues:
1. Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
2. Review Supabase docs: https://supabase.com/docs
3. Check browser developer tools for specific error messages
