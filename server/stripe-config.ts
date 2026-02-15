import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured - Payment features will be disabled');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
}) : null;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Subscription tiers
  TIERS: {
    STANDARD: {
      name: 'Standard',
      maxUnits: 100,
      monthlyPrice: 49,
      priceId: process.env.STRIPE_STANDARD_PRICE_ID || '', // Set this in Stripe Dashboard
    },
    PREMIUM: {
      name: 'Premium',
      maxUnits: Infinity,
      monthlyPrice: 79,
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '', // Set this in Stripe Dashboard
    },
  },

  // Trial configuration
  TRIAL_DAYS: 30,

  // Currency
  CURRENCY: 'cad', // Canadian dollars

  // Webhook secret for verifying webhook events
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;

/**
 * Determine subscription tier based on unit count
 */
export function getSubscriptionTier(unitCount: number): 'standard' | 'premium' {
  return unitCount <= STRIPE_CONFIG.TIERS.STANDARD.maxUnits ? 'standard' : 'premium';
}

/**
 * Get price for a subscription tier
 */
export function getSubscriptionPrice(tier: 'standard' | 'premium'): number {
  return tier === 'standard'
    ? STRIPE_CONFIG.TIERS.STANDARD.monthlyPrice
    : STRIPE_CONFIG.TIERS.PREMIUM.monthlyPrice;
}

/**
 * Get Stripe Price ID for a tier
 */
export function getStripePriceId(tier: 'standard' | 'premium'): string {
  return tier === 'standard'
    ? STRIPE_CONFIG.TIERS.STANDARD.priceId
    : STRIPE_CONFIG.TIERS.PREMIUM.priceId;
}
