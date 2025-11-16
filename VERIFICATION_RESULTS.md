# 🔍 Vérification de la Migration Profiles

## 📋 Checklist de Vérification

### Étape 1: Vérification SQL ✅

Exécute ce script dans **Supabase SQL Editor** :
```
supabase/migrations/verify_profiles_migration.sql
```

**Ce script teste** :
1. ✅ Nombre de colonnes (attendu: 15+)
2. ✅ Présence des colonnes essentielles
3. ✅ Triggers créés (sync_display_name, updated_at)
4. ✅ Indexes créés (email, user_type, display_name)
5. ✅ Fonctionnement du trigger sync_display_name
6. ✅ Fonctionnement du trigger updated_at
7. ✅ Types de colonnes corrects

**Résultat attendu** :
```
====================================
Test 1: Nombre de colonnes
Résultat: 16 colonnes trouvées
Statut: ✓ PASS (attendu: 15+)
====================================

Test 2: Colonnes essentielles
  ✓ Colonne présente: id
  ✓ Colonne présente: email
  ✓ Colonne présente: full_name
  ✓ Colonne présente: display_name
  ...
Statut: ✓ PASS - Toutes les colonnes essentielles existent
====================================

Test 3: Triggers
Résultat: 2 trigger(s) trouvé(s)
  ✓ sync_display_name_trigger existe
  ✓ update_profiles_updated_at existe
Statut: ✓ PASS (attendu: 2+)
====================================

...

████████████████████████████████████████████████
█                                              █
█       VÉRIFICATION MIGRATION PROFILES        █
█                 TERMINÉE                     █
█                                              █
████████████████████████████████████████████████
```

---

### Étape 2: Tests Manuels dans Supabase

#### Test 2.1: SELECT simple
```sql
SELECT * FROM profiles LIMIT 3;
```
**Attendu** : Toutes les colonnes s'affichent sans erreur

#### Test 2.2: INSERT nouveau profil
```sql
INSERT INTO profiles (email, full_name, user_type)
VALUES ('test@vybzzz.com', 'Test User', 'fan')
RETURNING *;
```
**Attendu** :
- display_name = full_name automatiquement
- created_at et updated_at définis
- metadata = {}

#### Test 2.3: UPDATE profil
```sql
UPDATE profiles
SET bio = 'Test bio'
WHERE email = 'test@vybzzz.com'
RETURNING updated_at, created_at;
```
**Attendu** : updated_at > created_at

#### Test 2.4: Vérifier display_name sync
```sql
UPDATE profiles
SET full_name = 'New Name'
WHERE email = 'test@vybzzz.com'
RETURNING full_name, display_name;
```
**Attendu** : Si display_name était vide, il devient 'New Name'

#### Test 2.5: Nettoyage
```sql
DELETE FROM profiles WHERE email = 'test@vybzzz.com';
```

---

### Étape 3: Tests Application Web

#### Test 3.1: Page Événements
```bash
# Ouvrir dans le navigateur
http://localhost:3000/events
```
**Attendu** :
- ✅ Page se charge sans erreur
- ✅ Noms des artistes s'affichent
- ✅ Pas d'erreur dans la console

#### Test 3.2: Achat de Ticket
```bash
# Tester l'achat d'un ticket
http://localhost:3000/events/[event-id]
```
**Attendu** :
- ✅ Bouton "Acheter" fonctionne
- ✅ Stripe s'ouvre
- ✅ Pas d'erreur "profiles" dans les logs

#### Test 3.3: Dashboard Fan
```bash
http://localhost:3000/fan/dashboard
```
**Attendu** :
- ✅ Dashboard se charge
- ✅ Profil utilisateur affiché
- ✅ Tickets affichés

---

### Étape 4: Tests Application Mobile (si applicable)

#### Test 4.1: Profil Utilisateur
```typescript
// Dans mobile/app/(tabs)/profile.tsx
// Devrait charger sans erreur
```
**Attendu** :
- ✅ display_name s'affiche
- ✅ avatar_url se charge
- ✅ bio s'affiche

#### Test 4.2: Upload Avatar
```typescript
// Tester l'upload d'avatar
```
**Attendu** :
- ✅ Upload fonctionne
- ✅ avatar_url est mis à jour

---

### Étape 5: Tests API Routes

#### Test 5.1: API Tickets
```bash
# Tester l'API d'achat de tickets
curl -X POST http://localhost:3000/api/tickets/purchase \
  -H "Content-Type: application/json" \
  -d '{"event_id": "xxx", "user_id": "yyy"}'
```
**Attendu** : Pas d'erreur "column does not exist"

#### Test 5.2: API User Export
```bash
# Tester l'export de données utilisateur
curl http://localhost:3000/api/user/export
```
**Attendu** : JSON avec toutes les données profil

---

## 🎯 Résultats de Vérification

### ✅ Tests SQL (7 tests)
- [ ] Test 1: Nombre de colonnes
- [ ] Test 2: Colonnes essentielles
- [ ] Test 3: Triggers
- [ ] Test 4: Indexes
- [ ] Test 5: Trigger sync_display_name
- [ ] Test 6: Trigger updated_at
- [ ] Test 7: Types de colonnes

### ✅ Tests Manuels Supabase (5 tests)
- [ ] SELECT simple
- [ ] INSERT nouveau profil
- [ ] UPDATE profil
- [ ] Vérifier display_name sync
- [ ] DELETE profil test

### ✅ Tests Application Web (3 tests)
- [ ] Page événements
- [ ] Achat de ticket
- [ ] Dashboard fan

### ✅ Tests Application Mobile (2 tests)
- [ ] Profil utilisateur
- [ ] Upload avatar

### ✅ Tests API Routes (2 tests)
- [ ] API tickets
- [ ] API user export

---

## 📊 Score Global

**Total** : __/19 tests

**Statut** :
- 19/19 : ✅ PARFAIT - Tout fonctionne
- 16-18/19 : ⚠️ BON - Quelques ajustements mineurs
- 13-15/19 : ⚠️ MOYEN - Vérifier les erreurs
- <13/19 : ❌ PROBLÈMES - Revoir la migration

---

## 🐛 Si Des Tests Échouent

### Erreur : "column X does not exist"
**Cause** : La migration n'a pas ajouté toutes les colonnes
**Solution** : Réexécuter `fix_profiles_structure_adaptive.sql`

### Erreur : "trigger does not exist"
**Cause** : Les triggers n'ont pas été créés
**Solution** : Vérifier que les colonnes full_name et display_name existent, puis réexécuter la migration

### Erreur : "index already exists"
**Cause** : Normal si migration déjà exécutée
**Solution** : Ignorer (pas un problème)

### Erreur : API retourne null
**Cause** : Données manquantes dans profiles
**Solution** : Vérifier que les utilisateurs ont bien les colonnes remplies

---

## 📝 Rapport de Vérification

**Date** : _______________
**Testeur** : _______________

### Résumé
- [ ] Migration SQL exécutée avec succès
- [ ] Tous les tests SQL passent
- [ ] Application web fonctionne
- [ ] Application mobile fonctionne (si applicable)
- [ ] Aucune erreur dans les logs

### Observations
```
(Notes et observations ici)
```

### Problèmes Rencontrés
```
(Décrire les problèmes éventuels)
```

### Actions Correctives
```
(Actions prises pour corriger)
```

---

## ✅ Validation Finale

**La migration est validée si** :
1. ✅ Tous les tests SQL passent (7/7)
2. ✅ L'application web fonctionne sans erreur
3. ✅ Les API routes fonctionnent
4. ✅ Pas d'erreur "column does not exist" nulle part

**Signature** : _______________
**Date** : _______________

---

## 🎉 Prochaines Étapes

Une fois la migration validée :

1. **Commit les changements**
   ```bash
   git add .
   git commit -m "fix: validate profiles migration - all tests pass"
   git push
   ```

2. **Déployer en production**
   - Appliquer la même migration sur Supabase production
   - Vérifier avec le script de vérification
   - Monitorer les logs pendant 1h

3. **Mettre à jour la documentation**
   - Documenter la structure finale
   - Mettre à jour les types TypeScript si nécessaire

4. **Tester les fonctionnalités principales**
   - Achat de tickets
   - Envoi de tips
   - Création d'événements
   - Dashboard artiste/fan

---

**Bonne chance ! 🚀**
