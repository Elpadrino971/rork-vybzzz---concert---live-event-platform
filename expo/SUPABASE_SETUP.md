# Supabase Setup Guide for VyBzzZ

Ce guide vous accompagne �tape par �tape pour configurer votre projet Supabase pour la plateforme VyBzzZ.

## Pr�requis

- Compte Supabase (gratuit) : [supabase.com](https://supabase.com)
- Acc�s au SQL Editor dans Supabase

## �tape 1 : Cr�er un Projet Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `vybzzz-platform` (ou autre nom)
   - **Database Password** : G�n�rez un mot de passe fort (sauvegardez-le !)
   - **Region** : Choisissez `Europe (Frankfurt)` ou proche de votre localisation
4. Cliquez sur **"Create new project"**
5. Attendez 1-2 minutes que le projet se cr�e

## �tape 2 : Ex�cuter le Schema SQL

1. Une fois le projet cr��, allez dans **SQL Editor** (menu lat�ral gauche)
2. Cliquez sur **"New query"**
3. Ouvrez le fichier `supabase/schema-complete.sql` de ce projet
4. Copiez **TOUT le contenu** du fichier (1879 lignes)
5. Collez le contenu dans l'�diteur Supabase
6. Cliquez sur **"Run"** (ou Ctrl+Enter)
7. Attendez que l'ex�cution se termine (environ 10-15 secondes)

Vous devriez voir le message : **"Success. No rows returned"**

## �tape 3 : V�rifier les Tables

1. Allez dans **Table Editor** (menu lat�ral gauche)
2. Vous devriez voir toutes les tables cr��es :

### Tables Principales
- `users` - Comptes utilisateurs
- `profiles` - Profils utilisateurs
- `artists` - Profils artistes
- `events` - �v�nements/Concerts
- `tickets` - Billets achet�s
- `tips` - Pourboires aux artistes

### Tables d'Affiliation
- `apporteurs` - Apporteurs d'Affaires (AA)
- `responsables_regionaux` - Responsables R�gionaux (RR)
- `commissions` - Commissions AA/RR
- `payouts` - Paiements aux artistes (J+21)

### Tables de Gamification
- `badges` - Badges disponibles
- `user_badges` - Badges gagn�s
- `quests` - Qu�tes/D�fis
- `user_quests` - Progression des qu�tes
- `miles_transactions` - Transactions de miles

### Tables de Contenu
- `shorts` - Highlights vid�o (TikTok-style)
- `short_likes` - Likes sur les shorts
- `artist_followers` - Abonnements aux artistes
- `event_chat_messages` - Messages de chat en direct

## �tape 4 : R�cup�rer les Credentials

1. Allez dans **Settings** � **API** (menu lat�ral gauche)
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
� **ATTENTION** : Cette cl� doit rester SECR�TE !
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Copiez cette valeur pour `SUPABASE_SERVICE_ROLE_KEY`

## �tape 5 : Configurer les Variables d'Environnement

1. Dans votre projet VyBzzZ, cr�ez le fichier `.env.local` :

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

## �tape 6 : Activer l'Authentification

1. Allez dans **Authentication** � **Providers**
2. Activez les providers dont vous avez besoin :

### Email
-  Activ� par d�faut
- **Confirm email** : D�sactiv� pour le d�veloppement, activ� pour la production

### Google (Optionnel)
- **Client ID** : Obtenez-le depuis Google Cloud Console
- **Client Secret** : Depuis Google Cloud Console

### Apple (Optionnel)
- Pour l'authentification iOS

## �tape 7 : Configurer le Storage (Optionnel)

Pour stocker les images (avatars, banni�res, thumbnails) :

1. Allez dans **Storage** (menu lat�ral gauche)
2. Cr�ez les buckets suivants :

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

## �tape 8 : Configurer Realtime (Chat en Direct)

1. Allez dans **Database** � **Replication**
2. Activez la r�plication pour la table `event_chat_messages` :
   - Cliquez sur le toggle � c�t� de `event_chat_messages`
   - Cela permet le chat en temps r�el pendant les concerts

## �tape 9 : V�rifier Row Level Security (RLS)

Toutes les tables ont d�j� les policies RLS configur�es par le script SQL.

Pour v�rifier :
1. Allez dans **Authentication** � **Policies**
2. Vous devriez voir les policies pour chaque table
3. Exemples de policies :
   - `Users can view own profile`
   - `Artists can manage their events`
   - `Public can view published events`

## �tape 10 : Tester la Connexion

1. Lancez votre serveur de d�veloppement :

```bash
npm run dev
```

2. L'application devrait se connecter � Supabase sans erreur

3. Test rapide dans le navigateur :

```javascript
// Ouvrez la console du navigateur et testez :
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'VOTRE_URL',
  'VOTRE_ANON_KEY'
)

// Tester une requ�te simple
const { data } = await supabase.from('events').select('*').limit(5)
console.log(data)
```

## �tape 11 : Cr�er un Utilisateur Test (Optionnel)

Pour tester l'application, cr�ez un compte :

1. Allez dans **Authentication** � **Users**
2. Cliquez sur **"Add user"** � **"Create new user"**
3. Remplissez :
   - **Email** : `test@vybzzz.com`
   - **Password** : `Test123!` (ou autre)
   - **Auto Confirm User** :  Yes (pour �viter la v�rification email)
4. Cliquez sur **"Create user"**

## D�pannage

### Erreur : "relation does not exist"
- **Cause** : Le schema SQL n'a pas �t� ex�cut� correctement
- **Solution** : R�ex�cutez le fichier `schema-complete.sql` complet

### Erreur : "JWT expired"
- **Cause** : Les tokens Supabase ont expir�
- **Solution** : Rechargez les credentials depuis Settings � API

### Erreur : "permission denied for table"
- **Cause** : Probl�me avec Row Level Security
- **Solution** : V�rifiez que vous �tes authentifi� avec le bon user_type

### Erreur de connexion
- **Cause** : URL ou cl�s incorrectes
- **Solution** : V�rifiez vos variables d'environnement dans `.env.local`

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

Pour la production � grande �chelle, envisagez :
- **Pro Plan** (25$/mois) : 8 GB Database, 100 GB Storage
- **Team Plan** (599$/mois) : Pour >100K users

## Prochaines �tapes

Une fois Supabase configur� :

1.  Configurez Stripe (voir README.md)
2.  D�ployez sur Vercel
3.  Testez l'application mobile
4.  Pr�parez l'�v�nement David Guetta

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

**Temps estim� pour la configuration compl�te : 15-20 minutes**

 Une fois termin�, votre backend Supabase est pr�t pour VyBzzZ !
