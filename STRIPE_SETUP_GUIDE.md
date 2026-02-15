# Stripe Payment Integration Setup & Testing Guide

## Overview

This guide will help you set up and test the complete Stripe payment system for the Strata Management Application, including:
- **30-day free trial** with payment method collection
- **Automatic billing** after trial ends
- **Easy cancellation** anytime during or after trial
- **Subscription management** via Stripe Customer Portal

---

## Prerequisites

1. **Stripe Account**: Create a free account at https://dashboard.stripe.com/register
2. **Node.js & npm** installed
3. **Stripe CLI** (for webhook testing): https://stripe.com/docs/stripe-cli

---

## Part 1: Stripe Dashboard Setup

### Step 1: Get Your API Keys

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy your **Secret key** (starts with `sk_test_...`)
4. Keep this tab open - you'll need it later

### Step 2: Create Product & Pricing

#### Create Standard Tier Product

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: `Strata Management - Standard`
   - **Description**: `Up to 100 units`
   - **Pricing Model**: `Recurring`
   - **Price**: `$49 CAD`
   - **Billing Period**: `Monthly`
   - **Trial Period**: Leave blank (we'll handle this in code)
3. Click **Save Product**
4. **Copy the Price ID** (starts with `price_...`)

#### Create Premium Tier Product

1. Click **Add Product** again
2. Fill in:
   - **Name**: `Strata Management - Premium`
   - **Description**: `Unlimited units`
   - **Pricing Model**: `Recurring`
   - **Price**: `$79 CAD`
   - **Billing Period**: `Monthly`
3. Click **Save Product**
4. **Copy the Price ID** (starts with `price_...`)

### Step 3: Enable Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate link**
3. Configure portal settings:
   - ✅ Allow customers to **update payment methods**
   - ✅ Allow customers to **cancel subscriptions**
   - ✅ Allow customers to **view invoices**
4. Click **Save**

---

## Part 2: Application Configuration

### Step 1: Set Environment Variables

Create a `.env` file in your project root (or update existing one):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_STANDARD_PRICE_ID=price_YOUR_STANDARD_PRICE_ID
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID

# App URL (for redirects)
APP_URL=http://localhost:5000
```

**Important**: Replace the placeholder values with your actual keys from Stripe Dashboard.

### Step 2: Install Stripe CLI (for webhook testing)

**Mac/Linux**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows**:
```powershell
scoop install stripe
```

Or download from: https://github.com/stripe/stripe-cli/releases

### Step 3: Login to Stripe CLI

```bash
stripe login
```

This will open a browser window to authorize the CLI.

---

## Part 3: Webhook Setup

### For Local Testing

1. Start the Stripe webhook forwarding:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

2. Copy the **webhook signing secret** (starts with `whsec_...`)

3. Add it to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

4. Keep the `stripe listen` terminal window open while testing

### For Production

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret**
6. Add to your production environment variables

---

## Part 4: Testing the Payment Flow

### Test Scenario 1: New User with Trial

1. **Start the application**:
```bash
npm run dev
```

2. **Log in** as a user (or create a new strata)

3. **Navigate to Billing** page (click "Billing" in sidebar)

4. **Click "Add Payment Method"**
   - Should redirect to Stripe Checkout page
   - Should show: "30-day trial" message
   - Should show: "You won't be charged today"

5. **Enter test card details**:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name
   - Email: Any email

6. **Complete checkout**
   - Should redirect back to your app
   - Billing page should now show:
     - Status: **Trial** (blue badge)
     - Days remaining: **30 days**
     - Trial end date
     - "You can cancel anytime without being charged" message

7. **Verify in Stripe Dashboard**:
   - Go to **Customers** → Find your customer
   - Should see subscription with status: **Trialing**
   - Trial end date should be 30 days from now

### Test Scenario 2: Manage Payment Methods

1. On Billing page, click **"Manage Payment Methods"**
2. Should redirect to Stripe Customer Portal
3. Verify you can:
   - View current payment method
   - Add new payment method
   - Set default payment method
   - Remove old payment methods
   - View billing history
4. Click "Return to merchant" to go back to your app

### Test Scenario 3: Cancel During Trial

1. On Billing page, click **"Cancel Subscription"**
2. Confirm cancellation in dialog
3. Should see success message: "Your subscription will be cancelled at the end of the trial period"
4. Billing page should update to show cancellation scheduled

5. **Verify in Stripe Dashboard**:
   - Go to **Customers** → Your customer → **Subscriptions**
   - Should see `cancel_at_period_end: true`
   - Status should still be **Trialing** (until trial ends)

### Test Scenario 4: Simulate Trial End

Since waiting 30 days isn't practical, you can simulate trial end using Stripe Dashboard:

1. Go to **Customers** → Your customer → **Subscriptions**
2. Click on the subscription
3. Click **"Actions"** → **"Update subscription"**
4. Change **Trial end** to tomorrow's date
5. Click **Save**

OR use Stripe CLI:
```bash
stripe subscriptions update sub_XXX --trial_end now
```

This will immediately end the trial and:
- Create an invoice
- Charge the payment method
- Activate the subscription
- Your webhook will receive `customer.subscription.updated` event

6. **Verify the transition**:
   - Billing page status should change to: **Active** (green badge)
   - Should show next payment date
   - Webhook logs should show `invoice.payment_succeeded`

### Test Scenario 5: Failed Payment

1. Update customer's payment method to a test card that will fail:
   - Card Number: `4000 0000 0000 0341` (Card declined)
2. Trigger a payment (or wait for subscription renewal)
3. Webhook should receive `invoice.payment_failed` event
4. Verify:
   - Customer receives email about failed payment
   - Subscription status changes appropriately
   - Stripe will retry automatically

---

## Part 5: Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0341` | Declined (general) |
| `4000 0000 0000 0069` | Expired card |

Full list: https://stripe.com/docs/testing#cards

---

## Part 6: Monitoring & Logs

### View Webhook Events

1. In terminal running `stripe listen`, you'll see:
```
--> checkout.session.completed [evt_xxx]
--> customer.subscription.created [evt_xxx]
--> invoice.payment_succeeded [evt_xxx]
```

2. In Stripe Dashboard:
   - **Developers** → **Webhooks** → **Your endpoint**
   - Click on individual events to see request/response

### View Application Logs

Check your server console for:
```
✅ Stripe payment routes registered at /api/stripe
Received Stripe webhook event: checkout.session.completed
Checkout completed for strata b13712fb-8c41-4d4e-b5b4-a8f196b09716
Subscription created for strata b13712fb-8c41-4d4e-b5b4-a8f196b09716
```

---

## Part 7: Common Issues & Troubleshooting

### Issue: "Stripe is not configured" error

**Solution**:
- Check `.env` file has `STRIPE_SECRET_KEY`
- Restart the development server after adding env vars

### Issue: Webhook events not received

**Solution**:
- Ensure `stripe listen` is running
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook endpoint is `/api/stripe/webhook`

### Issue: Redirect after checkout doesn't work

**Solution**:
- Check `APP_URL` environment variable
- Ensure it matches your local dev server URL (e.g., `http://localhost:5000`)

### Issue: Price ID not found

**Solution**:
- Verify `STRIPE_STANDARD_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID` are correct
- Ensure you're using Price IDs, not Product IDs
- Check you're using test mode keys with test mode price IDs

---

## Part 8: Going to Production

### Checklist Before Launch

- [ ] Switch to **Live Mode** in Stripe Dashboard (toggle in top right)
- [ ] Create **live products & pricing** (same as test mode)
- [ ] Get **live API keys** (starts with `sk_live_...`)
- [ ] Update environment variables with live keys
- [ ] Set up **production webhook endpoint**
- [ ] Test the entire flow with a real card
- [ ] Set up **Stripe Billing Portal** for live mode
- [ ] Configure **email notifications** in Stripe Dashboard
- [ ] Review and enable **Smart Retries** for failed payments
- [ ] Set up **Stripe Radar** for fraud protection (recommended)

### Security Reminders

- ✅ Never commit `.env` file to git (use `.gitignore`)
- ✅ Never expose `STRIPE_SECRET_KEY` in client-side code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Keep Stripe libraries up to date

---

## Part 9: Additional Features to Consider

### Email Notifications

Stripe automatically sends:
- ✅ Payment receipts
- ✅ Failed payment notifications
- ✅ Trial ending reminders (3 days before)
- ✅ Subscription cancelled confirmations

Customize these in: **Settings** → **Billing** → **Customer emails**

### Analytics & Reporting

View in Stripe Dashboard:
- **Home** → Revenue, subscriptions, customers overview
- **Payments** → All successful/failed payments
- **Billing** → Subscription metrics
- **Reports** → Detailed analytics

### Multiple Price Points

If you want to add promotional pricing:
1. Create new prices in Stripe Dashboard
2. Add price IDs to environment variables
3. Offer as "special rate" option during checkout

---

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-checkout-session` | POST | Creates checkout session for new subscriptions |
| `/api/stripe/create-portal-session` | POST | Creates customer portal session |
| `/api/stripe/cancel-subscription` | POST | Cancels a subscription |
| `/api/stripe/reactivate-subscription` | POST | Reactivates a cancelled subscription |
| `/api/stripe/subscription/:strataId` | GET | Gets subscription details |
| `/api/stripe/webhook` | POST | Receives Stripe webhook events |

---

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Support**: support@stripe.com

---

## Success! 🎉

If you've completed all test scenarios successfully, your payment system is ready to go!

**Next Steps**:
1. Test with your team members
2. Review the billing page UI/UX
3. Customize email templates in Stripe
4. Plan your production launch
5. Consider adding usage-based pricing if needed

---

**Questions or Issues?**

Check the troubleshooting section above or reach out for help!
