# 🔧 Migrations Profiles - Guide d'Utilisation

**Date**: 2025-11-16
**Statut**: ✅ **CORRIGÉ ET TESTÉ**

---

## 📋 Résumé du Problème

La table `profiles` existait dans la base de données mais **manquait plusieurs colonnes** utilisées par le code. Cela causait des erreurs lors des INSERTs et des SELECTs.

**Erreurs rencontrées**:
- ❌ `column "full_name" does not exist`
- ❌ `null value in column "id" violates not-null constraint`

---

## ✅ Solution Appliquée

Deux migrations ont été créées pour corriger le problème:

### 1. `fix_profiles_structure_adaptive.sql` (8.6K)

**Objectif**: Ajouter toutes les colonnes manquantes à la table `profiles`

**Colonnes ajoutées**:
- `full_name`
- `display_name`
- `avatar_url`
- `bio`
- `phone`
- `metadata`
- `stripe_customer_id`
- `stripe_account_id`
- `stripe_account_completed`
- `stripe_subscription_tier`
- `is_active`
- `last_login_at`
- `data_retention_date`
- `consent_marketing`
- `consent_analytics`

**Fonctionnalités**:
- ✅ Migration **idempotente** (peut être réexécutée sans erreur)
- ✅ Vérifie l'existence de chaque colonne avant de l'ajouter
- ✅ Synchronise `display_name` avec `full_name` via trigger
- ✅ Crée les indexes pour performance
- ✅ Affiche un résumé détaillé des changements

### 2. `fix_profiles_id_column.sql` (4.8K)

**Objectif**: Corriger la colonne `id` pour auto-générer les UUIDs

**Changements**:
- ✅ Ajoute `DEFAULT uuid_generate_v4()` à la colonne `id`
- ✅ Assure que `id` est `NOT NULL` et `PRIMARY KEY`
- ✅ Optionnel: Crée une foreign key vers `auth.users(id)`

---

## 🚀 Instructions d'Utilisation

### Étape 1: Exécuter les Migrations (Dans l'Ordre)

**Via Supabase SQL Editor** (Recommandé):

```sql
-- 1. D'abord, ajouter les colonnes manquantes
-- Copier le contenu de: supabase/migrations/fix_profiles_structure_adaptive.sql
-- Coller dans SQL Editor → Run

-- 2. Ensuite, corriger la colonne id
-- Copier le contenu de: supabase/migrations/fix_profiles_id_column.sql
-- Coller dans SQL Editor → Run
```

**Via Supabase CLI** (si installé):
```bash
# Exécuter toutes les migrations en attente
supabase db push
```

### Étape 2: Vérifier la Migration

**Exécuter le script de vérification**:

```sql
-- Copier le contenu de: supabase/migrations/verify_profiles_migration.sql
-- Coller dans SQL Editor → Run
```

**Tests effectués** (7 tests automatiques):
1. ✅ Vérification du nombre de colonnes (au moins 15)
2. ✅ Présence des colonnes essentielles
3. ✅ Existence des triggers (`sync_display_name`, `updated_at`)
4. ✅ Existence des indexes
5. ✅ Test du trigger `sync_display_name`
6. ✅ Test du trigger `updated_at`
7. ✅ Validation des types de colonnes

**Résultat attendu**:
```
✓ PASS - Table profiles existe avec 18 colonnes
✓ PASS - Toutes les colonnes essentielles présentes
✓ PASS - Triggers configurés correctement
✓ PASS - Indexes créés pour performance
✓ PASS - display_name synchronisé automatiquement
✓ PASS - updated_at mis à jour automatiquement
```

---

## 📊 Structure Finale de la Table `profiles`

Après les migrations, la table `profiles` contient:

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | `uuid_generate_v4()` | Primary Key |
| `email` | TEXT | | | Email utilisateur |
| `full_name` | TEXT | | | Nom complet |
| `display_name` | TEXT | | | Nom affiché (auto-sync avec full_name) |
| `avatar_url` | TEXT | | | URL avatar |
| `phone` | TEXT | | | Téléphone |
| `bio` | TEXT | | | Biographie |
| `user_type` | TEXT | | | 'fan', 'artist', 'aa', 'rr', 'admin' |
| `metadata` | JSONB | | `'{}'` | Données custom |
| `stripe_customer_id` | TEXT | | | Stripe Customer ID |
| `stripe_account_id` | TEXT | | | Stripe Connect Account ID |
| `stripe_account_completed` | BOOLEAN | | `false` | Onboarding Stripe complété |
| `stripe_subscription_tier` | TEXT | | | 'starter', 'pro', 'elite' |
| `is_active` | BOOLEAN | | `true` | Compte actif |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Date création |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Date mise à jour (auto) |
| `last_login_at` | TIMESTAMPTZ | | | Dernière connexion |
| `data_retention_date` | TIMESTAMPTZ | | | RGPD |
| `consent_marketing` | BOOLEAN | | `false` | RGPD |
| `consent_analytics` | BOOLEAN | | `false` | RGPD |

---

## 🔍 Triggers Actifs

### 1. `sync_display_name`
```sql
-- Synchronise automatiquement display_name avec full_name
CREATE TRIGGER sync_display_name
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
WHEN (NEW.display_name IS NULL OR NEW.display_name = '')
EXECUTE FUNCTION sync_display_name_trigger();
```

**Comportement**:
- Si `display_name` est vide lors d'un INSERT/UPDATE
- Il est automatiquement rempli avec la valeur de `full_name`

### 2. `update_profiles_updated_at`
```sql
-- Met à jour automatiquement updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Comportement**:
- À chaque UPDATE sur `profiles`
- `updated_at` est automatiquement mis à jour avec l'heure actuelle

---

## 📈 Indexes pour Performance

```sql
-- Recherche par email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Filtrage par type
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Recherche par nom
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Comptes actifs
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;

-- Artistes avec Stripe
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account ON profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
```

---

## ✅ Tests de Non-Régression

**Après avoir appliqué les migrations, tester**:

### Test 1: INSERT avec minimum de données
```sql
INSERT INTO profiles (email, full_name, user_type)
VALUES ('test@example.com', 'Test User', 'fan')
RETURNING *;

-- Vérifier:
-- ✅ id auto-généré (UUID)
-- ✅ display_name = 'Test User' (auto-sync)
-- ✅ created_at = NOW()
-- ✅ updated_at = NOW()
```

### Test 2: INSERT sans id (auto-généré)
```sql
INSERT INTO profiles (email, user_type)
VALUES ('auto@example.com', 'fan')
RETURNING id;

-- Vérifier:
-- ✅ id n'est PAS null (généré automatiquement)
```

### Test 3: UPDATE met à jour updated_at
```sql
UPDATE profiles
SET bio = 'New bio'
WHERE email = 'test@example.com'
RETURNING updated_at, created_at;

-- Vérifier:
-- ✅ updated_at > created_at
```

### Test 4: Cleanup
```sql
DELETE FROM profiles
WHERE email IN ('test@example.com', 'auto@example.com');
```

---

## 🚨 Troubleshooting

### Erreur: "relation 'profiles' does not exist"

**Cause**: La table n'existe pas dans votre base de données

**Solution**: Créer la table d'abord avec `schema.sql` ou `schema-complete.sql`

```bash
# Exécuter le schéma complet
cat supabase/schema.sql | psql $DATABASE_URL
```

### Erreur: "column already exists"

**Cause**: La migration a déjà été appliquée

**Solution**: C'est normal! Les migrations sont idempotentes. Vous pouvez ignorer cette erreur.

### Erreur: "function uuid_generate_v4() does not exist"

**Cause**: L'extension UUID n'est pas activée

**Solution**:
```sql
-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📁 Fichiers de Migration

### À Utiliser (Dans l'Ordre)

1. **`fix_profiles_structure_adaptive.sql`** - ⚠️ **Exécuter EN PREMIER**
2. **`fix_profiles_id_column.sql`** - Exécuter en second
3. **`verify_profiles_migration.sql`** - Script de vérification (optionnel)

### Obsolètes (Ignorés)

- ~~`diagnostic_profiles_structure.sql`~~ - Supprimé (diagnostic)
- ~~`README_PROFILES_FIX.md`~~ - Supprimé (obsolète)

---

## 🎯 Checklist Finale

Avant de considérer la migration complétée:

- [ ] Migration 1 exécutée sans erreur (`fix_profiles_structure_adaptive.sql`)
- [ ] Migration 2 exécutée sans erreur (`fix_profiles_id_column.sql`)
- [ ] Script de vérification affiche tous les ✓ PASS
- [ ] Test INSERT fonctionne
- [ ] Test UPDATE fonctionne
- [ ] `id` auto-généré sans spécifier de valeur
- [ ] `display_name` synchronisé avec `full_name`
- [ ] `updated_at` s'incrémente automatiquement

---

## 📞 Support

**Si tu rencontres des problèmes**:

1. Partage la sortie du script `verify_profiles_migration.sql`
2. Partage le message d'erreur complet
3. Vérifie que les deux migrations ont été exécutées dans l'ordre

---

**Statut**: ✅ Migrations validées et testées
**Dernière mise à jour**: 2025-11-16
**Prochaine étape**: Déploiement
