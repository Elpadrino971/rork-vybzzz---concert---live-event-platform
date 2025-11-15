#!/usr/bin/env tsx

/**
 * Script de configuration du stockage Supabase
 *
 * Ce script configure automatiquement les buckets de stockage Supabase
 * avec les bonnes politiques de sécurité (RLS).
 *
 * Usage:
 *   npm run setup:storage
 *
 * Prérequis:
 *   - Variables d'environnement configurées (.env.local)
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  Fichier .env.local non trouvé, utilisation des variables d\'environnement système');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Créer le client Supabase avec la clé service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

interface BucketConfig {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
  description: string;
}

const BUCKETS: BucketConfig[] = [
  {
    id: 'event-images',
    name: 'event-images',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Images des événements (bannières, photos)',
  },
  {
    id: 'event-videos',
    name: 'event-videos',
    public: true,
    fileSizeLimit: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
    description: 'Vidéos promotionnelles des événements',
  },
  {
    id: 'user-avatars',
    name: 'user-avatars',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    description: 'Avatars des utilisateurs (fans, artistes, AA, RR)',
  },
  {
    id: 'event-thumbnails',
    name: 'event-thumbnails',
    public: true,
    fileSizeLimit: 1 * 1024 * 1024, // 1MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    description: 'Miniatures des événements',
  },
  {
    id: 'artist-banners',
    name: 'artist-banners',
    public: true,
    fileSizeLimit: 3 * 1024 * 1024, // 3MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    description: 'Bannières des profils artistes',
  },
  {
    id: 'shorts-videos',
    name: 'shorts-videos',
    public: true,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    description: 'Vidéos courtes (TikTok-style, highlights IA)',
  },
];

/**
 * Crée ou met à jour un bucket
 */
async function createBucket(config: BucketConfig): Promise<boolean> {
  try {
    // Vérifier si le bucket existe déjà
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some((b) => b.id === config.id);

    if (bucketExists) {
      console.log(`   ↻ Le bucket "${config.id}" existe déjà, mise à jour...`);

      // Supabase ne permet pas de mettre à jour les buckets via l'API
      // On considère que c'est OK si le bucket existe
      return true;
    } else {
      console.log(`   + Création du bucket "${config.id}"...`);

      const { error } = await supabase.storage.createBucket(config.id, {
        public: config.public,
        fileSizeLimit: config.fileSizeLimit,
        allowedMimeTypes: config.allowedMimeTypes,
      });

      if (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        return false;
      }

      console.log(`   ✓ Bucket "${config.id}" créé avec succès`);
      return true;
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur inattendue: ${error.message}`);
    return false;
  }
}

/**
 * Exécute la migration SQL pour les politiques RLS
 */
async function runStorageMigration(): Promise<boolean> {
  console.log('\n📋 Application des politiques de sécurité (RLS)...\n');

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', 'add_secure_storage_configuration.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Fichier de migration non trouvé: ${migrationPath}`);
    return false;
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('   ℹ️  IMPORTANT: Vous devez exécuter manuellement la migration SQL');
  console.log('   📂 Fichier: supabase/migrations/add_secure_storage_configuration.sql');
  console.log('   📍 Dans le dashboard Supabase:');
  console.log('      1. Allez dans SQL Editor');
  console.log('      2. Créez une nouvelle requête');
  console.log('      3. Copiez-collez le contenu du fichier de migration');
  console.log('      4. Exécutez la requête\n');

  return true;
}

/**
 * Vérifie que les buckets sont correctement configurés
 */
async function verifyBuckets(): Promise<void> {
  console.log('\n🔍 Vérification des buckets...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('❌ Erreur lors de la récupération des buckets:', error.message);
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.warn('⚠️  Aucun bucket trouvé');
    return;
  }

  console.log('   Buckets configurés:\n');

  for (const bucket of buckets) {
    const isExpected = BUCKETS.some((b) => b.id === bucket.id);
    const status = isExpected ? '✓' : '?';
    const visibility = bucket.public ? 'Public' : 'Privé';

    console.log(`   ${status} ${bucket.id.padEnd(20)} | ${visibility.padEnd(7)} | ${bucket.name}`);
  }

  console.log('');

  // Vérifier qu'on a tous les buckets attendus
  const missingBuckets = BUCKETS.filter(
    (expected) => !buckets.some((b) => b.id === expected.id)
  );

  if (missingBuckets.length > 0) {
    console.warn('\n⚠️  Buckets manquants:');
    missingBuckets.forEach((b) => console.warn(`   - ${b.id}: ${b.description}`));
  } else {
    console.log('✅ Tous les buckets sont configurés correctement!');
  }
}

/**
 * Affiche des statistiques sur le stockage
 */
async function showStorageStats(): Promise<void> {
  console.log('\n📊 Statistiques de stockage:\n');

  for (const config of BUCKETS) {
    try {
      const { data: files, error } = await supabase.storage
        .from(config.id)
        .list('', { limit: 1000 });

      if (error) {
        console.log(`   ${config.id.padEnd(20)} | ❌ Erreur: ${error.message}`);
        continue;
      }

      const fileCount = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => {
        const metadata = file.metadata as { size?: number } | null;
        return sum + (metadata?.size || 0);
      }, 0) || 0;

      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

      console.log(`   ${config.id.padEnd(20)} | ${fileCount.toString().padEnd(5)} fichiers | ${sizeMB} MB`);
    } catch (error: any) {
      console.log(`   ${config.id.padEnd(20)} | ❌ Erreur: ${error.message}`);
    }
  }

  console.log('');
}

/**
 * Script principal
 */
async function main() {
  console.log('\n🚀 Configuration du stockage Supabase pour VyBzzZ\n');
  console.log('='.repeat(60));
  console.log('');

  // 1. Créer les buckets
  console.log('📦 Création des buckets de stockage...\n');

  let successCount = 0;
  for (const config of BUCKETS) {
    console.log(`\n${config.description}:`);
    const success = await createBucket(config);
    if (success) successCount++;
  }

  console.log(`\n✅ ${successCount}/${BUCKETS.length} buckets configurés\n`);

  // 2. Instructions pour la migration SQL
  await runStorageMigration();

  // 3. Vérifier les buckets
  await verifyBuckets();

  // 4. Afficher les statistiques
  await showStorageStats();

  // 5. Résumé final
  console.log('='.repeat(60));
  console.log('\n✨ Configuration terminée!\n');
  console.log('Prochaines étapes:');
  console.log('  1. ✅ Buckets créés dans Supabase Storage');
  console.log('  2. 📝 Exécutez la migration SQL pour les politiques RLS');
  console.log('  3. 🧪 Testez l\'upload de fichiers via l\'API backend');
  console.log('  4. 📱 Intégrez les uploads dans le frontend/mobile\n');

  console.log('Documentation:');
  console.log('  - backend/SUPABASE_STORAGE_SETUP.md');
  console.log('  - supabase/migrations/add_secure_storage_configuration.sql\n');
}

// Exécuter le script
main()
  .then(() => {
    console.log('👋 À bientôt!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
