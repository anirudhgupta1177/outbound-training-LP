# Currency Testing Instructions

## Quick Test Steps:

1. **Clear all caches first:**
   - Open browser console (F12)
   - Run: `sessionStorage.clear(); localStorage.clear();`
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Test USD pricing:**
   - Add `?country=US` to URL: `https://www.theorganicbuzz.com/?country=US`
   - Press Enter to navigate (full page reload)
   - Check console for: `🌍 TEST MODE: Using country from URL parameter: US`
   - Check console for: `💰 Pricing Config: { currency: 'USD', ... }`

3. **What to check:**
   - Hero section CTA: Should show `$97`
   - Value Stack section: Should show `$2,999` (original), `$97` (current)
   - Module values: Should show `$181`, `$36`, `$60`, etc. instead of ₹15,000, ₹3,000, ₹5,000
   - CompleteSystem section: All module values should be in USD
   - Checkout page: Should show `$97` and Razorpay should use USD currency
   - Instructor section: Should show `$506K` instead of `₹4.2 Cr`
   - Testimonials section: Should show `$506K` instead of `₹4.2Cr+`

4. **If still showing INR:**
   - Check browser console for errors
   - Verify URL has `?country=US` (case sensitive)
   - Run in console: `localStorage.setItem('testCountry', 'US'); location.reload();`
   - Check console logs for currency detection

