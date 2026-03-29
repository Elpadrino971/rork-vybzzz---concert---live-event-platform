import express from 'express';
import { stripeService } from '../services/stripe.service';

const router = express.Router();

/**
 * POST /api/payments/create-intent
 * Crée un Payment Intent Stripe
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency, description, metadata } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const result = await stripeService.createPaymentIntent({
      amount,
      currency,
      description,
      metadata,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/confirm
 * Confirme un paiement
 */
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'PaymentIntentId is required' });
    }

    const result = await stripeService.confirmPayment(paymentIntentId);
    res.json(result);
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/subscriptions
 * Crée un abonnement
 */
router.post('/subscriptions', async (req, res) => {
  try {
    const { priceId, customerId, paymentMethodId } = req.body;

    if (!priceId || !customerId || !paymentMethodId) {
      return res.status(400).json({ error: 'priceId, customerId, and paymentMethodId are required' });
    }

    const subscription = await stripeService.createSubscription({
      priceId,
      customerId,
      paymentMethodId,
    });

    res.json(subscription);
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/subscriptions/:id/cancel
 * Annule un abonnement
 */
router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await stripeService.cancelSubscription(id);
    res.json(subscription);
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/subscriptions/update
 * Met à jour un abonnement
 */
router.post('/subscriptions/update', async (req, res) => {
  try {
    const { subscriptionId, priceId, paymentMethodId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'subscriptionId is required' });
    }

    const subscription = await stripeService.updateSubscription(subscriptionId, {
      priceId,
      paymentMethodId,
    });

    res.json(subscription);
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payments/customers/:customerId/payment-methods
 * Récupère les méthodes de paiement d'un client
 */
router.get('/customers/:customerId/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.params;
    const paymentMethods = await stripeService.getPaymentMethods(customerId);
    res.json(paymentMethods);
  } catch (error: any) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/customers/:customerId/payment-methods
 * Ajoute une méthode de paiement à un client
 */
router.post('/customers/:customerId/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'paymentMethodId is required' });
    }

    const paymentMethod = await stripeService.addPaymentMethod(customerId, paymentMethodId);
    res.json(paymentMethod);
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/payments/payment-methods/:paymentMethodId
 * Supprime une méthode de paiement
 */
router.delete('/payment-methods/:paymentMethodId', async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const paymentMethod = await stripeService.deletePaymentMethod(paymentMethodId);
    res.json(paymentMethod);
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

