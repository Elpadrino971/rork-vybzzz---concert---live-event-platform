# 🚨 VyBzzZ - Actions Immédiates Requises

**Date**: 15 novembre 2025
**Lancement**: 31 décembre 2025
**Jours restants**: 46 jours

---

## ⚡ TOP 5 PRIORITÉS CETTE SEMAINE

### 1. 🏢 LÉGAL - Enregistrement Société (BLOQUANT)
**Impact**: Sans ceci, le lancement est ILLÉGAL

**Actions**:
```bash
[ ] Créer VyBzzZ SAS au greffe du tribunal de commerce
[ ] Obtenir SIRET (14 chiffres)
[ ] Obtenir RCS (Ville + numéro)
[ ] Obtenir TVA intracommunautaire (FR + 11 chiffres)
[ ] Choisir adresse siège social
```

**Coût**: ~500€
**Délai**: 2-3 semaines
**Contact**: Greffe du tribunal de commerce de votre ville

---

### 2. 📜 LÉGAL - Droits David Guetta (BLOQUANT)
**Impact**: Sans autorisation, annulation forcée du lancement

**Actions**:
```bash
[ ] Contacter l'agent/management de David Guetta
[ ] Obtenir autorisation d'utiliser son nom
[ ] Négocier droits de diffusion du concert
[ ] Signer contrat écrit
[ ] Vérifier droits musicaux (SACEM)
```

**Contact**: [Agent David Guetta - À trouver]
**Priorité**: MAXIMALE

---

### 3. ☁️ PRODUCTION - Configuration Environnement
**Impact**: Backend non fonctionnel en production

**Actions**:
```bash
# Vercel (Frontend)
[ ] Configurer toutes les variables d'environnement
[ ] Ajouter CRON_SECRET (32+ chars aléatoires)
[ ] Configurer domaine custom (vybzzz.com)
[ ] Activer les cron jobs

# Railway (Backend)
[ ] Configurer toutes les variables d'environnement
[ ] Vérifier CORS_ORIGIN (domaine Vercel)
[ ] Tester déploiement

# Supabase
[ ] Exécuter migration storage (add_secure_storage_configuration.sql)
[ ] Vérifier RLS policies
[ ] Configurer limites de quota
```

**Commande de vérification**:
```bash
npm run check-env:prod
npm run setup:storage  # En production
```

**Délai**: 2 jours

---

### 4. 💳 STRIPE - Tests Production
**Impact**: Paiements bloqués si non testé

**Actions**:
```bash
[ ] Passer Stripe en mode LIVE (obtenir clés pk_live_ et sk_live_)
[ ] Configurer webhook production:
    URL: https://vybzzz.com/api/stripe/webhook
    Events: payment_intent.*, customer.subscription.*, account.updated
[ ] Tester onboarding Stripe Connect (compte artiste)
[ ] Tester achat de ticket avec vraie carte (petit montant)
[ ] Vérifier payout automatique J+21
```

**Délai**: 3 jours
**Coût test**: ~10€ (transactions test)

---

### 5. 📱 MOBILE - Développer Écrans MVP
**Impact**: Plateforme mobile-first sans app mobile

**Écrans critiques à développer**:
```bash
[ ] app/(tabs)/index.tsx       - Feed événements
[ ] app/events/[id].tsx        - Détail événement + achat ticket
[ ] components/VideoPlayer.tsx - Lecteur live + Chromecast
[ ] app/(tabs)/profile.tsx     - Profil utilisateur
[ ] Intégration Stripe SDK mobile
[ ] Tests iOS + Android
```

**Délai**: 2-3 semaines
**Priorité**: HAUTE

---

## 📋 Checklist Rapide Avant Déploiement Prod

### Infrastructure
```bash
[ ] npm run check-env:prod  # Valider variables
[ ] npm run setup:storage   # Configurer stockage
[ ] npm test               # Tous les tests passent
[ ] npm run build          # Build sans erreurs
```

### Stripe
```bash
[ ] Webhook URL configurée
[ ] Stripe Connect testé
[ ] Test achat ticket
[ ] Test payout artiste
```

### Légal
```bash
[ ] SIRET obtenu
[ ] RCS obtenu
[ ] Placeholders remplis dans:
    - app/terms/page.tsx (lignes 43-49)
    - app/legal/page.tsx
    - app/privacy/page.tsx
[ ] Médiateur consommation signé
```

### Fonctionnel
```bash
[ ] YouTube Live stream testé
[ ] Chat temps réel fonctionne
[ ] Notifications push actives
[ ] Emails envoyés correctement
```

---

## 🎯 Planning 46 Jours

### Semaine 1 (18-24 nov) - LÉGAL
- Enregistrement société
- Contact David Guetta
- Configuration prod

### Semaine 2 (25 nov-1 déc) - INFRASTRUCTURE
- Tests Stripe prod
- Migration storage
- Monitoring Sentry

### Semaine 3-4 (2-15 déc) - MOBILE
- Développement écrans
- Tests iOS/Android
- Intégration API

### Semaine 5 (16-22 déc) - STREAMING
- Tests YouTube Live
- Backup AWS IVS
- Tests de charge

### Semaine 6 (23-29 déc) - FINITIONS
- Remplir placeholders légaux
- Tests bout en bout
- Formation support

### 31 DÉCEMBRE - 🚀 LANCEMENT

---

## ⚠️ Points de Vigilance

### Risques Critiques
1. **Société non enregistrée** → Lancement illégal
2. **Pas d'accord David Guetta** → Annulation forcée
3. **App mobile non prête** → Web-only (expérience dégradée)
4. **YouTube échoue** → Pas de stream (préparer backup)

### Actions de Mitigation
```bash
✅ Lancer IMMÉDIATEMENT enregistrement société
✅ Contacter AUJOURD'HUI management David Guetta
✅ Prioriser développement mobile cette semaine
✅ Configurer AWS IVS en backup de YouTube
```

---

## 📞 Contacts Urgents

**Greffe Tribunal Commerce**: [À chercher selon votre ville]
**Management David Guetta**: [À trouver]
**Stripe Support**: support@stripe.com
**Supabase Support**: support@supabase.com

---

## 🆘 En Cas de Blocage

Si un élément critique bloque:

1. **Légal non prêt** → Reporter lancement (impossible de lancer illégalement)
2. **Droits refusés** → Changer d'artiste ou reporter
3. **Mobile non prêt** → Lancer en web-only temporairement
4. **Streaming échoue** → Utiliser AWS IVS backup

**PRIORITÉ ABSOLUE**: Légal + Droits artiste

Tout le reste est technique et peut se résoudre.

---

**Prochaine révision**: 22 novembre 2025
