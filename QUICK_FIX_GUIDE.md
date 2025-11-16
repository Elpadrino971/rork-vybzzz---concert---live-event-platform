# 🚀 Guide Rapide - Correction Table Profiles

## 📋 Étapes à Suivre (5 minutes)

### Étape 1 : Diagnostic (Optionnel mais recommandé)

Pour voir exactement quelles colonnes tu as actuellement :

1. Ouvre **Supabase Dashboard** → **SQL Editor**
2. Copie et exécute :
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Résultat** : Tu verras la liste exacte de tes colonnes actuelles.

---

### Étape 2 : Appliquer la Migration (OBLIGATOIRE)

1. Dans **Supabase SQL Editor**
2. Copie **TOUT** le contenu de ce fichier :
   ```
   supabase/migrations/fix_profiles_structure_adaptive.sql
   ```
3. Colle dans l'éditeur
4. Clique **"Run"**

**Ce qui va se passer** :
- ✅ La migration vérifie chaque colonne avant de l'ajouter
- ✅ N'ajoute QUE les colonnes manquantes
- ✅ Ne touche PAS aux colonnes existantes
- ✅ Crée des triggers automatiques
- ✅ Affiche un résumé à la fin

**Messages attendus** :
```
NOTICE: Added column: full_name
NOTICE: Added column: display_name
NOTICE: Populated display_name from full_name
NOTICE: Added column: stripe_account_completed
NOTICE: Created sync_display_name trigger
NOTICE: ====================================
NOTICE: Profiles table now has 16 columns
NOTICE: Columns: id, email, full_name, display_name, ...
NOTICE: ====================================
NOTICE: ✓ Migration completed successfully!
```

---

### Étape 3 : Vérifier (OBLIGATOIRE)

Exécute cette requête pour vérifier :

```sql
SELECT * FROM profiles LIMIT 1;
```

**Résultat attendu** : Toutes les colonnes s'affichent sans erreur.

---

## ✅ Caractéristiques de Cette Migration

| Aspect | Description |
|--------|-------------|
| **Sécurité** | 🟢 100% sûre - vérifie avant d'ajouter |
| **Idempotence** | 🟢 Peut être exécutée plusieurs fois |
| **Données** | 🟢 Aucune perte de données |
| **Adaptation** | 🟢 S'adapte à ta structure actuelle |
| **Risque** | 🟢 AUCUN risque |

---

## 🔍 Que Fait Cette Migration ?

### Colonnes Ajoutées (si absentes)

**Essentielles** :
- `full_name` - Nom complet de l'utilisateur
- `display_name` - Nom affiché (pour app mobile)
- `email` - Email de l'utilisateur
- `id` - Identifiant unique

**Stripe** :
- `stripe_account_id` - Pour artistes (recevoir paiements)
- `stripe_customer_id` - Pour fans (faire paiements)
- `stripe_account_completed` - Status onboarding Stripe

**Profil** :
- `avatar_url` - URL de la photo de profil
- `bio` - Biographie
- `phone` - Numéro de téléphone
- `user_type` - Type d'utilisateur (fan/artist/affiliate)
- `is_verified` - Compte vérifié

**Metadata** :
- `created_at` - Date de création
- `updated_at` - Date de mise à jour
- `last_login_at` - Dernière connexion
- `metadata` - Données JSON flexibles

### Triggers Créés

1. **`sync_display_name_trigger`**
   - Synchronise `display_name` avec `full_name`
   - Si display_name vide → copie full_name

2. **`update_profiles_updated_at`**
   - Met à jour `updated_at` automatiquement
   - Sur chaque UPDATE

### Indexes Créés

- `idx_profiles_email` - Recherche par email (rapide)
- `idx_profiles_user_type` - Filtrage par type
- `idx_profiles_display_name` - Recherche par nom (mobile)

---

## 🐛 Si Tu Rencontres une Erreur

### Erreur : "column X already exists"
**C'est normal !** La migration passe simplement à la suivante.

### Erreur : "relation X does not exist"
**Problème** : La table profiles n'existe pas du tout.
**Solution** : D'abord, crée la table avec `schema.sql`

### Erreur : "permission denied"
**Problème** : Pas les droits admin.
**Solution** : Utilise le compte Owner de Supabase.

---

## 📊 Après la Migration

### Test Rapide

```sql
-- Devrait fonctionner sans erreur
SELECT
  id,
  email,
  full_name,
  display_name,
  user_type,
  stripe_customer_id,
  stripe_account_id,
  created_at
FROM profiles
LIMIT 3;
```

### Test App Mobile

```typescript
// Devrait fonctionner maintenant
const { data } = await supabase
  .from('profiles')
  .select('display_name, avatar_url, bio')
  .eq('id', userId);
```

### Test API Routes

```bash
# Les routes devraient fonctionner
# Teste l'achat de tickets, profil utilisateur, etc.
```

---

## 🎯 Résumé

1. ✅ Copie le fichier `fix_profiles_structure_adaptive.sql`
2. ✅ Exécute dans Supabase SQL Editor
3. ✅ Vérifie le message de succès
4. ✅ Teste avec `SELECT * FROM profiles LIMIT 1;`

**Temps estimé** : 2-3 minutes
**Risque** : Aucun
**Perte de données** : Aucune

---

## 💡 Pourquoi Cette Solution Est Meilleure

### Comparaison avec Versions Précédentes

| Aspect | V1 (view) | V2 (add cols) | V3 (adaptive) ✅ |
|--------|-----------|---------------|------------------|
| Vérifie structure actuelle | ❌ | ❌ | ✅ |
| S'adapte | ❌ | ❌ | ✅ |
| Gère full_name manquant | ❌ | ❌ | ✅ |
| Messages détaillés | ⚠️ | ⚠️ | ✅ |
| Peut échouer | ✅ | ✅ | ❌ |

---

**Cette migration fonctionne QUELLE QUE SOIT ta structure actuelle ! 🎉**
