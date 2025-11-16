-- ================================================================
-- VERIFICATION: Vérifier que la migration profiles a bien fonctionné
-- ================================================================
--
-- Exécuter ces requêtes dans Supabase SQL Editor pour vérifier
-- que tout est en ordre après la migration
--
-- Date: 2025-11-16
-- ================================================================

-- Ensure uuid-ossp extension for tests
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- Test 1: Vérifier le nombre de colonnes
-- ================================================================

DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 1: Nombre de colonnes';
  RAISE NOTICE 'Résultat: % colonnes trouvées', col_count;

  IF col_count >= 15 THEN
    RAISE NOTICE 'Statut: ✓ PASS (attendu: 15+)';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL (attendu: 15+, trouvé: %)', col_count;
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 2: Vérifier que toutes les colonnes essentielles existent
-- ================================================================

DO $$
DECLARE
  missing_cols TEXT[];
  essential_cols TEXT[] := ARRAY[
    'id',
    'email',
    'full_name',
    'display_name',
    'avatar_url',
    'user_type',
    'stripe_account_id',
    'stripe_customer_id',
    'stripe_account_completed',
    'bio',
    'phone',
    'created_at',
    'updated_at',
    'last_login_at',
    'metadata'
  ];
  col TEXT;
  all_exist BOOLEAN := true;
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 2: Colonnes essentielles';

  FOREACH col IN ARRAY essential_cols
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = col
    ) THEN
      all_exist := false;
      RAISE WARNING '  ✗ Colonne manquante: %', col;
    ELSE
      RAISE NOTICE '  ✓ Colonne présente: %', col;
    END IF;
  END LOOP;

  IF all_exist THEN
    RAISE NOTICE 'Statut: ✓ PASS - Toutes les colonnes essentielles existent';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL - Certaines colonnes manquent';
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 3: Vérifier les triggers
-- ================================================================

DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_table = 'profiles'
    AND trigger_schema = 'public';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 3: Triggers';
  RAISE NOTICE 'Résultat: % trigger(s) trouvé(s)', trigger_count;

  -- Check specific triggers
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_table = 'profiles'
      AND trigger_name = 'sync_display_name_trigger'
  ) THEN
    RAISE NOTICE '  ✓ sync_display_name_trigger existe';
  ELSE
    RAISE WARNING '  ✗ sync_display_name_trigger manquant';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_table = 'profiles'
      AND trigger_name = 'update_profiles_updated_at'
  ) THEN
    RAISE NOTICE '  ✓ update_profiles_updated_at existe';
  ELSE
    RAISE WARNING '  ✗ update_profiles_updated_at manquant';
  END IF;

  IF trigger_count >= 2 THEN
    RAISE NOTICE 'Statut: ✓ PASS (attendu: 2+)';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL (attendu: 2+, trouvé: %)', trigger_count;
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 4: Vérifier les indexes
-- ================================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'profiles';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 4: Indexes';
  RAISE NOTICE 'Résultat: % index(es) trouvé(s)', index_count;

  -- Check specific indexes
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles'
      AND indexname = 'idx_profiles_email'
  ) THEN
    RAISE NOTICE '  ✓ idx_profiles_email existe';
  ELSE
    RAISE WARNING '  ✗ idx_profiles_email manquant';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles'
      AND indexname = 'idx_profiles_user_type'
  ) THEN
    RAISE NOTICE '  ✓ idx_profiles_user_type existe';
  ELSE
    RAISE WARNING '  ✗ idx_profiles_user_type manquant';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles'
      AND indexname = 'idx_profiles_display_name'
  ) THEN
    RAISE NOTICE '  ✓ idx_profiles_display_name existe';
  ELSE
    RAISE WARNING '  ✗ idx_profiles_display_name manquant';
  END IF;

  IF index_count >= 3 THEN
    RAISE NOTICE 'Statut: ✓ PASS (attendu: 3+)';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL (attendu: 3+, trouvé: %)', index_count;
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 5: Tester le trigger sync_display_name
-- ================================================================

DO $$
DECLARE
  test_id UUID;
  test_full_name TEXT := 'Test User ' || floor(random() * 1000)::text;
  result_display_name TEXT;
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 5: Trigger sync_display_name';

  -- Insert test record (with explicit UUID to avoid id constraint issues)
  test_id := uuid_generate_v4();

  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (
    test_id,
    'test_' || floor(random() * 1000000)::text || '@test.com',
    test_full_name,
    'fan'
  )
  RETURNING display_name INTO result_display_name;

  RAISE NOTICE 'Test: Insertion avec full_name = "%"', test_full_name;
  RAISE NOTICE 'Résultat: display_name = "%"', result_display_name;

  IF result_display_name = test_full_name THEN
    RAISE NOTICE 'Statut: ✓ PASS - display_name synchronisé automatiquement';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL - display_name non synchronisé (attendu: %, trouvé: %)', test_full_name, result_display_name;
  END IF;

  -- Cleanup
  DELETE FROM profiles WHERE id = test_id;
  RAISE NOTICE 'Nettoyage: Utilisateur test supprimé';
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 6: Tester le trigger updated_at
-- ================================================================

DO $$
DECLARE
  test_id UUID;
  created_time TIMESTAMP WITH TIME ZONE;
  updated_time TIMESTAMP WITH TIME ZONE;
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 6: Trigger updated_at';

  -- Insert test record (with explicit UUID to avoid id constraint issues)
  test_id := uuid_generate_v4();

  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (
    test_id,
    'test_update_' || floor(random() * 1000000)::text || '@test.com',
    'Test Update User',
    'fan'
  )
  RETURNING created_at INTO created_time;

  RAISE NOTICE 'Test: Création à %', created_time;

  -- Wait a tiny bit
  PERFORM pg_sleep(0.1);

  -- Update
  UPDATE profiles
  SET bio = 'Test bio update'
  WHERE id = test_id
  RETURNING updated_at INTO updated_time;

  RAISE NOTICE 'Résultat: updated_at = %', updated_time;

  IF updated_time > created_time THEN
    RAISE NOTICE 'Statut: ✓ PASS - updated_at mis à jour automatiquement';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL - updated_at non mis à jour';
  END IF;

  -- Cleanup
  DELETE FROM profiles WHERE id = test_id;
  RAISE NOTICE 'Nettoyage: Utilisateur test supprimé';
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- Test 7: Vérifier les types de colonnes
-- ================================================================

DO $$
DECLARE
  wrong_types TEXT[];
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test 7: Types de colonnes';

  -- Check important column types
  SELECT ARRAY_AGG(column_name || ': attendu ' || expected_type || ', trouvé ' || data_type)
  INTO wrong_types
  FROM (
    SELECT
      c.column_name,
      CASE c.column_name
        WHEN 'id' THEN 'uuid'
        WHEN 'email' THEN 'text'
        WHEN 'full_name' THEN 'text'
        WHEN 'display_name' THEN 'text'
        WHEN 'stripe_account_completed' THEN 'boolean'
        WHEN 'metadata' THEN 'jsonb'
        WHEN 'created_at' THEN 'timestamp with time zone'
        ELSE 'unknown'
      END as expected_type,
      c.data_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'profiles'
      AND c.column_name IN ('id', 'email', 'full_name', 'display_name', 'stripe_account_completed', 'metadata', 'created_at')
  ) types
  WHERE data_type != expected_type AND expected_type != 'unknown';

  IF wrong_types IS NULL OR array_length(wrong_types, 1) IS NULL THEN
    RAISE NOTICE 'Statut: ✓ PASS - Tous les types sont corrects';
  ELSE
    RAISE WARNING 'Statut: ✗ FAIL - Types incorrects:';
    RAISE WARNING '  %', array_to_string(wrong_types, E'\n  ');
  END IF;
  RAISE NOTICE '====================================';
END $$;

-- ================================================================
-- RÉSUMÉ FINAL
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '████████████████████████████████████████████████';
  RAISE NOTICE '█                                              █';
  RAISE NOTICE '█       VÉRIFICATION MIGRATION PROFILES        █';
  RAISE NOTICE '█                 TERMINÉE                     █';
  RAISE NOTICE '█                                              █';
  RAISE NOTICE '████████████████████████████████████████████████';
  RAISE NOTICE '';
  RAISE NOTICE 'Consultez les messages ci-dessus pour voir les résultats.';
  RAISE NOTICE '';
  RAISE NOTICE 'Si tous les tests affichent "✓ PASS", la migration';
  RAISE NOTICE 'a réussi et la table profiles est prête !';
  RAISE NOTICE '';
  RAISE NOTICE 'Étape suivante: Tester l''application web et mobile';
  RAISE NOTICE '';
END $$;

-- ================================================================
-- BONUS: Afficher la structure complète
-- ================================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
