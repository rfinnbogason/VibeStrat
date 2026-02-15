# Strata Management Cloud Functions

Firebase Cloud Functions for the Strata Management Application.

## Quick Start

```bash
# Install dependencies
npm install

# Test locally
npm run serve

# Deploy to Firebase
firebase deploy --only functions

# View logs
firebase functions:log
```

## Available Functions

### Financial Functions
- **getFinancialSummary** - Get comprehensive financial overview for a strata
- **calculateMonthlyIncome** - Calculate projected monthly income based on units
- **processStrataPayment** - Process strata fee payments through Stripe

### Payment Management
- **getPaymentMethods** - Retrieve user's saved payment methods
- **addPaymentMethod** - Add new payment method for user
- **setDefaultPaymentMethod** - Set default payment method
- **deletePaymentMethod** - Remove payment method

### Vendor & Quote Management
- **analyzeQuoteDocument** - AI-powered quote analysis using OpenAI GPT-4
- **calculateVendorRatings** - Calculate vendor performance ratings

### Communication
- **sendStrataNotification** - Send notifications to strata members (with role filtering)

### Scheduled Tasks (Automatic)
- **sendPaymentReminders** - Runs daily at 9:00 AM PT
- **cleanupOldNotifications** - Runs every Sunday at midnight PT

### Webhooks
- **handleStripeWebhook** - Process Stripe payment events (success/failure)

## Configuration Required

Before deploying, set these configuration values:

```bash
# Stripe configuration
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# OpenAI configuration (for AI features)
firebase functions:config:set openai.api_key="sk-..."
```

## Security Features

### Data Isolation
All functions enforce strict strataId filtering to prevent data bleeding between stratas:

```javascript
// Every function verifies strata access
await verifyStrataAccess(userId, strataId);

// Every query filters by strataId
.where('strataId', '==', strataId)
```

### Authentication
All functions require Firebase authentication:

```javascript
if (!context.auth) throw new Error("Authentication required");
```

### Role-Based Access Control
Functions check user permissions before operations:

```javascript
if (!hasPermission(userRole.role, "financial.view")) {
  throw new Error("Insufficient permissions");
}
```

## Usage Examples

### Calling from Frontend

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Get financial summary
const getFinancialSummary = httpsCallable(functions, 'getFinancialSummary');
const result = await getFinancialSummary({ strataId: 'your-strata-id' });
console.log(result.data);

// Process payment
const processStrataPayment = httpsCallable(functions, 'processStrataPayment');
const payment = await processStrataPayment({
  strataId: 'strata-123',
  unitId: 'unit-456',
  amount: 500,
  paymentMethodId: 'pm-789'
});

// Analyze quote with AI
const analyzeQuote = httpsCallable(functions, 'analyzeQuoteDocument');
const analysis = await analyzeQuote({
  strataId: 'strata-123',
  documentText: quoteText,
  documentUrl: quoteUrl
});
```

## Local Development

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulator
npm run serve

# Functions will be available at:
# http://localhost:5001/vibestrat/us-central1/FUNCTION_NAME
```

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:getFinancialSummary

# Deploy multiple functions
firebase deploy --only functions:getFinancialSummary,functions:processStrataPayment
```

## Monitoring

```bash
# View all logs
firebase functions:log

# View specific function logs
firebase functions:log --only getFinancialSummary

# Stream logs in real-time
firebase functions:log --follow

# View logs in Firebase Console
# https://console.firebase.google.com/project/vibestrat/functions/logs
```

## Testing

### Manual Testing

Use the Firebase Console to test functions with sample data:
1. Go to Firebase Console → Functions
2. Click on a function
3. Navigate to "Testing" tab
4. Provide test data and execute

### Integration Testing

```javascript
// Example test
const test = require('firebase-functions-test')();
const myFunctions = require('./index');

describe('getFinancialSummary', () => {
  it('should return financial data for strata', async () => {
    const result = await myFunctions.getFinancialSummary({
      strataId: 'test-strata'
    }, {
      auth: { uid: 'test-user' }
    });

    expect(result).toHaveProperty('totalExpenses');
    expect(result).toHaveProperty('totalIncome');
  });
});
```

## Error Handling

All functions use consistent error handling:

```javascript
try {
  // Function logic
  return { success: true, data: result };
} catch (error) {
  console.error('Error in functionName:', error);
  throw new functions.https.HttpsError('internal', error.message);
}
```

Frontend should handle errors:

```typescript
try {
  const result = await functionCall(data);
  // Handle success
} catch (error) {
  console.error('Function call failed:', error);
  // Show user-friendly error message
}
```

## Performance Optimization

- **Query Limits**: All queries use `.limit()` to prevent excessive reads
- **Batch Operations**: Multiple writes use batch operations
- **Caching**: Consider caching frequently accessed data
- **Indexes**: Ensure Firestore has composite indexes for queries

## Costs

Monitor your Cloud Functions usage to stay within free tier:
- 2M invocations/month (free)
- 400,000 GB-seconds compute time (free)
- 200,000 CPU-seconds (free)

Set up billing alerts in Google Cloud Console to avoid unexpected charges.

## Troubleshooting

### Function Not Found
- Verify deployment: `firebase functions:list`
- Check function name matches exactly
- Ensure functions are deployed to correct project

### Permission Denied
- Verify user is authenticated
- Check user has access to the strata
- Verify user's role has required permissions

### Stripe Errors
- Verify API keys are set correctly
- Check Stripe Dashboard for detailed error info
- Ensure test/live keys match environment

### Timeout Errors
- Increase timeout in function config
- Optimize query performance
- Consider breaking into smaller operations

## Documentation

For detailed deployment instructions, see:
**[CLOUD_FUNCTIONS_DEPLOYMENT.md](../CLOUD_FUNCTIONS_DEPLOYMENT.md)**

## Support

- Firebase Docs: https://firebase.google.com/docs/functions
- Stripe Docs: https://stripe.com/docs
- OpenAI Docs: https://platform.openai.com/docs
