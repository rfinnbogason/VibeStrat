# Cloud Functions Deployment Guide
## Strata Management Application

This guide will walk you through deploying Cloud Functions for your Strata Management Application.

---

## Overview

Your Cloud Functions include:

### Financial Functions
- `getFinancialSummary` - Get financial overview for a strata
- `calculateMonthlyIncome` - Calculate projected monthly income
- `processStrataPayment` - Process strata fee payments via Stripe

### Payment Management
- `getPaymentMethods` - Retrieve user's payment methods
- `addPaymentMethod` - Add new payment method
- `setDefaultPaymentMethod` - Set default payment method
- `deletePaymentMethod` - Remove payment method

### Vendor & Quote Management
- `analyzeQuoteDocument` - AI-powered quote analysis using OpenAI
- `calculateVendorRatings` - Calculate vendor performance ratings

### Communication
- `sendStrataNotification` - Send notifications to strata members

### Scheduled Tasks
- `sendPaymentReminders` - Automated daily payment reminders (9:00 AM PT)
- `cleanupOldNotifications` - Weekly cleanup of old notifications (Sundays)

### Webhooks
- `handleStripeWebhook` - Process Stripe payment events

**IMPORTANT:** All functions enforce data isolation by strataId to prevent data bleeding between stratas.

---

## Prerequisites

1. **Firebase CLI installed**
   ```
   npm install -g firebase-tools
   ```

2. **Firebase project set up** (already done - vibestrat)

3. **Logged into Firebase**
   ```
   firebase login
   ```

4. **Stripe account** (for payment processing)

5. **OpenAI API key** (for AI features)

---

## Step-by-Step Deployment

### Step 1: Navigate to Your Project

Open Command Prompt (Win + R, type `cmd`, press Enter) and run:

```bash
cd "C:\Users\User 1\OneDrive\Desktop\Projects\Strata Management Application"
```

### Step 2: Initialize Firebase Functions (if needed)

Check if you already have a `.firebaserc` file:

```bash
dir .firebaserc
```

If it doesn't exist, initialize Firebase:

```bash
firebase init functions
```

When prompted:
- **Select a default Firebase project**: Choose your existing project (vibestrat)
- **Language**: JavaScript
- **ESLint**: No (we already configured it)
- **Install dependencies**: Yes

If `.firebaserc` already exists, skip this step.

### Step 3: Install Function Dependencies

Navigate to the functions directory and install packages:

```bash
cd functions
npm install
```

This will install:
- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Cloud Functions SDK
- `stripe` - Stripe payment processing
- `openai` - OpenAI API for AI features

### Step 4: Configure Stripe API Keys

Set your Stripe secret key (replace with your actual key):

```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_STRIPE_SECRET_KEY"
```

Set your Stripe webhook secret (for webhook signature verification):

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
```

**Where to find these:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Secret key" (starts with `sk_test_`)
3. For webhook secret, go to https://dashboard.stripe.com/test/webhooks
4. Create a webhook endpoint (or use existing)
5. Copy the "Signing secret" (starts with `whsec_`)

### Step 5: Configure OpenAI API Key (Optional)

If you want to use AI-powered quote analysis:

```bash
firebase functions:config:set openai.api_key="sk-YOUR_OPENAI_API_KEY"
```

**Where to find this:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy it immediately (you won't be able to see it again)

### Step 6: Verify Configuration

Check that your config is set correctly:

```bash
firebase functions:config:get
```

You should see:
```json
{
  "stripe": {
    "secret_key": "sk_test_...",
    "webhook_secret": "whsec_..."
  },
  "openai": {
    "api_key": "sk-..."
  }
}
```

### Step 7: Deploy Functions

Navigate back to project root:

```bash
cd ..
```

Deploy all functions:

```bash
firebase deploy --only functions
```

**This will take 3-5 minutes.** You'll see output like:

```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing codebase default for deployment
i  functions: updating Node.js 18 function getFinancialSummary...
i  functions: updating Node.js 18 function calculateMonthlyIncome...
...
✔  functions: all functions deployed successfully!
```

### Step 8: Verify Deployment

Check that your functions are deployed:

```bash
firebase functions:list
```

You should see all your functions listed with URLs.

---

## Testing Your Functions

### Test in Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project (vibestrat)
3. Click "Functions" in the left sidebar
4. You should see all your deployed functions

### Test with Firebase CLI

Test a function locally before deploying:

```bash
cd functions
npm run serve
```

This starts the Firebase Functions emulator.

### Test from Your Application

Update your frontend to call the Cloud Functions:

```typescript
// client/src/lib/firebase-functions.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const getFinancialSummary = httpsCallable(functions, 'getFinancialSummary');
export const processStrataPayment = httpsCallable(functions, 'processStrataPayment');
export const analyzeQuoteDocument = httpsCallable(functions, 'analyzeQuoteDocument');
// ... etc

// Usage in component:
const { data } = await getFinancialSummary({ strataId: 'your-strata-id' });
```

---

## Updating Functions

When you make changes to your functions:

1. Edit `functions/index.js`
2. Test locally with `npm run serve` (optional)
3. Deploy changes:
   ```bash
   firebase deploy --only functions
   ```

To deploy only specific functions:

```bash
firebase deploy --only functions:getFinancialSummary,functions:processStrataPayment
```

---

## Monitoring & Logs

### View Logs in Console

https://console.firebase.google.com/project/vibestrat/functions/logs

### View Logs via CLI

See recent logs:
```bash
firebase functions:log
```

See logs for specific function:
```bash
firebase functions:log --only getFinancialSummary
```

Stream logs in real-time:
```bash
firebase functions:log --follow
```

---

## Scheduled Functions

Your scheduled functions will run automatically:

1. **sendPaymentReminders** - Every day at 9:00 AM Pacific Time
2. **cleanupOldNotifications** - Every Sunday at midnight Pacific Time

**No additional setup needed** - they start running as soon as deployed!

---

## Stripe Webhook Setup

After deploying, you need to configure Stripe to send webhooks to your function:

1. Deploy your functions (you'll get a URL for `handleStripeWebhook`)
2. Copy the function URL:
   ```bash
   firebase functions:list | findstr handleStripeWebhook
   ```
3. Go to https://dashboard.stripe.com/test/webhooks
4. Click "Add endpoint"
5. Paste your function URL (e.g., `https://us-central1-vibestrat.cloudfunctions.net/handleStripeWebhook`)
6. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
7. Copy the "Signing secret" and update your config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_NEW_SECRET"
   firebase deploy --only functions:handleStripeWebhook
   ```

---

## Security Considerations

### Authentication

All functions verify authentication:
```javascript
if (!context.auth) throw new Error("Authentication required");
```

### Data Isolation

All functions enforce strataId filtering:
```javascript
await verifyStrataAccess(userId, strataId);
```

### Permission Checks

Functions check role-based permissions:
```javascript
if (!hasPermission(userRole.role, "financial.view")) {
  throw new Error("Insufficient permissions");
}
```

### Firestore Security Rules

Ensure your Firestore security rules also enforce strataId filtering:

```javascript
match /expenses/{expenseId} {
  allow read: if isStrataAccessor(resource.data.strataId);
  allow write: if isStrataAccessor(request.resource.data.strataId)
                && hasPermission('financial.create');
}
```

---

## Cost Optimization

### Free Tier Limits

Cloud Functions free tier includes:
- 2 million invocations/month
- 400,000 GB-seconds of compute time
- 200,000 CPU-seconds of compute time
- 5 GB network egress

### Tips to Reduce Costs

1. **Limit result sets** - Always use `.limit()` in queries
2. **Cache frequently accessed data** - Use Firestore offline persistence
3. **Batch operations** - Use batch writes when possible
4. **Optimize scheduled functions** - Run only as often as needed
5. **Monitor usage** - Check Firebase console regularly

### Set Budget Alerts

1. Go to https://console.cloud.google.com/billing
2. Select your project
3. Click "Budgets & alerts"
4. Create a budget alert (e.g., $10/month)

---

## Troubleshooting

### Function Not Deploying

**Error:** "Missing required API"
**Solution:** Enable required APIs:
```bash
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Function Timing Out

**Error:** "Function execution took too long"
**Solution:** Increase timeout (max 540 seconds):
```javascript
exports.longRunningFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    // ...
  });
```

### Stripe Not Configured

**Error:** "Stripe not configured"
**Solution:** Verify config is set:
```bash
firebase functions:config:get stripe.secret_key
```

### OpenAI Errors

**Error:** "OpenAI not configured"
**Solution:** Set API key:
```bash
firebase functions:config:set openai.api_key="sk-..."
```

### Data Bleeding Issues

**Always verify:**
- Every query includes `.where('strataId', '==', strataId)`
- Every created document includes `strataId` field
- `verifyStrataAccess()` is called before operations

---

## Quick Reference Commands

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:getFinancialSummary

# View logs
firebase functions:log

# List deployed functions
firebase functions:list

# Delete a function
firebase functions:delete FUNCTION_NAME

# Test locally
cd functions && npm run serve

# View config
firebase functions:config:get

# Set config
firebase functions:config:set key.subkey="value"

# Check deployment status
firebase functions:list
```

---

## Next Steps

After deploying:

1. **Test each function** - Verify they work as expected
2. **Update frontend** - Connect your React app to call these functions
3. **Set up monitoring** - Watch logs for errors
4. **Configure webhooks** - Set up Stripe webhook endpoint
5. **Test scheduled functions** - Verify daily/weekly tasks run correctly
6. **Document usage** - Add function calls to your codebase documentation

---

## Support

If you encounter issues:

1. Check the logs: `firebase functions:log`
2. Review Firebase Console: https://console.firebase.google.com
3. Check Stripe Dashboard: https://dashboard.stripe.com
4. Verify API keys are set correctly
5. Ensure all dependencies are installed

---

**You're all set!** Your Cloud Functions are ready to deploy. 🚀
