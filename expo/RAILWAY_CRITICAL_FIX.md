# 🚨 Correction CRITIQUE : Railway construit Next.js au lieu du Backend

## ⚠️ Problème identifié

Railway essaie de construire le projet **Next.js à la racine** au lieu du **backend**. C'est pourquoi `check-env` s'exécute et échoue.

**Logs Railway montrent** :
```
npm run build
> vybzzz-platform@1.0.0 check-env
> tsx scripts/check-env.ts
❌ File not found or empty: .env.local
```

**Cause** : Railway n'utilise pas `railway.toml` ou le Root Directory n'est pas configuré à `backend`.

---

## ✅ Solution : Configurer Railway pour utiliser le Backend

### Option 1 : Configurer Root Directory dans Railway (RECOMMANDÉ)

**Dans Railway** :

1. **Allez dans votre service** : `rork-vybzzz---concert---live-event-platform`
2. **Cliquez sur "Settings"** (Paramètres)
3. **Dans la barre latérale droite**, cliquez sur **"Source"** ou **"Build"**
4. **Trouvez le champ "Root Directory"** (Répertoire racine)
5. **Entrez** : `backend`
   - ⚠️ **Important** : Juste `backend`, pas `/backend` ou `./backend`
6. **Sauvegardez** les changements

**Résultat** : Railway utilisera `backend/package.json` au lieu de `package.json` à la racine.

---

### Option 2 : Configurer les commandes manuellement

Si Railway ne détecte pas automatiquement `railway.toml` :

**Dans Railway > Settings > Build** :
- **Build Command** : `cd backend && npm install && npm run build`

**Dans Railway > Settings > Deploy** :
- **Start Command** : `cd backend && npm start`

---

### Option 3 : Vérifier que railway.toml est détecté

Railway devrait détecter automatiquement `railway.toml` à la racine du projet.

**Vérification** :
1. Dans Railway > Settings > Build
2. Vérifiez que la commande de build est : `cd backend && npm install && npm run build`
3. Si ce n'est pas le cas, configurez-la manuellement (Option 2)

---

## 🔧 Corrections appliquées

### 1. `prebuild` désactivé en Railway
- ✅ `prebuild` saute `check-env` si `RAILWAY_ENVIRONMENT` ou `RAILWAY` est défini
- ✅ Le build ne bloquera plus même si Railway construit Next.js

### 2. `check-env` non-bloquant en production
- ✅ `check-env` utilise `process.env` en production
- ✅ Ne bloque plus le build en production

---

## 📝 Configuration Railway requise

### 1. Root Directory (CRITIQUE)

**Settings > Source > Root Directory** :
```
backend
```

### 2. Build Command

**Settings > Build > Build Command** :
```
cd backend && npm install && npm run build
```

### 3. Start Command

**Settings > Deploy > Start Command** :
```
cd backend && npm start
```

---

## 🎯 Résultat attendu

Après avoir configuré Railway correctement :

**Logs Railway devraient montrer** :
```
cd backend && npm install
✓ npm install successful
cd backend && npm run build
✓ TypeScript compilation successful
cd backend && npm start
🚀 Server running on port 3000
```

**Au lieu de** :
```
npm run build (Next.js)
> check-env
❌ File not found: .env.local
```

---

## 🆘 Si Railway construit toujours Next.js

### Vérification 1 : Root Directory

1. Dans Railway > Settings > Source
2. Vérifiez que **Root Directory** est exactement `backend`
3. Pas de slash : `backend` ✅, pas `/backend` ❌

### Vérification 2 : Commandes

1. Dans Railway > Settings > Build
2. Vérifiez que **Build Command** est : `cd backend && npm install && npm run build`
3. Dans Railway > Settings > Deploy
4. Vérifiez que **Start Command** est : `cd backend && npm start`

### Vérification 3 : railway.toml

1. Vérifiez que `railway.toml` existe à la racine du projet
2. Vérifiez que le contenu est correct :
```toml
[build]
buildCommand = "cd backend && npm install && npm run build"

[deploy]
startCommand = "cd backend && npm start"
```

---

## ✅ Checklist finale

- [ ] **Root Directory configuré** : `backend` dans Railway Settings
- [ ] **Build Command configuré** : `cd backend && npm install && npm run build`
- [ ] **Start Command configuré** : `cd backend && npm start`
- [ ] **Variables d'environnement configurées** : Dans Railway > Variables
- [ ] **Service redéployé** : Vérifié dans Deployments
- [ ] **Logs vérifiés** : Pas d'erreurs Next.js, service démarre correctement

---

**Dernière mise à jour** : 2024-11-08

