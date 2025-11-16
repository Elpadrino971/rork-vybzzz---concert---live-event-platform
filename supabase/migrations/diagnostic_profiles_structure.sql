-- ================================================================
-- DIAGNOSTIC: Afficher la structure exacte de la table profiles
-- ================================================================
--
-- Exécuter cette requête dans Supabase SQL Editor pour voir
-- exactement quelles colonnes existent dans votre table profiles
--
-- Date: 2025-11-16
-- ================================================================

-- Afficher toutes les colonnes de la table profiles
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Compter le nombre total de colonnes
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public';

-- Afficher un exemple de données (sans infos sensibles)
SELECT *
FROM profiles
LIMIT 1;
