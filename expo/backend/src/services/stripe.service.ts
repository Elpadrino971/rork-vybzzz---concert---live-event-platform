import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripeService = {
  /**
   * Crée un Payment Intent
   */
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }) {
    const { amount, currency = 'eur', description, metadata } = params;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  /**
   * Confirme un paiement
   */
  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      stripePaymentIntentId: paymentIntent.id,
      description: paymentIntent.description || '',
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
    };
  },

  /**
   * Crée un abonnement
   */
  async createSubscription(params: {
    priceId: string;
    customerId: string;
    paymentMethodId: string;
  }) {
    const { priceId, customerId, paymentMethodId } = params;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  },

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  },

  /**
   * Met à jour un abonnement
   */
  async updateSubscription(subscriptionId: string, params: {
    priceId?: string;
    paymentMethodId?: string;
  }) {
    const { priceId, paymentMethodId } = params;
    const updates: Stripe.SubscriptionUpdateParams = {};

    if (priceId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      updates.items = [{
        id: subscription.items.data[0].id,
        price: priceId,
      }];
    }

    if (paymentMethodId) {
      updates.default_payment_method = paymentMethodId;
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    return subscription;
  },

  /**
   * Récupère les méthodes de paiement d'un client
   */
  async getPaymentMethods(customerId: string) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  },

  /**
   * Ajoute une méthode de paiement à un client
   */
  async addPaymentMethod(customerId: string, paymentMethodId: string) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return await stripe.paymentMethods.retrieve(paymentMethodId);
  },

  /**
   * Supprime une méthode de paiement
   */
  async deletePaymentMethod(paymentMethodId: string) {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  },
};

