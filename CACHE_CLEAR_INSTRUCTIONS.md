# Currency Display - Cache Clear Instructions

## If prices still show INR after changes:

### Step 1: Hard Refresh Browser
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`

### Step 2: Clear Browser Cache Completely
1. Open DevTools (F12)
2. Right-click the refresh button (next to address bar)
3. Select "Empty Cache and Hard Reload"

### Step 3: Verify URL Parameter
Make sure your URL includes `?country=US`:
```
https://www.theorganicbuzz.com/?country=US
```

### Step 4: Check Console Logs
After refreshing, open the browser console (F12 → Console tab) and look for:
- ✅ `🌍 TEST MODE: Using country from URL parameter: US`
- ✅ `💰 PricingContext updated - Currency: USD Price: $97 Country: US`
- ✅ `✅ ValueStack rendered - Currency: USD displayPrice: $97`
- ✅ `✅ CompleteSystem rendered - Currency: USD displayPrice: $97`

### Step 5: Verify Pricing
Check these sections show USD:
- Hero CTA button: Should show `$97`
- Value Stack: Should show `$2,999` → `$97`
- Module values: Should show `$181`, `$36`, etc. (not ₹15,000, ₹3,000)
- Checkout page: Should show `$97` and Razorpay in USD

### If Still Showing INR:
1. **Wait 2-3 minutes** - Vercel may need to rebuild
2. **Check Vercel Dashboard** - Verify deployment completed
3. **Try Incognito/Private Window** - Rules out cache completely
4. **Check Network Tab** - Verify you're loading the latest JS bundle (check file timestamps)

### Alternative Testing Method:
Use localStorage override (more reliable than URL params):
```javascript
// Open browser console (F12) and run:
localStorage.setItem('testCountry', 'US');
location.reload();
```

To reset back to India:
```javascript
localStorage.removeItem('testCountry');
location.reload();
```

