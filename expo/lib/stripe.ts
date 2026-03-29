import Stripe from 'stripe'

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe Connect - Create Connected Account for Artist
export async function createConnectedAccount(email: string, country: string = 'FR') {
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
    })

    return { success: true, accountId: account.id }
  } catch (error: any) {
    console.error('Error creating connected account:', error)
    return { success: false, error: error.message }
  }
}

// Generate Account Link for Stripe Connect Onboarding
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
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

// Create Customer for Fan
export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })

    return { success: true, customerId: customer.id }
  } catch (error: any) {
    console.error('Error creating customer:', error)
    return { success: false, error: error.message }
  }
}

// Create Payment Intent for Ticket Purchase
export async function createTicketPaymentIntent(
  amount: number, // Amount in cents
  customerId: string,
  artistAccountId: string,
  ticketId: string,
  affiliateCommissions?: { affiliateId: string; amount: number }[]
) {
  try {
    // Calculate platform fee (5% for VyBzzZ)
    const platformFee = Math.round(amount * 0.05)

    // Calculate total affiliate commissions
    const totalAffiliateCommissions = affiliateCommissions?.reduce(
      (sum, comm) => sum + comm.amount,
      0
    ) || 0

    // Artist receives the amount minus platform fee and affiliate commissions
    const artistAmount = amount - platformFee - totalAffiliateCommissions

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: customerId,
      transfer_data: {
        destination: artistAccountId,
        amount: artistAmount,
      },
      metadata: {
        ticket_id: ticketId,
        type: 'ticket_purchase',
      },
    })

    return { success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return { success: false, error: error.message }
  }
}

// Create Payment Intent for Tip
export async function createTipPaymentIntent(
  amount: number,
  customerId: string,
  artistAccountId: string,
  tipId: string,
  eventId?: string
) {
  try {
    // Platform takes 10% fee on tips
    const platformFee = Math.round(amount * 0.10)
    const artistAmount = amount - platformFee

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: customerId,
      transfer_data: {
        destination: artistAccountId,
        amount: artistAmount,
      },
      metadata: {
        tip_id: tipId,
        event_id: eventId || '',
        type: 'tip',
      },
    })

    return { success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
  } catch (error: any) {
    console.error('Error creating tip payment intent:', error)
    return { success: false, error: error.message }
  }
}

// Pay Affiliate Commission
export async function payAffiliateCommission(
  affiliateAccountId: string,
  amount: number,
  commissionId: string
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'eur',
      destination: affiliateAccountId,
      metadata: {
        commission_id: commissionId,
        type: 'affiliate_commission',
      },
    })

    return { success: true, transferId: transfer.id }
  } catch (error: any) {
    console.error('Error paying affiliate commission:', error)
    return { success: false, error: error.message }
  }
}

// Refund Payment
export async function refundPayment(paymentIntentId: string, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason as any,
    })

    return { success: true, refundId: refund.id }
  } catch (error: any) {
    console.error('Error refunding payment:', error)
    return { success: false, error: error.message }
  }
}

// Check if Connected Account is Fully Onboarded
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return account.details_submitted && account.charges_enabled
  } catch (error) {
    console.error('Error checking account status:', error)
    return false
  }
}

// Get Account Balance
export async function getAccountBalance(accountId: string) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    })

    return {
      success: true,
      available: balance.available,
      pending: balance.pending,
    }
  } catch (error: any) {
    console.error('Error getting account balance:', error)
    return { success: false, error: error.message }
  }
}
