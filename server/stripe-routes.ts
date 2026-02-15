import express, { Request, Response, RequestHandler } from 'express';
import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG, getSubscriptionTier, getStripePriceId } from './stripe-config';
import * as firebaseStorage from './firebase-db';
import { Timestamp } from 'firebase-admin/firestore';
import { adminAuth } from './firebase-admin';

const router = express.Router();

// Authentication middleware for Stripe routes
const authenticateStripeRequest: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error('Stripe route auth error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// ====================================
// STRIPE CHECKOUT & SUBSCRIPTION APIs
// ====================================

/**
 * Create Checkout Session for new subscription
 * This collects payment method and starts a trial
 */
router.post('/create-checkout-session', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { strataId, userId, unitCount } = req.body;

    if (!strataId || !userId || !unitCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get strata info
    const strata = await firebaseStorage.getStrata(strataId);
    if (!strata) {
      return res.status(404).json({ error: 'Strata not found' });
    }

    // Determine subscription tier
    const tier = getSubscriptionTier(unitCount);
    const priceId = getStripePriceId(tier);

    if (!priceId) {
      return res.status(500).json({
        error: 'Stripe Price ID not configured. Please set STRIPE_STANDARD_PRICE_ID and STRIPE_PREMIUM_PRICE_ID environment variables'
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: strata.email || undefined,
      metadata: {
        strataId,
        userId,
        tier,
      },
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.TRIAL_DAYS,
        metadata: {
          strataId,
          tier,
        },
      },
      success_url: `${process.env.APP_URL || 'http://localhost:5000'}/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/billing?payment=cancelled`,
      allow_promotion_codes: true,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

/**
 * Create Customer Portal Session
 * Allows customers to manage their subscription, payment methods, and billing history
 */
router.post('/create-portal-session', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { strataId, customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL || 'http://localhost:5000'}/billing`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

/**
 * Cancel Subscription
 * Cancels the subscription at the end of the current billing period
 */
router.post('/cancel-subscription', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { subscriptionId, strataId, cancelImmediately } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // Cancel subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !cancelImmediately,
      ...(cancelImmediately && { cancel_at: Math.floor(Date.now() / 1000) }),
    });

    // Update strata subscription status
    if (strataId) {
      await firebaseStorage.updateStrata(strataId, {
        'subscription.status': cancelImmediately ? 'cancelled' : 'active',
        updatedAt: Timestamp.now(),
      });
    }

    res.json({
      message: cancelImmediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
      subscription
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

/**
 * Reactivate Subscription
 * Reactivates a subscription that was scheduled for cancellation
 */
router.post('/reactivate-subscription', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { subscriptionId, strataId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update strata subscription status
    if (strataId) {
      await firebaseStorage.updateStrata(strataId, {
        'subscription.status': 'active',
        updatedAt: Timestamp.now(),
      });
    }

    res.json({ message: 'Subscription reactivated', subscription });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to reactivate subscription' });
  }
});

/**
 * Get Subscription Details
 */
router.get('/subscription/:strataId', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    const { strataId } = req.params;

    const strata = await firebaseStorage.getStrata(strataId);
    if (!strata) {
      return res.status(404).json({ error: 'Strata not found' });
    }

    // If no subscription exists, initialize a default "free" subscription
    if (!strata.subscription) {
      const defaultSubscription = {
        status: 'free',
        tier: 'free',
        monthlyRate: 0,
        isFreeForever: false,
      };

      // Save the default subscription to the strata document
      await firebaseStorage.updateStrata(strataId, {
        subscription: defaultSubscription,
        updatedAt: Timestamp.now(),
      });

      return res.json({ subscription: defaultSubscription });
    }

    // Get subscription details from Firestore or provide defaults
    const subscriptionData = {
      status: strata.subscription?.status || 'free',
      tier: strata.subscription?.tier || 'free',
      monthlyRate: strata.subscription?.monthlyRate || 0,
      trialStartDate: strata.subscription?.trialStartDate || null,
      trialEndDate: strata.subscription?.trialEndDate || null,
      nextPaymentDate: strata.subscription?.nextPaymentDate || null,
      isFreeForever: strata.subscription?.isFreeForever !== undefined ? strata.subscription.isFreeForever : false,
      stripeCustomerId: strata.subscription?.stripeCustomerId || null,
      stripeSubscriptionId: strata.subscription?.stripeSubscriptionId || null,
    };

    res.json({ subscription: subscriptionData });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch subscription' });
  }
});

/**
 * Webhook handler for Stripe events
 * IMPORTANT: This endpoint must be accessible without authentication
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).send('Stripe is not configured');
    }

    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_CONFIG.WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialWillEnd(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// WEBHOOK EVENT HANDLERS
// ====================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const strataId = session.metadata?.strataId;
  const tier = session.metadata?.tier as 'standard' | 'premium';

  if (!strataId) {
    console.error('No strataId in checkout session metadata');
    return;
  }

  console.log(`Checkout completed for strata ${strataId}`);

  // Update strata with subscription details
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + STRIPE_CONFIG.TRIAL_DAYS);

  await firebaseStorage.updateStrata(strataId, {
    'subscription.status': 'trial',
    'subscription.tier': tier,
    'subscription.trialStartDate': Timestamp.now(),
    'subscription.trialEndDate': Timestamp.fromDate(trialEndDate),
    'subscription.stripeCustomerId': session.customer as string,
    'subscription.stripeSubscriptionId': session.subscription as string,
    updatedAt: Timestamp.now(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Subscription created for strata ${strataId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Subscription updated for strata ${strataId}`, {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Map Stripe status to our status
  let status: 'trial' | 'active' | 'cancelled' | 'expired' | 'free' = 'active';

  if (subscription.status === 'trialing') {
    status = 'trial';
  } else if (subscription.status === 'active') {
    status = 'active';
  } else if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    status = 'cancelled';
  } else if (subscription.status === 'unpaid' || subscription.status === 'past_due') {
    status = 'expired';
  }

  const updates: any = {
    'subscription.status': status,
    updatedAt: Timestamp.now(),
  };

  if (subscription.current_period_end) {
    updates['subscription.nextPaymentDate'] = Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    );
  }

  await firebaseStorage.updateStrata(strataId, updates);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Subscription deleted for strata ${strataId}`);

  await firebaseStorage.updateStrata(strataId, {
    'subscription.status': 'cancelled',
    'subscription.subscriptionEndDate': Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Trial will end soon for strata ${strataId}`);

  // TODO: Send notification to strata admins about trial ending
  // Can implement email notification here
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId || !stripe) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Payment succeeded for strata ${strataId}`);

  await firebaseStorage.updateStrata(strataId, {
    'subscription.lastPaymentDate': Timestamp.now(),
    'subscription.status': 'active',
    updatedAt: Timestamp.now(),
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId || !stripe) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Payment failed for strata ${strataId}`);

  // TODO: Send notification to strata admins about payment failure
  // Can implement email notification here
}

// ====================================
// PAYMENT METHOD MANAGEMENT APIs
// ====================================

/**
 * Get all payment methods for a customer
 */
router.get('/payment-methods/:userId', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { userId } = req.params;

    // Get user data from Firebase to find Stripe customer ID
    const userSnapshot = await firebaseStorage.db
      .collection('users')
      .where('id', '==', userId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.docs[0].data();
    const stripeCustomerId = userData.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    // List all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    // Get the default payment method from customer
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethodId = (customer as Stripe.Customer).invoice_settings?.default_payment_method as string;

    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      cardLastFour: pm.card?.last4 || '0000',
      cardBrand: pm.card?.brand || 'unknown',
      isDefault: pm.id === defaultPaymentMethodId,
      createdAt: pm.created,
    }));

    res.json({ paymentMethods: formattedMethods });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payment methods' });
  }
});

/**
 * Add a new payment method
 */
router.post('/payment-methods', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { userId, paymentMethodId } = req.body;

    if (!userId || !paymentMethodId) {
      return res.status(400).json({ error: 'userId and paymentMethodId are required' });
    }

    // Get or create Stripe customer
    const userSnapshot = await firebaseStorage.db
      .collection('users')
      .where('id', '==', userId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    let stripeCustomerId = userData.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Update user document with Stripe customer ID
      await firebaseStorage.db.collection('users').doc(userDoc.id).update({
        stripeCustomerId: stripeCustomerId,
        updatedAt: Timestamp.now(),
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Get existing payment methods to check if this should be default
    const existingMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    // Set as default if it's the first payment method
    if (existingMethods.data.length === 1) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    res.json({
      id: paymentMethodId,
      message: 'Payment method added successfully',
    });
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to add payment method' });
  }
});

/**
 * Set default payment method
 */
router.post('/payment-methods/set-default', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { userId, paymentMethodId } = req.body;

    if (!userId || !paymentMethodId) {
      return res.status(400).json({ error: 'userId and paymentMethodId are required' });
    }

    // Get user's Stripe customer ID
    const userSnapshot = await firebaseStorage.db
      .collection('users')
      .where('id', '==', userId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.docs[0].data();
    const stripeCustomerId = userData.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ message: 'Default payment method updated successfully' });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to set default payment method' });
  }
});

/**
 * Delete a payment method
 */
router.delete('/payment-methods/:paymentMethodId', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { paymentMethodId } = req.params;

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment method' });
  }
});

/**
 * Create Setup Intent for adding payment method
 * This is used by Stripe Elements to securely collect card details
 */
router.post('/create-setup-intent', authenticateStripeRequest, async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get or create Stripe customer
    const userSnapshot = await firebaseStorage.db
      .collection('users')
      .where('id', '==', userId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    let stripeCustomerId = userData.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Update user document with Stripe customer ID
      await firebaseStorage.db.collection('users').doc(userDoc.id).update({
        stripeCustomerId: stripeCustomerId,
        updatedAt: Timestamp.now(),
      });
    }

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ error: error.message || 'Failed to create setup intent' });
  }
});

export default router;
