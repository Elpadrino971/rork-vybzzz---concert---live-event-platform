# Supabase Setup Guide for VyBzzZ

Ce guide vous accompagne étape par étape pour configurer votre projet Supabase pour la plateforme VyBzzZ.

## Prérequis

- Compte Supabase (gratuit) : [supabase.com](https://supabase.com)
- Accès au SQL Editor dans Supabase

## Étape 1 : Créer un Projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `vybzzz-platform` (ou autre nom)
   - **Database Password** : Générez un mot de passe fort (sauvegardez-le !)
   - **Region** : Choisissez `Europe (Frankfurt)` ou proche de votre localisation
4. Cliquez sur **"Create new project"**
5. Attendez 1-2 minutes que le projet se crée

## Étape 2 : Exécuter le Schema SQL

1. Une fois le projet créé, allez dans **SQL Editor** (menu latéral gauche)
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `supabase/schema-complete.sql` de ce projet
4. Copiez **TOUT le contenu** du fichier (1879 lignes)
5. Collez le contenu dans l'éditeur Supabase
6. Cliquez sur **"Run"** (ou Ctrl+Enter)
7. Attendez que l'exécution se termine (environ 10-15 secondes)

Vous devriez voir le message : **"Success. No rows returned"**

## Étape 3 : Vérifier les Tables

1. Allez dans **Table Editor** (menu latéral gauche)
2. Vous devriez voir toutes les tables créées :

### Tables Principales
- `users` - Comptes utilisateurs
- `profiles` - Profils utilisateurs
- `artists` - Profils artistes
- `events` - Événements/Concerts
- `tickets` - Billets achetés
- `tips` - Pourboires aux artistes

### Tables d'Affiliation
- `apporteurs` - Apporteurs d'Affaires (AA)
- `responsables_regionaux` - Responsables Régionaux (RR)
- `commissions` - Commissions AA/RR
- `payouts` - Paiements aux artistes (J+21)

### Tables de Gamification
- `badges` - Badges disponibles
- `user_badges` - Badges gagnés
- `quests` - Quêtes/Défis
- `user_quests` - Progression des quêtes
- `miles_transactions` - Transactions de miles

### Tables de Contenu
- `shorts` - Highlights vidéo (TikTok-style)
- `short_likes` - Likes sur les shorts
- `artist_followers` - Abonnements aux artistes
- `event_chat_messages` - Messages de chat en direct

## Étape 4 : Récupérer les Credentials

1. Allez dans **Settings** ’ **API** (menu latéral gauche)
2. Copiez ces 3 valeurs :

### Project URL
```
https://xxxxxxxxxxxxxxxxxx.supabase.co
```
Copiez cette valeur pour `NEXT_PUBLIC_SUPABASE_URL`

### Project API Keys

#### anon public
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Copiez cette valeur pour `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### service_role secret
  **ATTENTION** : Cette clé doit rester SECRÈTE !
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Copiez cette valeur pour `SUPABASE_SERVICE_ROLE_KEY`

## Étape 5 : Configurer les Variables d'Environnement

1. Dans votre projet VyBzzZ, créez le fichier `.env.local` :

```bash
cp .env.example .env.local
```

2. Ouvrez `.env.local` et remplacez les valeurs :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

## Étape 6 : Activer l'Authentification

1. Allez dans **Authentication** ’ **Providers**
2. Activez les providers dont vous avez besoin :

### Email
-  Activé par défaut
- **Confirm email** : Désactivé pour le développement, activé pour la production

### Google (Optionnel)
- **Client ID** : Obtenez-le depuis Google Cloud Console
- **Client Secret** : Depuis Google Cloud Console

### Apple (Optionnel)
- Pour l'authentification iOS

## Étape 7 : Configurer le Storage (Optionnel)

Pour stocker les images (avatars, bannières, thumbnails) :

1. Allez dans **Storage** (menu latéral gauche)
2. Créez les buckets suivants :

### Bucket `avatars`
- **Public** :  Yes
- **File size limit** : 2 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### Bucket `event-thumbnails`
- **Public** :  Yes
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### Bucket `shorts`
- **Public** :  Yes
- **File size limit** : 50 MB
- **Allowed MIME types** : `video/mp4, video/webm`

## Étape 8 : Configurer Realtime (Chat en Direct)

1. Allez dans **Database** ’ **Replication**
2. Activez la réplication pour la table `event_chat_messages` :
   - Cliquez sur le toggle à côté de `event_chat_messages`
   - Cela permet le chat en temps réel pendant les concerts

## Étape 9 : Vérifier Row Level Security (RLS)

Toutes les tables ont déjà les policies RLS configurées par le script SQL.

Pour vérifier :
1. Allez dans **Authentication** ’ **Policies**
2. Vous devriez voir les policies pour chaque table
3. Exemples de policies :
   - `Users can view own profile`
   - `Artists can manage their events`
   - `Public can view published events`

## Étape 10 : Tester la Connexion

1. Lancez votre serveur de développement :

```bash
npm run dev
```

2. L'application devrait se connecter à Supabase sans erreur

3. Test rapide dans le navigateur :

```javascript
// Ouvrez la console du navigateur et testez :
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'VOTRE_URL',
  'VOTRE_ANON_KEY'
)

// Tester une requête simple
const { data } = await supabase.from('events').select('*').limit(5)
console.log(data)
```

## Étape 11 : Créer un Utilisateur Test (Optionnel)

Pour tester l'application, créez un compte :

1. Allez dans **Authentication** ’ **Users**
2. Cliquez sur **"Add user"** ’ **"Create new user"**
3. Remplissez :
   - **Email** : `test@vybzzz.com`
   - **Password** : `Test123!` (ou autre)
   - **Auto Confirm User** :  Yes (pour éviter la vérification email)
4. Cliquez sur **"Create user"**

## Dépannage

### Erreur : "relation does not exist"
- **Cause** : Le schema SQL n'a pas été exécuté correctement
- **Solution** : Réexécutez le fichier `schema-complete.sql` complet

### Erreur : "JWT expired"
- **Cause** : Les tokens Supabase ont expiré
- **Solution** : Rechargez les credentials depuis Settings ’ API

### Erreur : "permission denied for table"
- **Cause** : Problème avec Row Level Security
- **Solution** : Vérifiez que vous êtes authentifié avec le bon user_type

### Erreur de connexion
- **Cause** : URL ou clés incorrectes
- **Solution** : Vérifiez vos variables d'environnement dans `.env.local`

## Limites du Plan Gratuit

Supabase Free Tier offre :
-  500 MB Database
-  1 GB File storage
-  50,000 Monthly Active Users
-  2 GB Bandwidth

**Pour VyBzzZ** : Le plan gratuit est suffisant pour :
- MVP development
- Tests
- **Concert David Guetta** (avec quelques milliers d'utilisateurs)

Pour la production à grande échelle, envisagez :
- **Pro Plan** (25$/mois) : 8 GB Database, 100 GB Storage
- **Team Plan** (599$/mois) : Pour >100K users

## Prochaines Étapes

Une fois Supabase configuré :

1.  Configurez Stripe (voir README.md)
2.  Déployez sur Vercel
3.  Testez l'application mobile
4.  Préparez l'événement David Guetta

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## Support

Pour toute question sur la configuration Supabase :
- Documentation VyBzzZ : Voir README.md
- Supabase Discord : [discord.supabase.com](https://discord.supabase.com)
- Supabase Support : support@supabase.io

---

**Temps estimé pour la configuration complète : 15-20 minutes**

 Une fois terminé, votre backend Supabase est prêt pour VyBzzZ !
