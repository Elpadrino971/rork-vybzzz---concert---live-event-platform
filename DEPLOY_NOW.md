# 🚀 DÉPLOIEMENT EXPRESS - AUJOURD'HUI

**Temps total estimé**: 2-3 heures max
**Objectif**: Site live + Apps sur stores AUJOURD'HUI

---

## 📍 ÉTAPE 1: DNS Hostinger (20 minutes)

### Configuration vybzzz.com

**Aller sur**: hpanel.hostinger.com → Domaines → vybzzz.com → DNS Zone

**Ajouter ces 3 records**:

```
Type: A
Nom: @
Valeur: 76.76.21.21
TTL: 14400

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
TTL: 14400

Type: CNAME
Nom: api
Valeur: vybzzz-backend-production.up.railway.app
TTL: 14400
```

### Configuration vybzzz.app

**Aller sur**: hpanel.hostinger.com → Domaines → vybzzz.app → DNS Zone

**Ajouter ces 2 records**:

```
Type: A
Nom: @
Valeur: 76.76.21.21
TTL: 14400

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
TTL: 14400
```

**✅ FAIT** → Attendre 10-30 minutes (propagation DNS)

---

## 🌐 ÉTAPE 2: Déploiement Web (30 minutes)

### 2.1 Installer les dépendances

```bash
npm install react-ga4 web-vitals schema-dts
```

### 2.2 Variables d'environnement

Créer `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fpdehejqrmkviaxhyrlz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key
SUPABASE_SERVICE_ROLE_KEY=ton_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend
NEXT_PUBLIC_BACKEND_URL=https://api.vybzzz.com

# Optional (pour plus tard)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### 2.3 Déployer sur Vercel

```bash
# Login Vercel
vercel login

# Deploy
vercel --prod

# Ajouter les domaines dans Vercel Dashboard
# Settings → Domains:
# - vybzzz.com
# - www.vybzzz.com
# - vybzzz.app
# - www.vybzzz.app
```

### 2.4 Déployer Backend Railway

```bash
# Push to main (Railway auto-deploy)
git push origin main

# Ajouter custom domain dans Railway:
# Settings → Domains → Add: api.vybzzz.com
```

**✅ FAIT** → Site live sur vybzzz.com

---

## 📱 ÉTAPE 3: Déploiement iOS (1 heure)

### 3.1 Setup EAS

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
```

### 3.2 Configuration app.json

**Mettre à jour** `mobile/app.json`:

```json
{
  "expo": {
    "name": "VyBzzZ",
    "slug": "vybzzz",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.vybzzz.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    },
    "android": {
      "package": "com.vybzzz.app",
      "versionCode": 1
    }
  }
}
```

### 3.3 Build iOS

```bash
# Build pour iOS
eas build --platform ios --profile production

# Attend 15-30 minutes
# Télécharge l'IPA une fois prêt
```

### 3.4 Soumettre à TestFlight

```bash
# Soumettre automatiquement
eas submit --platform ios --latest

# OU manuellement:
# 1. Télécharger l'IPA
# 2. Aller sur App Store Connect
# 3. Uploader via Transporter
```

**✅ FAIT** → App sur TestFlight (beta testing)

---

## 🤖 ÉTAPE 4: Déploiement Android (45 minutes)

### 4.1 Build Android

```bash
# Build APK
eas build --platform android --profile production

# Attend 10-20 minutes
```

### 4.2 Soumettre à Google Play

```bash
# Soumettre automatiquement à Internal Testing
eas submit --platform android --latest --track internal

# OU manuellement:
# 1. Télécharger l'APK/AAB
# 2. Aller sur Google Play Console
# 3. Internal Testing → Upload
```

**✅ FAIT** → App sur Google Play Internal Testing

---

## ⏱️ TIMELINE AUJOURD'HUI

| Heure | Action | Durée |
|-------|--------|-------|
| **Maintenant** | Configuration DNS Hostinger | 20 min |
| **+20 min** | Installation dépendances + env vars | 10 min |
| **+30 min** | Déploiement Vercel + Railway | 20 min |
| **+50 min** | ⏸️ PAUSE (attente DNS propagation) | 30 min |
| **+1h20** | Build iOS avec EAS | 30 min |
| **+1h50** | Build Android avec EAS | 20 min |
| **+2h10** | Soumission TestFlight + Google Play | 20 min |
| **+2h30** | ✅ TOUT EST DÉPLOYÉ | - |

---

## 🎯 CHECKLIST RAPIDE

### DNS
- [ ] vybzzz.com: A record + 2 CNAME
- [ ] vybzzz.app: A record + 1 CNAME
- [ ] Attendre 30 min propagation

### Web
- [ ] `npm install react-ga4 web-vitals schema-dts`
- [ ] `.env.local` configuré
- [ ] `vercel --prod`
- [ ] Domaines ajoutés dans Vercel
- [ ] Railway custom domain

### iOS
- [ ] `eas build --platform ios`
- [ ] Wait build (~30 min)
- [ ] `eas submit --platform ios`
- [ ] TestFlight actif

### Android
- [ ] `eas build --platform android`
- [ ] Wait build (~20 min)
- [ ] `eas submit --platform android`
- [ ] Internal Testing actif

---

## 🆘 EN CAS DE PROBLÈME

### DNS ne propage pas
```bash
# Vérifier
dig vybzzz.com +short
# Doit retourner: 76.76.21.21

# Si rien → attendre 1 heure max
```

### Build EAS échoue
```bash
# Voir les logs
eas build:list
eas build:view [build-id]

# Retry
eas build --platform [ios/android] --clear-cache
```

### Vercel "Invalid Configuration"
```bash
# Dans Vercel Dashboard:
# Domains → Refresh

# Attendre 30-60 min après config DNS
```

---

## 📞 COMMANDES RAPIDES

```bash
# DNS Check
dig vybzzz.com +short
dig vybzzz.app +short

# Deploy Web
npm install react-ga4 web-vitals schema-dts
vercel --prod

# Deploy Mobile
cd mobile
eas build --platform all --profile production
eas submit --platform all --latest

# Status
eas build:list
vercel ls
```

---

**GO NOW!** Commence par la config DNS Hostinger pendant que je nettoie le code! 🚀
