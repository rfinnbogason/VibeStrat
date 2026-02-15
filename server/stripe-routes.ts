import express, { Request, Response, RequestHandler } from 'express';
import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG, getSubscriptionTier, getStripePriceId } from './stripe-config';
import { storage } from './storage-factory';
import { authenticateJwt } from './jwt-auth';

const router = express.Router();

// Use JWT authentication for Stripe routes
const authenticateStripeRequest: RequestHandler = authenticateJwt as any;

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
    const strata = await storage.getStrata(strataId);
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
      customer_email: (strata as any).email || undefined,
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

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !cancelImmediately,
      ...(cancelImmediately && { cancel_at: Math.floor(Date.now() / 1000) }),
    });

    if (strataId) {
      await storage.updateStrata(strataId, {
        updatedAt: new Date(),
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

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    if (strataId) {
      await storage.updateStrata(strataId, {
        updatedAt: new Date(),
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

    const strata = await storage.getStrata(strataId);
    if (!strata) {
      return res.status(404).json({ error: 'Strata not found' });
    }

    const strataAny = strata as any;

    if (!strataAny.subscription) {
      const defaultSubscription = {
        status: 'free',
        tier: 'free',
        monthlyRate: 0,
        isFreeForever: false,
      };

      await storage.updateStrata(strataId, {
        subscription: defaultSubscription,
        updatedAt: new Date(),
      });

      return res.json({ subscription: defaultSubscription });
    }

    const subscriptionData = {
      status: strataAny.subscription?.status || 'free',
      tier: strataAny.subscription?.tier || 'free',
      monthlyRate: strataAny.subscription?.monthlyRate || 0,
      trialStartDate: strataAny.subscription?.trialStartDate || null,
      trialEndDate: strataAny.subscription?.trialEndDate || null,
      nextPaymentDate: strataAny.subscription?.nextPaymentDate || null,
      isFreeForever: strataAny.subscription?.isFreeForever !== undefined ? strataAny.subscription.isFreeForever : false,
      stripeCustomerId: strataAny.subscription?.stripeCustomerId || null,
      stripeSubscriptionId: strataAny.subscription?.stripeSubscriptionId || null,
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

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + STRIPE_CONFIG.TRIAL_DAYS);

  await storage.updateStrata(strataId, {
    subscription: {
      status: 'trial',
      tier,
      trialStartDate: new Date(),
      trialEndDate,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
    updatedAt: new Date(),
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
    updatedAt: new Date(),
  };

  if (subscription.current_period_end) {
    updates.subscription = {
      status,
      nextPaymentDate: new Date(subscription.current_period_end * 1000),
    };
  }

  await storage.updateStrata(strataId, updates);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Subscription deleted for strata ${strataId}`);

  await storage.updateStrata(strataId, {
    updatedAt: new Date(),
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const strataId = subscription.metadata?.strataId;

  if (!strataId) {
    console.error('No strataId in subscription metadata');
    return;
  }

  console.log(`Trial will end soon for strata ${strataId}`);
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

  await storage.updateStrata(strataId, {
    updatedAt: new Date(),
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

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripeCustomerId = (user as any).stripeCustomerId;

    if (!stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

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

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = (user as any).stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      await storage.updateUser(userId, {
        stripeCustomerId: stripeCustomerId,
        updatedAt: new Date(),
      } as any);
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    const existingMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

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

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripeCustomerId = (user as any).stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

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

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment method' });
  }
});

/**
 * Create Setup Intent for adding payment method
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

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = (user as any).stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      await storage.updateUser(userId, {
        stripeCustomerId: stripeCustomerId,
        updatedAt: new Date(),
      } as any);
    }

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
