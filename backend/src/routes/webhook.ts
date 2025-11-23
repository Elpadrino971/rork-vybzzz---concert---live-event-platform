import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabaseService } from '../services/supabase.service';
import { notificationsService } from '../services/notifications.service';

const router = express.Router();

// Initialiser Stripe avec la version de l'API spécifiée
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

/**
 * POST /webhook/stripe
 * Webhook Stripe pour gérer les événements de paiement et d'abonnement
 * 
 * ⚠️ IMPORTANT: Cette route doit être configurée AVANT le middleware express.json()
 * car Stripe envoie les données en raw body pour vérifier la signature
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET n\'est pas configuré');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook pour la sécurité
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('❌ Erreur de signature webhook:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      // ============================================
      // ÉVÉNEMENTS DE PAIEMENT (Payment Intents)
      // ============================================
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      // ============================================
      // ÉVÉNEMENTS D'ABONNEMENT (Subscriptions)
      // ============================================

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // ============================================
      // ÉVÉNEMENTS DE MÉTHODE DE PAIEMENT
      // ============================================

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;

      // ============================================
      // ÉVÉNEMENTS PAR DÉFAUT
      // ============================================

      default:
        console.log(`⚠️ Événement non géré: ${event.type}`);
    }

    // Répondre rapidement à Stripe (dans les 2 secondes)
    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    // On répond quand même à Stripe pour éviter les retries inutiles
    // Mais on log l'erreur pour investigation
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HANDLERS POUR LES ÉVÉNEMENTS
// ============================================

/**
 * Gère un paiement réussi
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Paiement réussi:', paymentIntent.id);
  
  const { userId, eventId } = paymentIntent.metadata;

  // Mettre à jour la base de données
  try {
    const supabase = supabaseService.getClient();
    
    // Créer ou mettre à jour un enregistrement de paiement
    // Vous pouvez créer une table 'payments' dans Supabase pour stocker ces informations
    const paymentData = {
      stripe_payment_intent_id: paymentIntent.id,
      user_id: userId || null,
      event_id: eventId || null,
      amount: paymentIntent.amount / 100, // Convertir de cents en euros
      currency: paymentIntent.currency,
      status: 'succeeded',
      created_at: new Date(paymentIntent.created * 1000).toISOString(),
    };

    // Insérer dans la table 'payments' (créée via supabase-schema.sql)
    try {
      const { error } = await supabase
        .from('payments')
        .insert(paymentData);

      if (error) {
        console.error('❌ Erreur lors de l\'insertion du paiement:', error);
        // Ne pas bloquer si l'insertion échoue
      } else {
        console.log('✅ Paiement enregistré dans la base de données');
      }
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
      // Ne pas bloquer le traitement du paiement
    }

    // Envoyer une notification push si userId est disponible
    if (userId) {
      try {
        const eventTitle = paymentIntent.description || 'Votre achat';
        await notificationsService.notifyPaymentSuccess(
          userId,
          paymentIntent.amount / 100,
          eventTitle
        );
        console.log('✅ Notification de paiement envoyée');
      } catch (notifError) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', notifError);
        // Ne pas bloquer le traitement du paiement si la notification échoue
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'enregistrement du paiement:', error);
    throw error;
  }
}

/**
 * Gère un paiement échoué
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Paiement échoué:', paymentIntent.id);
  
  const { userId, eventId } = paymentIntent.metadata;

  // Mettre à jour la base de données
  try {
    const supabase = supabaseService.getClient();
    
    const paymentData = {
      stripe_payment_intent_id: paymentIntent.id,
      user_id: userId || null,
      event_id: eventId || null,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error',
      created_at: new Date(paymentIntent.created * 1000).toISOString(),
    };

    // Insérer dans la table 'payments'
    try {
      const { error } = await supabase
        .from('payments')
        .insert(paymentData);

      if (error) {
        console.error('❌ Erreur lors de l\'insertion de l\'échec:', error);
      } else {
        console.log('✅ Échec de paiement enregistré');
      }
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'échec:', error);
  }
}

/**
 * Gère un paiement annulé
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('⚠️ Paiement annulé:', paymentIntent.id);
  
  // Mettre à jour le statut dans la base de données
  // const supabase = supabaseService.getClient();
  // await supabase
  //   .from('payments')
  //   .update({ status: 'canceled' })
  //   .eq('stripe_payment_intent_id', paymentIntent.id);
}

/**
 * Gère la création d'un abonnement
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Abonnement créé:', subscription.id);
  
  const { userId } = subscription.metadata;

  try {
    const supabase = supabaseService.getClient();
    
    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      user_id: userId || null,
      customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date(subscription.created * 1000).toISOString(),
    };

    // Insérer dans la table 'subscriptions' (créée via supabase-schema.sql)
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('❌ Erreur lors de l\'insertion de l\'abonnement:', error);
      } else {
        console.log('✅ Abonnement enregistré dans la base de données');
      }
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'abonnement:', error);
  }
}

/**
 * Gère la mise à jour d'un abonnement
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Abonnement mis à jour:', subscription.id);
  
  try {
    const supabase = supabaseService.getClient();
    
    const updates = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mettre à jour dans la table 'subscriptions'
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
      } else {
        console.log('✅ Abonnement mis à jour dans la base de données');
      }
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
  }
}

/**
 * Gère la suppression d'un abonnement
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Abonnement supprimé:', subscription.id);
  
  try {
    const supabase = supabaseService.getClient();
    
    // Mettre à jour le statut dans la table 'subscriptions'
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled', 
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'abonnement:', error);
      } else {
        console.log('✅ Abonnement marqué comme annulé');
      }
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression de l\'abonnement:', error);
  }
}

/**
 * Gère une facture payée avec succès
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Facture payée:', invoice.id);
  
  // Mettre à jour l'abonnement si nécessaire
  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;
    
    console.log('✅ Facture liée à l\'abonnement:', subscriptionId);
  }
}

/**
 * Gère une facture avec paiement échoué
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Échec de paiement de facture:', invoice.id);
  
  // Notifier l'utilisateur ou prendre des actions
  if (invoice.subscription) {
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;
    
    console.log('⚠️ Échec de paiement pour l\'abonnement:', subscriptionId);
  }
}

/**
 * Gère l'attachement d'une méthode de paiement
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('✅ Méthode de paiement attachée:', paymentMethod.id);
}

/**
 * Gère le détachement d'une méthode de paiement
 */
async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('⚠️ Méthode de paiement détachée:', paymentMethod.id);
}

export default router;

