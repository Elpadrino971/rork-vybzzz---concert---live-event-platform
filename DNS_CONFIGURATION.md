# 🌐 Configuration DNS - VyBzzZ (.COM + .APP)

**Date**: 2025-11-16
**Domaines**:
- `vybzzz.com` - Application Web
- `vybzzz.app` - Application Mobile + Deep Links

---

## 📋 Vue d'Ensemble

### Stratégie des Domaines

| Domaine | Usage | Plateforme | SSL/TLS |
|---------|-------|------------|---------|
| **vybzzz.com** | Site web principal | Vercel | Auto (Let's Encrypt) |
| **www.vybzzz.com** | Redirection → vybzzz.com | Vercel | Auto |
| **api.vybzzz.com** | Backend API | Railway | Auto |
| **vybzzz.app** | Mobile deep links | Vercel (ou CloudFlare Pages) | **Obligatoire HTTPS** |
| **www.vybzzz.app** | Redirection → vybzzz.app | Vercel | **Obligatoire HTTPS** |

**⚠️ Important**: Les domaines `.APP` ont des exigences de sécurité strictes:
- **HTTPS obligatoire** (HSTS préchargé)
- Impossible d'utiliser HTTP même temporairement
- Certificat SSL doit être valide avant configuration DNS

---

## 🔵 Configuration .COM (Application Web)

### Étape 1: Acheter le Domaine

**Registrars recommandés**:
- **Cloudflare** (9$/an, DNS gratuit, sécurisé)
- **Namecheap** (12$/an, populaire)
- **Google Domains** (12$/an, intégration Google)

### Étape 2: Configuration DNS chez le Registrar

#### Option A: DNS Cloudflare (Recommandé)

**1. Ajouter le site à Cloudflare**:
```
1. Aller sur cloudflare.com
2. Add a Site
3. Enter domain: vybzzz.com
4. Select Free plan
5. Cloudflare scanne les DNS existants
```

**2. Mettre à jour les Nameservers chez le registrar**:
```
Chez votre registrar (Namecheap, GoDaddy, etc.):
1. Domain Management → Nameservers
2. Use custom nameservers:
   - carson.ns.cloudflare.com
   - kelly.ns.cloudflare.com
3. Save
4. Attendre propagation (5-60 min)
```

**3. Configurer les DNS Records dans Cloudflare**:

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ | 76.76.21.21 | ✅ Proxied | Auto |
| CNAME | www | vybzzz.com | ✅ Proxied | Auto |
| CNAME | api | vybzzz-backend.up.railway.app | ❌ DNS only | Auto |

**Commandes Cloudflare CLI** (alternative):
```bash
# Installer Cloudflare CLI
npm install -g cloudflare-cli

# Login
cf login

# Ajouter records
cf dns create vybzzz.com A @ 76.76.21.21 --proxied
cf dns create vybzzz.com CNAME www vybzzz.com --proxied
cf dns create vybzzz.com CNAME api vybzzz-backend.up.railway.app
```

#### Option B: DNS Direct (Sans Cloudflare)

**Chez votre registrar**:

| Type | Host | Points to | TTL |
|------|------|-----------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |
| CNAME | api | vybzzz-backend.up.railway.app | 3600 |

### Étape 3: Configuration Vercel

**1. Ajouter le domaine dans Vercel**:
```
1. Vercel Dashboard → Project: vybzzz-platform
2. Settings → Domains
3. Add Domain: vybzzz.com
4. Vercel vérifie automatiquement les DNS
5. Add Domain: www.vybzzz.com (redirection automatique)
```

**2. Configuration SSL**:
```
Vercel configure automatiquement:
- Certificat Let's Encrypt
- Renouvellement automatique tous les 90 jours
- Force HTTPS activé par défaut
```

**3. Redirection www → apex**:
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/:path((?!www).*)",
      "has": [
        {
          "type": "host",
          "value": "www.vybzzz.com"
        }
      ],
      "destination": "https://vybzzz.com/:path*",
      "permanent": true
    }
  ]
}
```

### Étape 4: Configuration Cloudflare SSL/TLS (si utilisé)

```
Cloudflare Dashboard → SSL/TLS:
1. Overview → Encryption mode: Full (strict)
2. Edge Certificates:
   - Always Use HTTPS: ON
   - Automatic HTTPS Rewrites: ON
   - Minimum TLS Version: 1.2
   - TLS 1.3: Enabled
   - HTTP Strict Transport Security (HSTS): Enabled
     - Max Age: 6 months
     - Include subdomains: ON
     - Preload: ON
```

### Étape 5: Configuration Backend (api.vybzzz.com)

**Railway**:
```
1. Railway Dashboard → Project
2. Settings → Domains
3. Add Custom Domain: api.vybzzz.com
4. Railway fournit le target CNAME:
   vybzzz-backend-production.up.railway.app
5. Ajouter ce CNAME dans Cloudflare (voir table ci-dessus)
```

**⚠️ Important**: Pour `api.vybzzz.com`, désactiver le proxy Cloudflare (DNS only) pour éviter les timeouts WebSocket.

---

## 🟣 Configuration .APP (Application Mobile)

### Pourquoi .APP ?

Les domaines `.APP`:
- **Réservés pour applications** (mobile, web apps)
- **HTTPS obligatoire** (HSTS préchargé par Google)
- **Sécurité renforcée** (protection contre MITM)
- **Parfait pour deep links** iOS/Android

### Étape 1: Acheter le Domaine .APP

**Registrars supportant .APP**:
- **Google Domains** (12$/an) - Recommandé
- **Cloudflare** (15$/an)
- **Namecheap** (9$/an)

### Étape 2: Configuration DNS pour .APP

**⚠️ CRITIQUE**: Configurer SSL AVANT de pointer le DNS!

#### Option A: Vercel (Recommandé pour .APP)

**1. Ajouter dans Vercel Dashboard**:
```
1. Vercel → New Project
2. Import Git Repository: vybzzz-platform
3. Configure → Root Directory: ./
4. Deploy
5. Settings → Domains → Add: vybzzz.app
```

**2. DNS Records** (chez le registrar):

| Type | Name | Content | TTL |
|------|------|---------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

**Vercel configure automatiquement**:
- ✅ Certificat SSL avant DNS propagation
- ✅ HSTS headers
- ✅ Force HTTPS

#### Option B: Cloudflare Pages

**1. Créer Cloudflare Pages**:
```bash
# Installer Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish .next/static --project-name=vybzzz-app
```

**2. Custom Domain**:
```
1. Cloudflare Pages → vybzzz-app → Custom domains
2. Add custom domain: vybzzz.app
3. Cloudflare configure automatiquement SSL
```

**3. DNS Records** (auto-configurés par Cloudflare):
```
A @ <Cloudflare IP>
CNAME www vybzzz-app.pages.dev
```

### Étape 3: Vérification HTTPS .APP

**Test obligatoire**:
```bash
# Vérifier SSL
curl -I https://vybzzz.app

# Résultat attendu:
HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains; preload
```

**⚠️ Si erreur SSL**:
```
ERR_SSL_PROTOCOL_ERROR
→ Le certificat n'est pas encore configuré
→ Attendre 5-10 minutes après ajout du domaine dans Vercel
→ Vérifier que DNS pointe correctement
```

### Étape 4: Configuration Deep Links (Mobile)

#### iOS - Universal Links

**1. Créer Apple App Site Association (AASA)**:

**Fichier**: `public/.well-known/apple-app-site-association`
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.vybzzz.app",
        "paths": [
          "/events/*",
          "/event/*",
          "/artist/*",
          "/profile/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAM_ID.com.vybzzz.app"]
  }
}
```

**2. Héberger sur https://vybzzz.app/.well-known/apple-app-site-association**

**3. Configuration Xcode**:
```xml
<!-- Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>vybzzz</string>
    </array>
  </dict>
</array>

<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:vybzzz.app</string>
</array>
```

#### Android - App Links

**1. Créer assetlinks.json**:

**Fichier**: `public/.well-known/assetlinks.json`
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.vybzzz.app",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT"
    ]
  }
}]
```

**2. Obtenir SHA256 Fingerprint**:
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore
keytool -list -v -keystore vybzzz-release.keystore -alias vybzzz
```

**3. Configuration AndroidManifest.xml**:
```xml
<activity android:name=".MainActivity">
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data
      android:scheme="https"
      android:host="vybzzz.app"
      android:pathPrefix="/events" />
    <data
      android:scheme="https"
      android:host="vybzzz.app"
      android:pathPrefix="/event" />
  </intent-filter>
</activity>
```

**4. Héberger sur https://vybzzz.app/.well-known/assetlinks.json**

### Étape 5: Tester Deep Links

**iOS**:
```bash
# Via Simulator
xcrun simctl openurl booted "https://vybzzz.app/events/123"

# Via device
# Envoyer lien via Notes ou iMessage
```

**Android**:
```bash
# Via ADB
adb shell am start -a android.intent.action.VIEW -d "https://vybzzz.app/events/123"
```

**Vérification**:
```bash
# iOS - Vérifier AASA
curl https://vybzzz.app/.well-known/apple-app-site-association

# Android - Vérifier assetlinks
curl https://vybzzz.app/.well-known/assetlinks.json

# Tester avec Apple Search API
https://search.developer.apple.com/appsearch-validation-tool
```

---

## 🔧 Configuration Avancée

### Custom Scheme (vybzzz://)

En plus des domaines .COM et .APP, configurer un custom scheme:

**iOS** (`mobile/app.json`):
```json
{
  "expo": {
    "scheme": "vybzzz",
    "ios": {
      "bundleIdentifier": "com.vybzzz.app",
      "associatedDomains": [
        "applinks:vybzzz.app",
        "applinks:www.vybzzz.app"
      ]
    }
  }
}
```

**Android** (`mobile/app.json`):
```json
{
  "expo": {
    "android": {
      "package": "com.vybzzz.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "vybzzz.app",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Usage**:
```typescript
// Open app from anywhere
// vybzzz://events/123
// https://vybzzz.app/events/123

import * as Linking from 'expo-linking'

// Listen to deep links
Linking.addEventListener('url', (event) => {
  const { path, queryParams } = Linking.parse(event.url)
  // Navigate to path
})
```

---

## 📊 Tableau Récapitulatif DNS

### Configuration Finale

| Domaine | Type | Name | Target | Proxy | Usage |
|---------|------|------|--------|-------|-------|
| **vybzzz.com** | A | @ | 76.76.21.21 | ✅ | Web app principal |
| **vybzzz.com** | CNAME | www | vybzzz.com | ✅ | Redirection www |
| **vybzzz.com** | CNAME | api | railway.app | ❌ | Backend API |
| **vybzzz.app** | A | @ | 76.76.21.21 | ✅ | Deep links mobile |
| **vybzzz.app** | CNAME | www | vybzzz.app | ✅ | Redirection www |

### Headers de Sécurité

**vybzzz.com** (via Cloudflare):
```
Strict-Transport-Security: max-age=15552000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
```

**vybzzz.app** (HSTS obligatoire):
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## ✅ Checklist de Configuration

### Domaine .COM (Web App)

- [ ] Domaine vybzzz.com acheté
- [ ] DNS configurés (A + CNAME)
- [ ] Nameservers pointent vers Cloudflare (si utilisé)
- [ ] Domaine ajouté dans Vercel
- [ ] SSL/TLS actif (HTTPS)
- [ ] www.vybzzz.com redirige vers vybzzz.com
- [ ] api.vybzzz.com configuré pour Railway
- [ ] Test: `curl https://vybzzz.com` → 200 OK
- [ ] Test: `curl https://api.vybzzz.com/health` → 200 OK

### Domaine .APP (Mobile Deep Links)

- [ ] Domaine vybzzz.app acheté
- [ ] SSL configuré AVANT DNS (Vercel/Cloudflare)
- [ ] DNS configurés (A + CNAME)
- [ ] Domaine ajouté dans Vercel
- [ ] HTTPS obligatoire vérifié
- [ ] HSTS header présent
- [ ] `.well-known/apple-app-site-association` créé
- [ ] `.well-known/assetlinks.json` créé
- [ ] Bundle ID iOS configuré: `com.vybzzz.app`
- [ ] Package Android configuré: `com.vybzzz.app`
- [ ] Deep links testés iOS
- [ ] Deep links testés Android

---

## 🚨 Troubleshooting

### Problème 1: DNS ne se propage pas

**Symptômes**: `nslookup vybzzz.com` ne retourne rien

**Solutions**:
```bash
# Vérifier propagation DNS
dig vybzzz.com +short
dig www.vybzzz.com +short
dig api.vybzzz.com +short

# Tester depuis différents DNS
dig @8.8.8.8 vybzzz.com  # Google DNS
dig @1.1.1.1 vybzzz.com  # Cloudflare DNS

# Flush DNS local
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

**Attendre**: 5-60 minutes (max 48h)

### Problème 2: SSL Error sur .APP

**Erreur**: `ERR_SSL_PROTOCOL_ERROR` ou `NET::ERR_CERT_COMMON_NAME_INVALID`

**Cause**: Le certificat n'est pas configuré avant la propagation DNS

**Solution**:
```bash
# 1. Retirer temporairement les DNS records
# 2. Ajouter domaine dans Vercel
# 3. Attendre que Vercel génère le certificat (5-10 min)
# 4. Vérifier certificat
curl -vI https://vybzzz.app 2>&1 | grep "SSL certificate"

# 5. Ajouter les DNS records seulement APRÈS
```

### Problème 3: Deep Links ne fonctionnent pas (iOS)

**Symptômes**: Le lien ouvre Safari au lieu de l'app

**Debug**:
```bash
# 1. Vérifier AASA accessible
curl https://vybzzz.app/.well-known/apple-app-site-association

# 2. Vérifier format JSON valide
cat public/.well-known/apple-app-site-association | jq .

# 3. Tester avec Apple validator
# https://search.developer.apple.com/appsearch-validation-tool

# 4. Vérifier Associated Domains dans Xcode
# Signing & Capabilities → Associated Domains
# Doit contenir: applinks:vybzzz.app

# 5. Réinstaller l'app (iOS cache AASA)
```

### Problème 4: Deep Links ne fonctionnent pas (Android)

**Symptômes**: Intent Chooser s'affiche au lieu d'ouvrir directement l'app

**Debug**:
```bash
# 1. Vérifier assetlinks.json
curl https://vybzzz.app/.well-known/assetlinks.json

# 2. Vérifier SHA256 fingerprint correct
adb shell pm get-app-links com.vybzzz.app

# 3. Vérifier intent filter
adb shell dumpsys package com.vybzzz.app

# 4. Force verify
adb shell pm verify-app-links --re-verify com.vybzzz.app

# 5. Clear defaults
adb shell pm set-app-links --package com.vybzzz.app 0 all
adb shell pm set-app-links --package com.vybzzz.app 2 vybzzz.app
```

### Problème 5: CORS Errors (api.vybzzz.com)

**Erreur**: `Access-Control-Allow-Origin header missing`

**Solution** (`backend/src/index.ts`):
```typescript
import cors from 'cors'

app.use(cors({
  origin: [
    'https://vybzzz.com',
    'https://www.vybzzz.com',
    'https://vybzzz.app',
    'https://www.vybzzz.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

## 📞 Support

### Vérifications Automatiques

**Script de test** (`scripts/test-domains.sh`):
```bash
#!/bin/bash

echo "🔍 Testing VyBzzZ Domains..."

# Test .COM
echo "\n📍 vybzzz.com"
curl -I https://vybzzz.com 2>&1 | grep "HTTP\|Location\|strict-transport"

echo "\n📍 www.vybzzz.com"
curl -I https://www.vybzzz.com 2>&1 | grep "HTTP\|Location"

echo "\n📍 api.vybzzz.com"
curl https://api.vybzzz.com/health 2>&1

# Test .APP
echo "\n📍 vybzzz.app"
curl -I https://vybzzz.app 2>&1 | grep "HTTP\|strict-transport"

echo "\n📍 Deep Links Files"
curl https://vybzzz.app/.well-known/apple-app-site-association
curl https://vybzzz.app/.well-known/assetlinks.json

echo "\n✅ All tests completed"
```

**Rendre exécutable**:
```bash
chmod +x scripts/test-domains.sh
./scripts/test-domains.sh
```

---

## 📚 Ressources

### Documentation Officielle

- **Vercel Domains**: https://vercel.com/docs/concepts/projects/domains
- **Railway Custom Domains**: https://docs.railway.app/deploy/custom-domains
- **Cloudflare DNS**: https://developers.cloudflare.com/dns/
- **iOS Universal Links**: https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content
- **Android App Links**: https://developer.android.com/training/app-links

### Outils de Test

- **DNS Checker**: https://dnschecker.org/
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Apple AASA Validator**: https://search.developer.apple.com/appsearch-validation-tool
- **Google Digital Asset Links Tester**: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://vybzzz.app

---

**Document créé le**: 2025-11-16
**Dernière mise à jour**: 2025-11-16
**Prochaine révision**: Après configuration DNS
