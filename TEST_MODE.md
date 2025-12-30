# Test Mode Instructions

## How to Enable ₹1 Test Payment

To test the payment flow with ₹1 instead of ₹4,126, you need to set an environment variable.

### For Local Development:

1. Create or edit `.env.local` file in the root directory
2. Add this line:
   ```
   VITE_TEST_MODE=true
   ```
3. Restart your dev server (`npm run dev`)

### For Vercel Deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add a new variable:
   - **Key:** `VITE_TEST_MODE`
   - **Value:** `true`
   - **Environments:** Select all (Production, Preview, Development)
3. Click **Save**
4. **Redeploy** your application

### To Disable Test Mode:

- Set `VITE_TEST_MODE=false` or remove the variable entirely
- Redeploy

## What Test Mode Does:

- Changes payment amount from ₹4,126 (₹3,497 + ₹629 GST) to ₹1
- Updates cart summary to show "Test Price: ₹1 (Test Mode)"
- Still creates contact in Systeme.io after payment
- Still verifies Razorpay payment signature

## Testing Checklist:

- [ ] Enable test mode
- [ ] Complete a ₹1 test payment
- [ ] Verify payment is successful
- [ ] Check Vercel function logs (`/api/create-contact`)
- [ ] Verify contact created in Systeme.io with "Course" tag
- [ ] Disable test mode when done testing

