# 🚀 Guide de Déploiement Backend - Vybzzz

Ce guide vous explique comment déployer le backend Vybzzz sur différents services d'hébergement.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Railway (Recommandé)](#railway-recommandé)
3. [Render](#render)
4. [Heroku](#heroku)
5. [VPS (DigitalOcean, AWS, etc.)](#vps-digitalocean-aws-etc)
6. [Variables d'environnement](#variables-denvironnement)
7. [Vérifications post-déploiement](#vérifications-post-déploiement)

---

## 🔧 Prérequis

Avant de déployer, assurez-vous d'avoir :

- ✅ Un compte sur le service d'hébergement choisi
- ✅ Les clés API de production (Stripe, OpenAI, Supabase)
- ✅ Un dépôt Git (GitHub, GitLab, etc.)
- ✅ Le backend testé localement

---

## 🚂 Railway (Recommandé)

### Pourquoi Railway ?

- ✅ Déploiement automatique depuis GitHub
- ✅ Configuration simple
- ✅ Pricing clair (~10$/mois pour le starter)
- ✅ Auto-scaling
- ✅ HTTPS inclus
- ✅ Migration facile entre forfaits (sans downtime)

### 📊 Choix du forfait Railway

#### Stratégie recommandée : Commencer Free, monter selon les besoins

**✅ OUI, vous pouvez commencer par le Free et monter au fil du temps !**

Railway permet de changer de forfait à tout moment sans downtime. Voici la stratégie recommandée :

| Phase | Forfait | Pourquoi |
|-------|---------|----------|
| **Développement/Test** | **Free** | Parfait pour tester le déploiement, vérifier que tout fonctionne |
| **Production initiale** | **Hobby ($5 min)** | Minimum pour production avec paiements réels |
| **Production avec trafic** | **Pro ($20 min)** | Recommandé pour production avec utilisateurs actifs |

#### 🔒 Sécurité : Le forfait n'affecte PAS la sécurité

**Important** : La sécurité de votre application ne dépend **PAS** du forfait Railway, mais de votre configuration :

- ✅ **HTTPS** : Inclus dans tous les forfaits (Free, Hobby, Pro)
- ✅ **Variables d'environnement** : Protégées de la même manière sur tous les forfaits
- ✅ **Isolation** : Votre code s'exécute dans un environnement isolé sur tous les forfaits
- ✅ **Certificats SSL** : Automatiques sur tous les forfaits

**Ce qui compte pour la sécurité** :
- ✅ Ne jamais exposer les clés secrètes (Stripe, OpenAI) côté client
- ✅ Utiliser HTTPS en production (automatique sur Railway)
- ✅ Configurer correctement CORS
- ✅ Valider toutes les entrées utilisateur
- ✅ Utiliser des variables d'environnement pour les secrets

#### ⚠️ Limitations du Free pour la production

Le forfait Free a des limitations qui peuvent affecter la **performance** (pas la sécurité) :

- ❌ **0.5 GB RAM / 1 vCPU** : Très limité pour gérer du trafic
- ❌ **Pas de support prioritaire** : En cas de problème avec les paiements, vous devrez attendre
- ❌ **Pas de granular access control** : Tous les membres de l'équipe ont le même accès

#### ✅ Recommandation finale

**Pour VybzzZ avec paiements Stripe en production** :

1. **Développement/Test** : Commencez par **Free** (gratuit, 30 jours d'essai avec $5 de crédits)
   - Testez le déploiement
   - Vérifiez que tous les endpoints fonctionnent
   - Testez les webhooks Stripe en mode test

2. **Production initiale** : Passez à **Hobby ($5 minimum)** dès que vous avez des utilisateurs réels
   - 8 GB RAM / 8 vCPU suffisent pour démarrer
   - Support communautaire (mais Railway est généralement réactif)
   - $5 de crédits mensuels inclus

3. **Production avec trafic** : Passez à **Pro ($20 minimum)** quand vous avez du trafic régulier
   - 32 GB RAM / 32 vCPU pour gérer les pics
   - Support prioritaire (critique pour les paiements)
   - Workspaces illimités (dev/staging/prod)
   - Granular access control

**Migration entre forfaits** :
- ✅ Changement instantané depuis le dashboard Railway
- ✅ Aucun downtime
- ✅ Les variables d'environnement sont conservées
- ✅ Pas besoin de redéployer

### Étapes de déploiement

#### 1. Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte (avec GitHub)
3. Connectez votre compte GitHub

#### 2. Créer un nouveau projet

1. Cliquez sur **New Project**
2. Sélectionnez **Deploy from GitHub repo**
3. Choisissez votre dépôt `vybzzz`
4. Railway détectera automatiquement le projet

#### 3. Configurer le service

1. Railway détectera automatiquement le dossier `backend/`
2. Si ce n'est pas le cas, configurez :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`

#### 4. Configurer les variables d'environnement

1. Allez dans **Variables** dans votre service
2. Ajoutez toutes les variables nécessaires :

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://vybzzz.com,https://app.vybzzz.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

#### 5. Déployer

1. Railway déploiera automatiquement à chaque push sur la branche principale
2. Vous pouvez aussi déclencher un déploiement manuel depuis le dashboard
3. Attendez que le build soit terminé
4. Vérifiez que le déploiement est réussi (statut "Deployment successful" avec checkmark vert)

#### 6. Exposer le service (OBLIGATOIRE)

⚠️ **Important** : Par défaut, votre service est "Unexposed" (non exposé). Vous devez l'exposer pour obtenir une URL publique.

**Option A : Générer un domaine Railway (Recommandé pour commencer)**

1. Dans votre service Railway, allez dans l'onglet **Settings**
2. Cliquez sur **Generate Domain** dans la section "Networking"
3. Railway générera automatiquement un domaine comme : `votre-service.up.railway.app`
4. Le certificat SSL sera automatiquement configuré
5. Notez cette URL, vous en aurez besoin pour configurer Stripe webhooks et le frontend

**Option B : Utiliser votre propre domaine personnalisé**

1. Dans **Settings** > **Domains**, cliquez sur **Custom Domain**
2. Entrez votre domaine (ex: `api.vybzzz.com`)
3. Railway vous donnera un enregistrement CNAME à ajouter dans votre DNS
4. Ajoutez l'enregistrement CNAME dans votre gestionnaire DNS
5. Railway détectera automatiquement le domaine et configurera le certificat SSL

**Vérification** :
- Après l'exposition, vous verrez l'URL publique dans l'onglet **Settings** > **Networking**
- Le statut "Unexposed service" disparaîtra

#### 7. Configurer les variables d'environnement (CRITIQUE)

⚠️ **Sans ces variables, votre API ne fonctionnera pas !**

1. Dans votre service Railway, allez dans l'onglet **Variables**
2. Ajoutez toutes les variables nécessaires une par une :

**Variables de base** :
```
PORT=3000
NODE_ENV=production
```

**Variables CORS** (remplacez par vos URLs de production) :
```
CORS_ORIGIN=https://vybzzz.com,https://app.vybzzz.com
```

**Variables Stripe** (clés de PRODUCTION) :
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Variables OpenAI** :
```
OPENAI_API_KEY=sk-proj-...
```

**Variables Supabase** :
```
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Variables optionnelles** :
```
EXPO_PROJECT_ID=... (pour les notifications push)
```

3. Après avoir ajouté les variables, Railway redéploiera automatiquement le service
4. Vérifiez les logs pour confirmer que le service démarre correctement

#### 8. Vérifier le déploiement

Une fois le service exposé et les variables configurées :

```bash
# Remplacez par votre URL Railway
curl https://votre-service.up.railway.app/health
```

Vous devriez recevoir :
```json
{
  "status": "ok",
  "message": "Vybzzz Backend API is running"
}
```

**Si vous obtenez une erreur** :
- Vérifiez que le service est bien exposé (pas "Unexposed")
- Vérifiez les logs dans l'onglet **Logs** du dashboard Railway
- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que le port 3000 est bien configuré

---

## 🎨 Render

### Pourquoi Render ?

- ✅ Plan gratuit disponible
- ✅ Déploiement automatique depuis GitHub
- ✅ Configuration simple
- ✅ HTTPS inclus

### Étapes de déploiement

#### 1. Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte (avec GitHub)
3. Connectez votre compte GitHub

#### 2. Créer un nouveau Web Service

1. Cliquez sur **New** > **Web Service**
2. Connectez votre dépôt GitHub
3. Sélectionnez votre dépôt `vybzzz`

#### 3. Configurer le service

Configurez les paramètres suivants :

- **Name** : `vybzzz-backend`
- **Environment** : `Node`
- **Root Directory** : `backend`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`
- **Plan** : Choisissez un plan (Free ou Starter)

#### 4. Configurer les variables d'environnement

1. Allez dans **Environment** dans votre service
2. Ajoutez toutes les variables nécessaires (voir section Variables d'environnement)

#### 5. Déployer

1. Cliquez sur **Create Web Service**
2. Render commencera le déploiement
3. Attendez que le build soit terminé

#### 6. Configurer le domaine

1. Allez dans **Settings** > **Custom Domain**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

#### 7. Vérifier le déploiement

```bash
curl https://votre-domaine.onrender.com/health
```

---

## 🟣 Heroku

### Pourquoi Heroku ?

- ✅ Simple à utiliser
- ✅ Add-ons disponibles
- ✅ Bonne documentation

### Étapes de déploiement

#### 1. Installer Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. Se connecter à Heroku

```bash
heroku login
```

#### 3. Créer une application

```bash
cd backend
heroku create vybzzz-backend
```

#### 4. Configurer les variables d'environnement

```bash
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set OPENAI_API_KEY=sk-proj-...
# ... ajoutez toutes les autres variables
```

Ou depuis le dashboard Heroku :
1. Allez dans **Settings** > **Config Vars**
2. Ajoutez toutes les variables

#### 5. Déployer

```bash
git push heroku main
```

#### 6. Vérifier le déploiement

```bash
heroku open
curl https://vybzzz-backend.herokuapp.com/health
```

---

## 🖥️ VPS (DigitalOcean, AWS, etc.)

### Pourquoi un VPS ?

- ✅ Contrôle total
- ✅ Plus flexible
- ✅ Peut être moins cher à long terme

### Étapes de déploiement

#### 1. Créer un serveur

1. Créez un droplet/serveur (Ubuntu 22.04 recommandé)
2. Notez l'IP du serveur
3. Connectez-vous via SSH

#### 2. Installer Node.js

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

#### 3. Installer PM2

```bash
sudo npm install -g pm2
```

#### 4. Cloner le dépôt

```bash
git clone https://github.com/votre-repo/vybzzz.git
cd vybzzz/backend
```

#### 5. Installer les dépendances

```bash
npm install
npm run build
```

#### 6. Configurer les variables d'environnement

```bash
# Créer le fichier .env
nano .env
# Ajoutez toutes les variables (voir section Variables d'environnement)
```

#### 7. Démarrer avec PM2

```bash
pm2 start dist/index.js --name vybzzz-api
pm2 save
pm2 startup
```

#### 8. Configurer Nginx (optionnel)

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/vybzzz
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name api.vybzzz.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/vybzzz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. Configurer SSL avec Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.vybzzz.com
```

---

## 🔐 Variables d'environnement

### Variables requises

```env
# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://vybzzz.com,https://app.vybzzz.com

# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_production

# OpenAI Configuration (PRODUCTION)
OPENAI_API_KEY=sk-proj-votre_clé_production

# Supabase Configuration
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon_production
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_production
```

### Variables optionnelles

```env
# JWT Configuration (si vous utilisez JWT)
JWT_SECRET=votre_jwt_secret_production
JWT_EXPIRATION=7d

# Database (si vous utilisez une autre base)
DATABASE_URL=postgresql://user:password@host:5432/vybzzz_prod
```

---

## ✅ Vérifications post-déploiement

### 1. Test de santé

```bash
curl https://api.vybzzz.com/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "message": "Vybzzz Backend API is running"
}
```

### 2. Test des endpoints

```bash
# Test des événements
curl https://api.vybzzz.com/api/events

# Test du chat IA
curl -X POST https://api.vybzzz.com/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### 3. Test du webhook Stripe

1. Allez dans le dashboard Stripe
2. Allez dans **Developers** > **Webhooks**
3. Cliquez sur votre webhook
4. Cliquez sur **Send test webhook**
5. Vérifiez les logs de votre serveur

### 4. Monitoring

- Surveillez les logs de votre serveur
- Vérifiez les erreurs dans le dashboard
- Configurez des alertes pour les erreurs critiques

---

## 🐛 Dépannage

### Erreur : "Cannot find module"

- Vérifiez que `npm install` a été exécuté
- Vérifiez que `npm run build` a été exécuté
- Vérifiez que le dossier `dist/` existe

### Erreur : "Port already in use"

- Vérifiez que le port 3000 n'est pas déjà utilisé
- Changez le port dans les variables d'environnement

### Erreur : "Environment variable not set"

- Vérifiez que toutes les variables d'environnement sont configurées
- Vérifiez que les noms des variables sont corrects

### Erreur : "Database connection failed"

- Vérifiez que Supabase est accessible
- Vérifiez que les clés Supabase sont correctes
- Vérifiez que les tables existent dans Supabase

---

## 📚 Ressources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

**Dernière mise à jour** : 2024

