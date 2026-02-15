# Quick Stripe Setup (Existing Account)

Since you already have a Stripe account, follow these quick steps to get payments working:

---

## ⚡ Quick Start (5 minutes)

### Step 1: Get Your API Keys (1 min)

1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right should be ON)
3. Click **Developers** → **API keys**
4. Copy your **Secret key** (starts with `sk_test_...`)
   - Click the eye icon to reveal it
   - Click to copy

---

### Step 2: Create Products & Prices (2 min)

#### Create Standard Tier:
1. Go to **Products** → Click **Add product**
2. Fill in:
   - **Name**: `Strata Management - Standard`
   - **Description**: `For strata organizations with up to 100 units`
   - **Pricing**: Click **Add pricing**
     - **Price**: `79.95`
     - **Currency**: `CAD`
     - **Billing period**: `Monthly`
     - **Payment type**: `Recurring`
3. Click **Add product**
4. **COPY THE PRICE ID** from the pricing section (starts with `price_...`)
   - You'll see it listed under "Pricing" → Click on it → Copy the ID

#### Create Premium Tier:
1. Click **Add product** again
2. Fill in:
   - **Name**: `Strata Management - Premium`
   - **Description**: `For strata organizations with unlimited units`
   - **Pricing**: Click **Add pricing**
     - **Price**: `129.95`
     - **Currency**: `CAD`
     - **Billing period**: `Monthly`
     - **Payment type**: `Recurring`
3. Click **Add product**
4. **COPY THE PRICE ID** (starts with `price_...`)

---

### Step 3: Enable Customer Portal (1 min)

1. Go to **Settings** → **Billing**
2. Scroll to **Customer portal**
3. Click **Activate**
4. In the configuration:
   - ✅ Check "Allow customers to update payment methods"
   - ✅ Check "Allow customers to cancel subscriptions"
   - ✅ Check "Allow customers to view invoices"
5. Click **Save changes**

---

### Step 4: Create `.env` File (1 min)

In your project root `C:\Users\User 1\OneDrive\Desktop\Strata Management Application\`, create a `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_STANDARD_PRICE_ID=price_YOUR_STANDARD_PRICE_ID
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID

# App Configuration
APP_URL=http://localhost:5000

# Webhook Secret (will add this after Step 5)
STRIPE_WEBHOOK_SECRET=
```

**Replace**:
- `sk_test_YOUR_SECRET_KEY_HERE` with your actual secret key from Step 1
- `price_YOUR_STANDARD_PRICE_ID` with the Standard tier price ID
- `price_YOUR_PREMIUM_PRICE_ID` with the Premium tier price ID

---

### Step 5: Install & Run Stripe CLI (Optional but Recommended)

This is needed for webhook testing in development:

#### Windows:
```powershell
# If you have Scoop package manager:
scoop install stripe

# Or download installer from:
# https://github.com/stripe/stripe-cli/releases/latest
```

#### Mac:
```bash
brew install stripe/stripe-cli/stripe
```

#### Login and Start Webhook Forwarding:
```bash
# Login to Stripe
stripe login

# Start forwarding webhooks to your local server
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

**Copy the webhook signing secret** from the output (starts with `whsec_...`) and add it to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

---

### Step 6: Restart Your Dev Server

Since you added environment variables, restart the server:

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd "C:\Users\User 1\OneDrive\Desktop\Strata Management Application"
npm run dev
```

You should see:
```
✅ Stripe payment routes registered at /api/stripe
```

---

## 🧪 Quick Test (2 minutes)

### Test the Complete Flow:

1. **Open the app**: http://localhost:5000
2. **Login** (or create a test strata if needed)
3. **Navigate to Billing**: Click "Billing" in the sidebar
4. **Click "Add Payment Method"**
   - Should redirect to Stripe Checkout
   - Should show "30-day trial" message

5. **Enter test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Name: Your name
   - Email: Your email

6. **Complete checkout**
   - Should redirect back to app
   - Should show:
     - Status: **Trial** (blue badge)
     - **30 days** remaining
     - Message: "You can cancel anytime without being charged"

7. **Test Cancellation**:
   - Click "Cancel Subscription"
   - Confirm
   - Should see success message
   - **No charge will occur!**

---

## ✅ Success Checklist

- [ ] API keys copied and added to `.env`
- [ ] Standard product created with price ID
- [ ] Premium product created with price ID
- [ ] Customer portal activated
- [ ] `.env` file created with all keys
- [ ] Dev server restarted successfully
- [ ] Stripe CLI installed (optional)
- [ ] Webhook forwarding running (optional)
- [ ] Test checkout completed
- [ ] Trial period shows 30 days
- [ ] Cancellation works without charge

---

## 🎉 You're Done!

Your payment system is now ready to accept test payments.

### What Happens Next?

1. **During Trial (30 days)**:
   - User has full access
   - No charges occur
   - Can cancel anytime = $0 charge
   - 3 days before trial ends = automatic email reminder

2. **After Trial Ends**:
   - Stripe automatically charges the saved card
   - User becomes "Active" subscriber
   - Billing continues monthly
   - Can still cancel anytime (cancels at end of period)

### Monitoring

View everything in your Stripe Dashboard:
- **Home**: Revenue overview
- **Payments**: All transactions
- **Customers**: All subscribers
- **Subscriptions**: Active/cancelled subscriptions
- **Webhooks**: Event logs

---

## 💡 Pro Tips

### Customize Trial Period
Want 14 days instead of 30? Edit `server/stripe-config.ts`:
```typescript
TRIAL_DAYS: 14, // Change from 30 to 14
```

### Test Failed Payments
Use card: `4000 0000 0000 0341` (declined)

### Test 3D Secure
Use card: `4000 0025 0000 3155` (requires authentication)

### View Webhook Events
While `stripe listen` is running, you'll see all events in real-time:
```
--> checkout.session.completed
--> customer.subscription.created
--> invoice.payment_succeeded
```

---

## 🚀 Going Live

When ready for production:

1. Switch to **Live Mode** in Stripe Dashboard
2. Create the same 2 products in Live Mode
3. Get **Live API keys** (start with `sk_live_...`)
4. Update production environment variables
5. Set up production webhook endpoint
6. Test with a real card
7. You're live! 🎉

---

## ❓ Need Help?

**Common Issues**:
- **"Stripe is not configured"**: Check `.env` file has correct keys and restart server
- **Webhook events not working**: Make sure `stripe listen` is running
- **Redirect fails**: Check `APP_URL` in `.env` matches your local URL

**Full documentation**: See `STRIPE_SETUP_GUIDE.md` for complete details

---

**Questions?** Just ask! 🙋‍♂️
