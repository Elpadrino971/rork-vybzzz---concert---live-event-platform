import React from 'react';
import { Platform } from 'react-native';
import { Payment, Subscription } from '@/types';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Rb3BrH2HsUSSb9aOjIMa2Oqzxw9oozLShfcsrvzxAGmp6uFzsRC3Jl1fMhXm8C4EZJIjFn2oGLbK51KI9q8tCdQ00c9sFlYQ7';

// Declare global Stripe type for web
declare global {
  interface Window {
    Stripe?: any;
  }
}

export interface PaymentService {
  initializePayment: (amount: number, currency: string, description: string) => Promise<string>;
  confirmPayment: (paymentIntentId: string, paymentMethodId: string) => Promise<Payment>;
  createSubscription: (priceId: string, customerId: string) => Promise<Subscription>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  updateSubscription: (subscriptionId: string, priceId: string) => Promise<Subscription>;
  getPaymentMethods: (customerId: string) => Promise<any[]>;
  addPaymentMethod: (customerId: string, paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
}

class StripePaymentService implements PaymentService {
  private baseUrl = 'https://api.stripe.com/v1';
  private secretKey = 'sk_test_51Rb3BrH2HsUSSb9a4sup24BA0PnUmlvKIYGkANJJUa7Hv8UsPFY3BkAvqpPsB9Z7f0r8TpPSYjoVTfHvI7lZkTVZ00BVl4gW3Y';

  async initializePayment(amount: number, currency: string, description: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: (amount * 100).toString(),
          currency,
          description,
          automatic_payment_methods: JSON.stringify({ enabled: true }),
        }),
      });

      const paymentIntent = await response.json();
      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<Payment> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          payment_method: paymentMethodId,
        }),
      });

      const paymentIntent = await response.json();
      
      const payment: Payment = {
        id: paymentIntent.id,
        userId: paymentIntent.metadata?.userId || '',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        type: 'subscription',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        stripePaymentIntentId: paymentIntent.id,
        description: paymentIntent.description || '',
        createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      };

      return payment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async createSubscription(priceId: string, customerId: string): Promise<Subscription> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
          items: JSON.stringify([{ price: priceId }]),
          payment_behavior: 'default_incomplete',
          payment_settings: JSON.stringify({ save_default_payment_method: 'on_subscription' }),
          expand: JSON.stringify(['latest_invoice.payment_intent']),
        }),
      });

      const subscription = await response.json();
      
      const sub: Subscription = {
        id: subscription.id,
        userId: subscription.metadata?.userId || '',
        plan: subscription.items.data[0].price.nickname === 'Premium' ? 'premium' : 'pro',
        status: subscription.status === 'active' ? 'active' : 'inactive',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        price: subscription.items.data[0].price.unit_amount / 100,
        currency: subscription.items.data[0].price.currency,
      };

      return sub;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, priceId: string): Promise<Subscription> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          items: JSON.stringify([{ price: priceId }]),
          proration_behavior: 'create_prorations',
        }),
      });

      const subscription = await response.json();
      
      const sub: Subscription = {
        id: subscription.id,
        userId: subscription.metadata?.userId || '',
        plan: subscription.items.data[0].price.nickname === 'Premium' ? 'premium' : 'pro',
        status: subscription.status === 'active' ? 'active' : 'inactive',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        price: subscription.items.data[0].price.unit_amount / 100,
        currency: subscription.items.data[0].price.currency,
      };

      return sub;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_methods?customer=${customerId}&type=card`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/payment_methods/${paymentMethodId}/attach`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
        }),
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/payment_methods/${paymentMethodId}/detach`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }
}

export const paymentService = new StripePaymentService();

// Simple provider that works on both web and mobile
export function PaymentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Web-compatible payment hook
export function usePayments() {
  const processPayment = async (amount: number, currency: string, description: string) => {
    if (Platform.OS === 'web') {
      console.log('Web payment processing - would redirect to Stripe Checkout');
      throw new Error('Web payments require Stripe Checkout integration');
    }
    
    try {
      const clientSecret = await paymentService.initializePayment(amount, currency, description);
      console.log('Payment initialized with client secret:', clientSecret);
      return { clientSecret };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const createSubscription = async (priceId: string, customerId: string) => {
    return paymentService.createSubscription(priceId, customerId);
  };

  const cancelSubscription = async (subscriptionId: string) => {
    return paymentService.cancelSubscription(subscriptionId);
  };

  return {
    processPayment,
    createSubscription,
    cancelSubscription,
  };
}