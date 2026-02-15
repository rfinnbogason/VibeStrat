# 🚀 Cloud Functions Deployment Steps
## Strata Management Application - Step by Step Guide

Follow these steps **exactly** to deploy your Cloud Functions.

---

## ✅ Step 1: Open Command Prompt

1. Press `Windows Key + R`
2. Type `cmd`
3. Press `Enter`

---

## ✅ Step 2: Navigate to Your Project

Copy and paste this command:

```bash
cd "C:\Users\User 1\OneDrive\Desktop\Projects\Strata Management Application"
```

Press `Enter`

---

## ✅ Step 3: Login to Firebase

Run this command:

```bash
firebase login
```

This will:
1. Open your web browser
2. Ask you to login with your Google account
3. Ask for permissions to Firebase
4. Click **Allow**
5. You'll see "Success! Logged in as [your-email]"
6. Close the browser tab
7. Return to Command Prompt

---

## ✅ Step 4: Verify Firebase Project

Run this command to verify you're connected to the right project:

```bash
firebase use
```

You should see: `Active Project: vibestrat`

If not, run:
```bash
firebase use vibestrat
```

---

## ✅ Step 5: Get Your Stripe API Keys

### For TEST keys (recommended to start):

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Login to your Stripe account
3. Copy your **Secret key** (starts with `sk_test_`)
   - Click "Reveal test key token" if it's hidden
   - Click to copy it

**IMPORTANT:** Keep this window open, you'll need this key in the next step.

### For Webhook Secret (optional for now, can add later):

1. Go to: https://dashboard.stripe.com/test/webhooks
2. If you have a webhook already, click on it and copy the **Signing secret** (starts with `whsec_`)
3. If not, skip this for now - we'll add it after deployment

---

## ✅ Step 6: Set Stripe API Keys in Firebase

Back in Command Prompt, run this command (replace `YOUR_STRIPE_SECRET_KEY` with your actual key):

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
```

**Example (if your key is `sk_test_51ABC123xyz`):**
```bash
firebase functions:config:set stripe.secret_key="sk_test_51ABC123xyz"
```

Press `Enter` and wait for confirmation: ✔ Functions config updated.

### Optional: Set Webhook Secret (if you have one):

```bash
firebase functions:config:set stripe.webhook_secret="YOUR_WEBHOOK_SECRET"
```

---

## ✅ Step 7: Set OpenAI API Key (Optional - for AI Features)

If you want to use AI-powered quote analysis, you need an OpenAI API key.

### To get an OpenAI API key:

1. Go to: https://platform.openai.com/api-keys
2. Login or create an account
3. Click "Create new secret key"
4. Name it "Strata Management App"
5. Copy the key (starts with `sk-`)
6. **IMPORTANT:** Save it somewhere safe - you can't see it again!

### To set it in Firebase:

```bash
firebase functions:config:set openai.api_key="YOUR_OPENAI_KEY"
```

**Example:**
```bash
firebase functions:config:set openai.api_key="sk-proj-abc123xyz"
```

**If you skip this:** AI quote analysis won't work, but all other functions will work fine.

---

## ✅ Step 8: Verify Configuration

Run this command to check your config:

```bash
firebase functions:config:get
```

You should see something like:

```json
{
  "stripe": {
    "secret_key": "sk_test_..."
  },
  "openai": {
    "api_key": "sk-..."
  }
}
```

If you only set Stripe, you'll only see the stripe section - that's fine!

---

## ✅ Step 9: Deploy Cloud Functions

This is the big step! Run:

```bash
firebase deploy --only functions
```

**What happens:**
- Takes 2-5 minutes
- Shows deployment progress for each function
- You'll see output like:

```
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing codebase default for deployment
i  functions: updating Node.js 18 function getFinancialSummary...
i  functions: updating Node.js 18 function calculateMonthlyIncome...
i  functions: updating Node.js 18 function processStrataPayment...
...
✔  Deploy complete!
```

**If you see any errors, copy the entire error message and let me know.**

---

## ✅ Step 10: Verify Deployment in Firebase Console

1. Go to: https://console.firebase.google.com
2. Click on your project: **vibestrat**
3. Click **Functions** in the left sidebar
4. You should see 13 functions deployed:

   **Financial:**
   - getFinancialSummary
   - calculateMonthlyIncome
   - processStrataPayment

   **Payment Methods:**
   - getPaymentMethods
   - addPaymentMethod
   - setDefaultPaymentMethod
   - deletePaymentMethod

   **Vendor & AI:**
   - analyzeQuoteDocument
   - calculateVendorRatings

   **Communication:**
   - sendStrataNotification

   **Scheduled (automatic):**
   - sendPaymentReminders
   - cleanupOldNotifications

   **Webhooks:**
   - handleStripeWebhook

---

## ✅ Step 11: Set Up Stripe Webhook (After Deployment)

After deploying, you need to tell Stripe where to send payment events:

1. In Firebase Console → Functions, find `handleStripeWebhook`
2. Click on it and copy the **Trigger URL** (looks like: `https://us-central1-vibestrat.cloudfunctions.net/handleStripeWebhook`)
3. Go to: https://dashboard.stripe.com/test/webhooks
4. Click **Add endpoint**
5. Paste your function URL
6. Click **Select events**
7. Search for and select these two events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
8. Click **Add events**
9. Click **Add endpoint**
10. On the webhook details page, reveal and copy the **Signing secret** (starts with `whsec_`)
11. In Command Prompt, run:
    ```bash
    firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
    ```
12. Redeploy just the webhook function:
    ```bash
    firebase deploy --only functions:handleStripeWebhook
    ```

---

## ✅ Step 12: Test Your Functions

Your app should now be able to call these Cloud Functions!

### Test in your running app:

Your app is already running at http://localhost:5000

The functions are now live and can be called from your frontend code.

---

## 📋 Quick Reference Commands

```bash
# View deployed functions
firebase functions:list

# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only getFinancialSummary

# View logs in real-time
firebase functions:log --follow

# Redeploy all functions
firebase deploy --only functions

# Redeploy specific function
firebase deploy --only functions:getFinancialSummary

# View configuration
firebase functions:config:get

# Delete a function
firebase functions:delete functionName
```

---

## 🆘 Troubleshooting

### "Error: Failed to authenticate"
**Solution:** Run `firebase login` again

### "Error: HTTP Error: 404, Project not found"
**Solution:** Run `firebase use vibestrat`

### "Stripe not configured" error in logs
**Solution:**
1. Check config: `firebase functions:config:get`
2. If missing, set it: `firebase functions:config:set stripe.secret_key="sk_test_..."`
3. Redeploy: `firebase deploy --only functions`

### "OpenAI not configured" error
**Solution:** Either:
- Set OpenAI key: `firebase functions:config:set openai.api_key="sk-..."`
- Or don't use the `analyzeQuoteDocument` function

### Functions timeout
**Solution:** Check Firebase Console → Functions → Logs for specific error details

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Logged into Firebase (`firebase login`)
- [ ] Stripe secret key set (`firebase functions:config:get` shows it)
- [ ] Functions deployed successfully (check Firebase Console)
- [ ] 13 functions visible in Firebase Console
- [ ] Stripe webhook configured (optional but recommended)
- [ ] App running at http://localhost:5000
- [ ] No errors in Firebase function logs

---

## 📞 Need Help?

If you encounter any issues:

1. **Check the logs:**
   ```bash
   firebase functions:log
   ```

2. **Check Firebase Console:**
   https://console.firebase.google.com/project/vibestrat/functions/logs

3. **Copy the exact error message** and let me know!

---

**Ready to start? Begin with Step 1!** 🚀
