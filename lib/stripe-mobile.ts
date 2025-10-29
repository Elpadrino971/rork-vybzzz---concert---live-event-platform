/**
 * Stripe Integration for VyBzzZ Mobile
 *
 * Handles:
 * - Artist subscriptions (Starter/Pro/Elite)
 * - Ticket purchases
 * - Tips to artists
 * - Stripe Connect onboarding
 */

import Stripe from 'stripe'

// Server-side Stripe (for API routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// ============================================
// ARTIST SUBSCRIPTIONS
// ============================================

/**
 * Create subscription for artist (Starter/Pro/Elite)
 */
export async function createArtistSubscription(
  customerId: string,
  priceId: string,
  artistId: string
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        artist_id: artistId,
        type: 'artist_subscription',
      },
      trial_period_days: 14, // 14 jours gratuits
    })

    return { success: true, subscription }
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update artist subscription (upgrade/downgrade)
 */
export async function updateArtistSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'always_invoice',
    })

    return { success: true, subscription: updatedSubscription }
  } catch (error: any) {
    console.error('Error updating subscription:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cancel artist subscription
 */
export async function cancelArtistSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return { success: true, subscription }
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// STRIPE CONNECT (Pour les artistes)
// ============================================

/**
 * Create Stripe Connect account for artist
 */
export async function createConnectedAccount(
  email: string,
  artistId: string,
  country: string = 'FR'
) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        artist_id: artistId,
      },
    })

    return { success: true, accountId: account.id }
  } catch (error: any) {
    console.error('Error creating connected account:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create account link for Stripe Connect onboarding
 */
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return { success: true, url: accountLink.url }
  } catch (error: any) {
    console.error('Error creating account link:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if Connect account is fully onboarded
 */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return account.details_submitted && account.charges_enabled
  } catch (error) {
    console.error('Error checking account status:', error)
    return false
  }
}

// ============================================
// CUSTOMERS
// ============================================

/**
 * Create Stripe customer
 */
export async function createCustomer(
  email: string,
  name: string,
  userId: string
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId,
      },
    })

    return { success: true, customerId: customer.id }
  } catch (error: any) {
    console.error('Error creating customer:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// TICKET PURCHASES
// ============================================

/**
 * Create payment intent for ticket purchase
 * Includes commission distribution to AA/RR
 */
export async function createTicketPaymentIntent(
  amount: number, // in cents
  customerId: string,
  artistStripeAccountId: string,
  ticketId: string,
  metadata: {
    event_id: string
    user_id: string
    artist_id: string
    aa_id?: string
    rr_id?: string
  }
) {
  try {
    // Calculate artist share (50-70% depending on tier)
    // For now, we'll handle commission distribution in webhook
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ticket_id: ticketId,
        type: 'ticket_purchase',
        ...metadata,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: any) {
    console.error('Error creating ticket payment intent:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// TIPS
// ============================================

/**
 * Create payment intent for tip to artist
 */
export async function createTipPaymentIntent(
  amount: number, // in cents
  customerId: string,
  artistStripeAccountId: string,
  tipId: string,
  metadata: {
    from_user_id: string
    to_artist_id: string
    event_id?: string
  }
) {
  try {
    // Platform takes 10% on tips
    const platformFee = Math.round(amount * 0.10)
    const artistAmount = amount - platformFee

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: customerId,
      transfer_data: {
        destination: artistStripeAccountId,
        amount: artistAmount,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tip_id: tipId,
        type: 'tip',
        ...metadata,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: any) {
    console.error('Error creating tip payment intent:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// PAYOUTS (J+21)
// ============================================

/**
 * Create payout to artist account (J+21)
 */
export async function createPayout(
  artistStripeAccountId: string,
  amount: number, // in cents
  payoutId: string
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'eur',
      destination: artistStripeAccountId,
      metadata: {
        payout_id: payoutId,
        type: 'artist_payout',
      },
    })

    return { success: true, transferId: transfer.id }
  } catch (error: any) {
    console.error('Error creating payout:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// COMMISSIONS (AA/RR)
// ============================================

/**
 * Pay commission to AA or RR
 */
export async function payCommission(
  recipientStripeAccountId: string,
  amount: number, // in cents
  commissionId: string,
  recipientType: 'aa' | 'rr'
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'eur',
      destination: recipientStripeAccountId,
      metadata: {
        commission_id: commissionId,
        type: `${recipientType}_commission`,
      },
    })

    return { success: true, transferId: transfer.id }
  } catch (error: any) {
    console.error('Error paying commission:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// REFUNDS
// ============================================

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    })

    return { success: true, refund }
  } catch (error: any) {
    console.error('Error refunding payment:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SUBSCRIPTION PRICE IDS
// ============================================

/**
 * Stripe Price IDs for artist subscriptions
 * TODO: Create these in Stripe Dashboard and update here
 */
export const SUBSCRIPTION_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter_monthly',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_monthly',
  elite: process.env.STRIPE_PRICE_ID_ELITE || 'price_elite_monthly',
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert euros to cents
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

/**
 * Convert cents to euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100
}

/**
 * Format amount for display
 */
export function formatAmount(cents: number, currency: string = 'EUR'): string {
  const euros = centsToEuros(cents)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(euros)
}
