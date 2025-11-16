# 🟣 Configuration DNS Hostinger - VyBzzZ

**Date**: 2025-11-16
**Registrar**: Hostinger
**Domaines**: vybzzz.com + vybzzz.app

---

## 📋 Configuration Rapide

### Résumé des DNS Records à Créer

| Domaine | Type | Nom | Cible/Valeur | TTL |
|---------|------|-----|--------------|-----|
| **vybzzz.com** | A | @ | 76.76.21.21 | 14400 |
| **vybzzz.com** | CNAME | www | cname.vercel-dns.com | 14400 |
| **vybzzz.com** | CNAME | api | vybzzz-backend-production.up.railway.app | 14400 |
| **vybzzz.app** | A | @ | 76.76.21.21 | 14400 |
| **vybzzz.app** | CNAME | www | cname.vercel-dns.com | 14400 |

---

## 🚀 Configuration Étape par Étape

### Étape 1: Accéder à la Gestion DNS Hostinger

**1. Connexion**:
```
1. Aller sur hpanel.hostinger.com
2. Se connecter avec ton compte
3. Tu arrives sur le Dashboard Hostinger
```

**2. Accéder aux DNS**:
```
1. Dans le menu de gauche → "Domaines"
2. Tu verras la liste de tes domaines:
   - vybzzz.com
   - vybzzz.app
3. Cliquer sur "Gérer" à côté de vybzzz.com
```

**3. Ouvrir la Zone DNS**:
```
1. Dans la page du domaine → Chercher "DNS / Nameservers"
2. Cliquer sur "DNS Zone"
3. Tu verras les records DNS actuels
```

---

### Étape 2: Configuration vybzzz.com (Application Web)

#### 2.1 Supprimer les Records Existants (si nécessaire)

**⚠️ Avant de commencer**:
- Hostinger crée souvent des records par défaut (A, CNAME pour www, etc.)
- Il faut les supprimer ou modifier

**Records à supprimer** (si présents):
```
- A record pointant vers l'IP Hostinger (ex: 141.94.xxx.xxx)
- CNAME www pointant vers un autre domaine
- Tout record "parking" ou "default"
```

**Comment supprimer**:
```
1. Dans la DNS Zone
2. Trouver le record à supprimer
3. Cliquer sur l'icône "Poubelle" ou "Delete"
4. Confirmer
```

#### 2.2 Ajouter le Record A (Root Domain)

**Configuration**:
```
Type: A
Nom: @ (ou laisser vide)
Pointe vers: 76.76.21.21
TTL: 14400 (4 heures)
```

**Étapes dans Hostinger**:
```
1. Cliquer sur "Ajouter un enregistrement" ou "Add Record"
2. Sélectionner Type: A
3. Nom/Host: @ (représente vybzzz.com)
4. Pointe vers/Points to: 76.76.21.21
5. TTL: 14400 (par défaut)
6. Sauvegarder
```

**Pourquoi 76.76.21.21 ?**
- C'est l'IP de Vercel pour les domaines apex (root)
- Vercel redirige automatiquement vers ton app

#### 2.3 Ajouter le Record CNAME pour www

**Configuration**:
```
Type: CNAME
Nom: www
Pointe vers: cname.vercel-dns.com
TTL: 14400
```

**Étapes**:
```
1. Ajouter un enregistrement
2. Type: CNAME
3. Nom/Host: www
4. Pointe vers/Points to: cname.vercel-dns.com
5. TTL: 14400
6. Sauvegarder
```

**⚠️ Important**: Ne pas mettre de point final dans "cname.vercel-dns.com"

#### 2.4 Ajouter le Record CNAME pour api

**Configuration**:
```
Type: CNAME
Nom: api
Pointe vers: vybzzz-backend-production.up.railway.app
TTL: 14400
```

**⚠️ Note**: Tu obtiendras l'URL exacte Railway à l'Étape 5 (Configuration Railway)

**Étapes**:
```
1. Ajouter un enregistrement
2. Type: CNAME
3. Nom/Host: api
4. Pointe vers: [URL Railway - à obtenir plus tard]
5. TTL: 14400
6. Sauvegarder
```

#### 2.5 Vérification vybzzz.com

**DNS Records finaux** (ce que tu dois voir dans Hostinger):

```
Type    Nom     Pointe vers                              TTL
─────────────────────────────────────────────────────────────
A       @       76.76.21.21                              14400
CNAME   www     cname.vercel-dns.com                     14400
CNAME   api     vybzzz-backend-production.up.railway.app 14400
```

---

### Étape 3: Configuration vybzzz.app (Application Mobile)

**Retour à la liste des domaines**:
```
1. hpanel.hostinger.com → Domaines
2. Cliquer sur "Gérer" à côté de vybzzz.app
3. DNS Zone
```

#### 3.1 Ajouter le Record A

**⚠️ IMPORTANT pour .APP**: Le certificat SSL doit être configuré AVANT la propagation DNS!

**Configuration**:
```
Type: A
Nom: @
Pointe vers: 76.76.21.21
TTL: 14400
```

**Étapes**: Identiques à vybzzz.com (voir 2.2)

#### 3.2 Ajouter le Record CNAME pour www

**Configuration**:
```
Type: CNAME
Nom: www
Pointe vers: cname.vercel-dns.com
TTL: 14400
```

**Étapes**: Identiques à vybzzz.com (voir 2.3)

#### 3.3 Vérification vybzzz.app

**DNS Records finaux**:
```
Type    Nom     Pointe vers              TTL
──────────────────────────────────────────────
A       @       76.76.21.21              14400
CNAME   www     cname.vercel-dns.com     14400
```

---

### Étape 4: Configuration Vercel (Ajouter les Domaines)

**Maintenant que les DNS sont configurés, ajouter les domaines dans Vercel**:

#### 4.1 Via Vercel Dashboard (Recommandé)

**Pour vybzzz.com**:
```
1. Aller sur vercel.com/dashboard
2. Sélectionner ton projet (vybzzz-platform)
3. Settings → Domains
4. Cliquer "Add"
5. Entrer: vybzzz.com
6. Cliquer "Add"
7. Vercel vérifie les DNS automatiquement
8. Attendre "Valid Configuration" (peut prendre 5-60 min)
```

**Répéter pour**:
- www.vybzzz.com
- vybzzz.app
- www.vybzzz.app

#### 4.2 Via Vercel CLI (Alternative)

```bash
# Se connecter
vercel login

# Lier le projet (si pas déjà fait)
vercel link

# Ajouter les domaines
vercel domains add vybzzz.com
vercel domains add www.vybzzz.com
vercel domains add vybzzz.app
vercel domains add www.vybzzz.app
```

#### 4.3 Vérification Vercel

**Dans Vercel Dashboard → Domains, tu dois voir**:
```
✅ vybzzz.com - Valid Configuration
✅ www.vybzzz.com - Redirect to vybzzz.com
✅ vybzzz.app - Valid Configuration
✅ www.vybzzz.app - Redirect to vybzzz.app
```

**Si "Invalid Configuration"**:
- Attendre 10-30 minutes (propagation DNS)
- Vérifier les DNS dans Hostinger
- Utiliser le bouton "Refresh" dans Vercel

---

### Étape 5: Configuration Railway (Backend API)

#### 5.1 Déployer le Backend (si pas déjà fait)

**Via Git Push** (Railway auto-deploy):
```bash
# Assurer que railway.json existe (déjà fait)
cat railway.json

# Push vers main (Railway détecte et déploie)
git push origin main
```

**Ou via Railway CLI**:
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### 5.2 Obtenir l'URL Railway

**Via Railway Dashboard**:
```
1. Aller sur railway.app
2. Sélectionner ton projet backend
3. Settings → Domains
4. Tu verras l'URL par défaut:
   vybzzz-backend-production.up.railway.app
5. Copier cette URL
```

#### 5.3 Ajouter Custom Domain dans Railway

**Dans Railway Dashboard**:
```
1. Settings → Domains
2. Cliquer "Custom Domain"
3. Entrer: api.vybzzz.com
4. Railway fournit le CNAME target (confirmer que c'est bien):
   vybzzz-backend-production.up.railway.app
```

#### 5.4 Mettre à Jour le CNAME dans Hostinger

**Si tu as déjà créé le CNAME api (Étape 2.4)**:
- Vérifier que la cible est correcte

**Si pas encore créé**:
```
1. hpanel.hostinger.com → vybzzz.com → DNS Zone
2. Ajouter enregistrement:
   Type: CNAME
   Nom: api
   Pointe vers: vybzzz-backend-production.up.railway.app
3. Sauvegarder
```

#### 5.5 Vérifier l'API

**Après 10-30 minutes**:
```bash
# Test health endpoint
curl https://api.vybzzz.com/health

# Résultat attendu:
{
  "status": "ok",
  "timestamp": "2025-11-16T...",
  "service": "vybzzz-backend"
}
```

---

### Étape 6: Vérification Complète

#### 6.1 Vérifier la Propagation DNS

**Via Terminal**:
```bash
# Vérifier vybzzz.com
dig vybzzz.com +short
# Doit retourner: 76.76.21.21

# Vérifier www.vybzzz.com
dig www.vybzzz.com +short
# Doit retourner: cname.vercel-dns.com (ou l'IP Vercel)

# Vérifier api.vybzzz.com
dig api.vybzzz.com +short
# Doit retourner: vybzzz-backend-production.up.railway.app

# Vérifier vybzzz.app
dig vybzzz.app +short
# Doit retourner: 76.76.21.21
```

**Via Outil en Ligne**:
```
Aller sur: https://dnschecker.org/
Entrer: vybzzz.com
Vérifier: A record = 76.76.21.21

Répéter pour tous les domaines
```

#### 6.2 Vérifier HTTPS et SSL

**Test vybzzz.com**:
```bash
curl -I https://vybzzz.com

# Doit retourner:
HTTP/2 200
strict-transport-security: max-age=...
```

**Test vybzzz.app** (HTTPS obligatoire):
```bash
curl -I https://vybzzz.app

# Doit retourner:
HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains; preload
```

**⚠️ Si erreur SSL sur .app**:
```
ERR_SSL_PROTOCOL_ERROR
→ Attendre que Vercel génère le certificat (5-15 min après ajout domaine)
→ Vérifier dans Vercel Domains que le statut est "Valid"
```

#### 6.3 Utiliser le Script de Test

**Exécuter le script automatique**:
```bash
cd /home/user/rork-vybzzz---concert---live-event-platform
./scripts/test-domains.sh
```

**Résultat attendu**:
```
✅ vybzzz.com is accessible (HTTP 200)
✅ HSTS enabled
✅ www.vybzzz.com is accessible (HTTP 301)
✅ API is accessible
✅ vybzzz.app is accessible (HTTP 200)
✅ HSTS enabled (required for .APP domains)
✅ apple-app-site-association is accessible
✅ assetlinks.json is accessible
```

---

## 🔧 Troubleshooting Hostinger

### Problème 1: DNS ne se propage pas

**Symptômes**: `dig vybzzz.com` ne retourne rien après 30 minutes

**Solutions**:
```bash
# 1. Vérifier dans Hostinger DNS Zone que les records sont bien sauvegardés
# 2. Attendre jusqu'à 1 heure (Hostinger peut être lent)
# 3. Forcer le refresh DNS local

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches

# 4. Tester avec différents DNS
dig @8.8.8.8 vybzzz.com  # Google DNS
dig @1.1.1.1 vybzzz.com  # Cloudflare DNS
```

### Problème 2: "Record already exists" dans Hostinger

**Symptômes**: Impossible d'ajouter un record A ou CNAME

**Cause**: Hostinger a créé des records par défaut

**Solution**:
```
1. Dans DNS Zone, chercher tous les records avec le même nom
2. Supprimer les doublons (cliquer sur poubelle)
3. Ajouter le nouveau record
```

### Problème 3: Vercel dit "Invalid Configuration"

**Symptômes**: Domaine ajouté mais pas validé dans Vercel

**Solutions**:
```
1. Attendre 30-60 minutes (propagation DNS)
2. Vérifier les DNS dans Hostinger:
   - A record: 76.76.21.21 (exactement cette IP)
   - CNAME www: cname.vercel-dns.com (sans point final)
3. Dans Vercel → Domains → Cliquer "Refresh"
4. Si toujours invalide après 2h, supprimer le domaine et rajouter
```

### Problème 4: SSL Error sur vybzzz.app

**Erreur**: `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`

**Cause**: .APP requiert HTTPS strict

**Solution**:
```
1. Vérifier dans Vercel que le domaine est "Valid"
2. Attendre 10-15 min que Let's Encrypt génère le certificat
3. NE PAS visiter le site avant que Vercel confirme SSL actif
4. Tester avec: curl -I https://vybzzz.app
```

### Problème 5: api.vybzzz.com timeout

**Symptômes**: `curl https://api.vybzzz.com/health` → timeout

**Solutions**:
```
1. Vérifier Railway backend est déployé:
   railway.app → Project → Deployments → Status: Success

2. Vérifier le CNAME dans Hostinger:
   dig api.vybzzz.com +short
   → Doit retourner l'URL Railway

3. Vérifier CORS dans backend:
   backend/src/index.ts → cors({ origin: 'https://vybzzz.com' })

4. Tester l'URL Railway directe:
   curl https://vybzzz-backend-production.up.railway.app/health
   → Si ça marche, c'est un problème DNS
```

---

## 📊 Récapitulatif Final

### Ce que tu dois avoir dans Hostinger

**Pour vybzzz.com**:
```
DNS Zone vybzzz.com:
┌──────────┬──────┬────────────────────────────────────────────┐
│ Type     │ Nom  │ Cible/Valeur                               │
├──────────┼──────┼────────────────────────────────────────────┤
│ A        │ @    │ 76.76.21.21                                │
│ CNAME    │ www  │ cname.vercel-dns.com                       │
│ CNAME    │ api  │ vybzzz-backend-production.up.railway.app   │
└──────────┴──────┴────────────────────────────────────────────┘
```

**Pour vybzzz.app**:
```
DNS Zone vybzzz.app:
┌──────────┬──────┬────────────────────────────────────────────┐
│ Type     │ Nom  │ Cible/Valeur                               │
├──────────┼──────┼────────────────────────────────────────────┤
│ A        │ @    │ 76.76.21.21                                │
│ CNAME    │ www  │ cname.vercel-dns.com                       │
└──────────┴──────┴────────────────────────────────────────────┘
```

### Ce que tu dois avoir dans Vercel

**Domains Section**:
```
✅ vybzzz.com          → Production (Primary)
✅ www.vybzzz.com      → Redirect to vybzzz.com
✅ vybzzz.app          → Production
✅ www.vybzzz.app      → Redirect to vybzzz.app

SSL: All domains have valid certificates ✅
```

### Ce que tu dois avoir dans Railway

**Domains Section**:
```
Default Domain:
vybzzz-backend-production.up.railway.app

Custom Domain:
✅ api.vybzzz.com → Configured
```

---

## ⏱️ Timeline Complète

| Étape | Durée | Action |
|-------|-------|--------|
| 1 | 10 min | Configuration DNS vybzzz.com (Hostinger) |
| 2 | 10 min | Configuration DNS vybzzz.app (Hostinger) |
| 3 | 15 min | Ajouter domaines dans Vercel |
| - | 30-60 min | **Attendre propagation DNS** ⏳ |
| 4 | 10 min | Déployer backend Railway |
| 5 | 10 min | Configurer api.vybzzz.com (Railway) |
| 6 | 5 min | Tests finaux |
| **TOTAL** | **~1h** + attente DNS | ✅ Configuration complète |

---

## 🎯 Plan d'Action Immédiat

### À Faire MAINTENANT (30 min)

**1. Configuration DNS vybzzz.com** (10 min):
```
□ Aller sur hpanel.hostinger.com
□ Domaines → vybzzz.com → DNS Zone
□ Ajouter A record: @ → 76.76.21.21
□ Ajouter CNAME: www → cname.vercel-dns.com
□ Sauvegarder
```

**2. Configuration DNS vybzzz.app** (10 min):
```
□ Domaines → vybzzz.app → DNS Zone
□ Ajouter A record: @ → 76.76.21.21
□ Ajouter CNAME: www → cname.vercel-dns.com
□ Sauvegarder
```

**3. Ajouter dans Vercel** (10 min):
```
□ vercel.com/dashboard → Project → Settings → Domains
□ Add: vybzzz.com
□ Add: www.vybzzz.com
□ Add: vybzzz.app
□ Add: www.vybzzz.app
□ Attendre validation ✅
```

### À Faire APRÈS Propagation DNS (1h plus tard)

**4. Configuration Railway** (15 min):
```
□ Déployer backend: git push origin main
□ Railway Dashboard → Custom Domain: api.vybzzz.com
□ Copier l'URL Railway
□ Hostinger → vybzzz.com → Ajouter CNAME api
□ Sauvegarder
```

**5. Tests** (5 min):
```
□ Exécuter: ./scripts/test-domains.sh
□ Vérifier tous les ✅
□ Tester dans navigateur:
  - https://vybzzz.com
  - https://vybzzz.app
  - https://api.vybzzz.com/health
```

---

## 📞 Support

**Hostinger Support**:
- Chat: hpanel.hostinger.com (bouton en bas à droite)
- Email: support@hostinger.com
- Docs: https://www.hostinger.com/tutorials/dns

**Besoin d'Aide?**
```
Si tu bloques à une étape, partage-moi:
1. Capture d'écran de la DNS Zone Hostinger
2. Message d'erreur de Vercel (si applicable)
3. Résultat de: dig vybzzz.com +short
```

---

**Document créé le**: 2025-11-16
**Spécifique à**: Hostinger DNS Management
**Prochaine étape**: Déploiement Vercel + Railway
