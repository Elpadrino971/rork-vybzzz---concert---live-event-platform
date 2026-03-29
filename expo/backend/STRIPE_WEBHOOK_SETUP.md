# 🔔 Configuration Webhook Stripe - Vybzzz

Ce guide vous explique comment configurer et utiliser le webhook Stripe pour gérer les événements de paiement et d'abonnement.

## 📋 Informations du Webhook

- **ID Webhook** : `we_1S7jSvHfGnA3ljfTpqXhJrQx`
- **Nom** : `vybzzz-webhook-prod`
- **URL** : `https://api.vybzzz.com/webhook/stripe`
- **Description** : Webhook VYbzzZ - Paiements billets + abonnements
- **Version API Stripe** : `2025-05-28.basil`
- **Signing Secret** : `whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm` ✅

## 🔧 Configuration

### 1. Récupérer le Signing Secret

1. Connectez-vous à votre dashboard Stripe
2. Allez dans **Developers** > **Webhooks**
3. Cliquez sur votre webhook `vybzzz-webhook-prod`
4. Dans la section **Signing secret**, cliquez sur **Reveal** ou **Click to reveal**
5. Copiez le secret (commence par `whsec_...`)

### 2. Configurer la variable d'environnement

Ajoutez le secret dans votre fichier `backend/.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm
```

✅ **Webhook Secret configuré** : `whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm`

⚠️ **IMPORTANT** : Ne jamais exposer ce secret côté client !

### 3. Événements configurés

Le webhook gère les événements suivants :

#### Paiements (Payment Intents)
- ✅ `payment_intent.succeeded` - Paiement réussi
- ✅ `payment_intent.payment_failed` - Paiement échoué
- ✅ `payment_intent.canceled` - Paiement annulé

#### Abonnements (Subscriptions)
- ✅ `customer.subscription.created` - Abonnement créé
- ✅ `customer.subscription.updated` - Abonnement mis à jour
- ✅ `customer.subscription.deleted` - Abonnement supprimé

#### Factures (Invoices)
- ✅ `invoice.payment_succeeded` - Facture payée avec succès
- ✅ `invoice.payment_failed` - Échec de paiement de facture

#### Méthodes de paiement
- ✅ `payment_method.attached` - Méthode de paiement attachée
- ✅ `payment_method.detached` - Méthode de paiement détachée

## 🧪 Test du Webhook

### Test local avec Stripe CLI

1. **Installer Stripe CLI** :
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
   tar -xvf stripe_*_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   ```

2. **Se connecter à Stripe** :
   ```bash
   stripe login
   ```

3. **Forwarder les webhooks vers votre serveur local** :
   ```bash
   stripe listen --forward-to localhost:3000/webhook/stripe
   ```

   Cela affichera un **Signing secret** pour le développement local (commence par `whsec_...`).

4. **Tester un événement** :
   ```bash
   # Tester un paiement réussi
   stripe trigger payment_intent.succeeded
   
   # Tester un abonnement créé
   stripe trigger customer.subscription.created
   ```

### Test en production

Une fois déployé, vous pouvez tester le webhook depuis le dashboard Stripe :

1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur votre webhook
3. Cliquez sur **Send test webhook**
4. Sélectionnez un événement à tester
5. Vérifiez les logs de votre serveur

## 📊 Structure des données

### Payment Intent Succeeded

```json
{
  "id": "pi_xxxxx",
  "amount": 5000,
  "currency": "eur",
  "status": "succeeded",
  "metadata": {
    "userId": "user_123",
    "eventId": "event_456"
  }
}
```

### Subscription Created

```json
{
  "id": "sub_xxxxx",
  "customer": "cus_xxxxx",
  "status": "active",
  "current_period_start": 1234567890,
  "current_period_end": 1234567890,
  "metadata": {
    "userId": "user_123"
  }
}
```

## 🗄️ Tables Supabase (à créer)

Pour stocker les paiements et abonnements, créez ces tables dans Supabase :

### Table `payments`

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  event_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_event_id ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
```

### Table `subscriptions`

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
```

## 🔒 Sécurité

### Vérification de la signature

Le webhook vérifie automatiquement la signature Stripe pour s'assurer que la requête provient bien de Stripe :

```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

### Bonnes pratiques

1. ✅ **Toujours vérifier la signature** (déjà fait dans le code)
2. ✅ **Utiliser HTTPS en production** (obligatoire pour Stripe)
3. ✅ **Ne jamais exposer le webhook secret** côté client
4. ✅ **Répondre rapidement** (dans les 2 secondes) pour éviter les retries
5. ✅ **Idempotence** : Gérer les événements dupliqués (Stripe peut renvoyer le même événement)

## 🐛 Dépannage

### Erreur : "Webhook Error: No signatures found"

- Vérifiez que le webhook est configuré **AVANT** `express.json()` dans `index.ts`
- Vérifiez que vous utilisez `express.raw({ type: 'application/json' })` pour le webhook

### Erreur : "Webhook Error: Invalid signature"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correctement configuré
- Vérifiez que vous utilisez le bon secret (production vs test)
- Vérifiez que l'URL du webhook correspond exactement

### Webhook non reçu

- Vérifiez que votre serveur est accessible depuis Internet (HTTPS requis)
- Vérifiez les logs Stripe dans le dashboard
- Utilisez Stripe CLI pour tester localement

### Événements dupliqués

- Stripe peut renvoyer le même événement plusieurs fois
- Implémentez l'idempotence en vérifiant si l'événement a déjà été traité
- Utilisez l'ID de l'événement comme clé unique

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Dernière mise à jour** : 2024

