# Geo-Based Pricing Testing Guide

## How to Check Your Current Country Detection

### Method 1: Browser Console
1. Open your website
2. Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools
3. Go to the **Console** tab
4. Look for messages like:
   - `🌍 Detected country: IN` (for India)
   - `🌍 Detected country: US` (for United States)
   - `💰 Pricing: { currency: 'INR', price: '₹3,497', ... }`

### Method 2: Check Prices on the Page
- **India pricing**: Should show `₹3,497` + GST
- **International pricing**: Should show `$97` (no GST)

Look for prices in these sections:
- Hero section CTA button
- Value Stack section (main pricing card)
- Mobile sticky CTA (bottom of page on mobile)
- Checkout page

---

## How to Test Different Countries

### Option 1: URL Parameter (Easiest)
Add `?country=XX` to your website URL:

**Test India pricing:**
```
https://www.theorganicbuzz.com/?country=IN
```

**Test International pricing (US example):**
```
https://www.theorganicbuzz.com/?country=US
```

**To reset (remove parameter):**
```
https://www.theorganicbuzz.com/
```

### Option 2: Browser Console (Manual Override)
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Run these commands:

**Set to India:**
```javascript
localStorage.setItem('testCountry', 'IN');
location.reload();
```

**Set to United States:**
```javascript
localStorage.setItem('testCountry', 'US');
location.reload();
```

**Clear override (use actual detection):**
```javascript
localStorage.removeItem('testCountry');
location.reload();
```

### Option 3: VPN (Real Testing)
1. Install a VPN extension (e.g., TunnelBear, NordVPN)
2. Connect to a server in India → Should show ₹3,497
3. Connect to a server in USA/UK/etc → Should show $97
4. Refresh the page after connecting

### Option 4: Clear Cache and Test
The country detection is cached in `sessionStorage`. To clear:
1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Session Storage** → Your domain
4. Delete the `detectedCountry` key
5. Refresh the page

---

## Expected Results

### India (IN):
- Currency: `₹` (Indian Rupee)
- Base Price: `₹3,497`
- GST: `18%` (shown as "+ GST")
- Total: `₹4,127` (₹3,497 + ₹630 GST)
- Original Price: `₹43,999`

### International (US, UK, etc.):
- Currency: `$` (US Dollar)
- Base Price: `$97`
- GST: `None` (not shown)
- Total: `$97`
- Original Price: `$99`

---

## Troubleshooting

### If prices are not updating:
1. **Clear sessionStorage**: Run `sessionStorage.clear()` in console
2. **Clear localStorage**: Run `localStorage.clear()` in console
3. **Check console errors**: Look for any API errors
4. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### If API returns 403:
- This is expected with ip-api.com free tier
- The site will default to India pricing (₹3,497)
- This is a fallback behavior and works correctly

### Testing Checklist:
- [ ] Page loads without errors
- [ ] Console shows detected country
- [ ] Prices match expected currency
- [ ] GST shown for India, not for international
- [ ] URL parameter override works
- [ ] localStorage override works
- [ ] Clearing cache resets to actual detection

---

## Quick Test Commands (Copy-Paste)

**Force India pricing:**
```
localStorage.setItem('testCountry', 'IN'); location.reload();
```

**Force US pricing:**
```
localStorage.setItem('testCountry', 'US'); location.reload();
```

**Check current country in console:**
```
JSON.parse(sessionStorage.getItem('detectedCountry') || '"IN"')
```

**Clear all test data:**
```
sessionStorage.clear(); localStorage.removeItem('testCountry'); location.reload();
```

