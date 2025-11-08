# 📦 Configuration Supabase Storage

Ce guide vous aidera à configurer Supabase Storage pour le stockage de fichiers (images, vidéos) dans l'application Vybzzz.

## 📋 Prérequis

1. Un projet Supabase configuré (voir `SUPABASE_SETUP.md`)
2. Les clés Supabase configurées dans `backend/.env`
3. Accès au dashboard Supabase

## 🗂️ Création des Buckets

Les buckets sont des conteneurs pour organiser vos fichiers. Nous allons créer 4 buckets pour l'application :

### 1. Créer les buckets dans Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur **New bucket** pour créer chaque bucket

#### Bucket 1 : `event-images`
- **Nom** : `event-images`
- **Public** : ✅ Oui (pour permettre l'accès public aux images)
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp, image/gif`

#### Bucket 2 : `event-videos`
- **Nom** : `event-videos`
- **Public** : ✅ Oui
- **File size limit** : 500 MB
- **Allowed MIME types** : `video/mp4, video/webm, video/quicktime`

#### Bucket 3 : `user-avatars`
- **Nom** : `user-avatars`
- **Public** : ✅ Oui
- **File size limit** : 2 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

#### Bucket 4 : `event-thumbnails`
- **Nom** : `event-thumbnails`
- **Public** : ✅ Oui
- **File size limit** : 1 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### 2. Configuration des politiques de sécurité (RLS)

Pour chaque bucket, configurez les politiques de sécurité :

#### Pour `event-images` (lecture publique, écriture authentifiée)

```sql
-- Politique : Lecture publique
CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Politique : Écriture authentifiée uniquement
CREATE POLICY "Authenticated write access for event-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Politique : Suppression authentifiée uniquement
CREATE POLICY "Authenticated delete access for event-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);
```

#### Pour `event-videos` (même configuration)

```sql
CREATE POLICY "Public read access for event-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-videos');

CREATE POLICY "Authenticated write access for event-videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-videos' 
  AND auth.role() = 'authenticated'
);
```

#### Pour `user-avatars` (lecture publique, écriture par propriétaire)

```sql
CREATE POLICY "Public read access for user-avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Pour `event-thumbnails` (même que event-images)

```sql
CREATE POLICY "Public read access for event-thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-thumbnails');

CREATE POLICY "Authenticated write access for event-thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-thumbnails' 
  AND auth.role() = 'authenticated'
);
```

> **Note** : Si vous utilisez le backend pour les uploads (recommandé), vous pouvez utiliser la clé `service_role` qui contourne RLS. Dans ce cas, les politiques ci-dessus peuvent être simplifiées.

## 🔧 Configuration Backend

### 1. Variables d'environnement

Assurez-vous que votre fichier `backend/.env` contient :

```env
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

> ⚠️ **Important** : Utilisez `SUPABASE_SERVICE_ROLE_KEY` (et non `SUPABASE_ANON_KEY`) pour les opérations de stockage côté serveur, car elle permet de contourner RLS.

### 2. Installation des dépendances

```bash
cd backend
npm install
```

Cela installera `multer` nécessaire pour gérer les uploads de fichiers.

## 📡 API Endpoints

Une fois configuré, vous pouvez utiliser ces endpoints :

### Upload d'image d'événement
```bash
POST /api/storage/upload/event-image
Content-Type: multipart/form-data

Body:
- file: [fichier image]
- eventId: (optionnel) ID de l'événement
```

### Upload de vidéo d'événement
```bash
POST /api/storage/upload/event-video
Content-Type: multipart/form-data

Body:
- file: [fichier vidéo]
- eventId: (optionnel) ID de l'événement
```

### Upload d'avatar utilisateur
```bash
POST /api/storage/upload/avatar
Content-Type: multipart/form-data

Body:
- file: [fichier image]
- userId: ID de l'utilisateur
```

### Upload de miniature
```bash
POST /api/storage/upload/thumbnail
Content-Type: multipart/form-data

Body:
- file: [fichier image]
- eventId: (optionnel) ID de l'événement
```

### Supprimer un fichier
```bash
DELETE /api/storage/delete/:bucket/:path
```

### Lister les fichiers
```bash
GET /api/storage/list/:bucket?folder=events/123
```

### Récupérer l'URL publique
```bash
GET /api/storage/url/:bucket/:path
```

## 🧪 Tests

### 1. Tester l'upload d'image

```bash
curl -X POST http://localhost:3000/api/storage/upload/event-image \
  -F "file=@/path/to/image.jpg" \
  -F "eventId=123e4567-e89b-12d3-a456-426614174000"
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "path": "events/123e4567-e89b-12d3-a456-426614174000/1234567890-abc123.jpg",
    "url": "https://dwlhpposqmknxholzcvp.supabase.co/storage/v1/object/public/event-images/events/...",
    "publicUrl": "https://dwlhpposqmknxholzcvp.supabase.co/storage/v1/object/public/event-images/events/...",
    "fullPath": "event-images/events/123e4567-e89b-12d3-a456-426614174000/1234567890-abc123.jpg"
  }
}
```

### 2. Tester l'upload de vidéo

```bash
curl -X POST http://localhost:3000/api/storage/upload/event-video \
  -F "file=@/path/to/video.mp4" \
  -F "eventId=123e4567-e89b-12d3-a456-426614174000"
```

### 3. Tester la suppression

```bash
curl -X DELETE http://localhost:3000/api/storage/delete/event-images/events/123/1234567890-abc123.jpg
```

## 📱 Utilisation côté client (React Native)

### Exemple d'upload d'image

```typescript
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/services/api-client';

async function uploadEventImage(eventId: string) {
  // Sélectionner une image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    
    // Créer un FormData
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('eventId', eventId);

    // Upload via l'API
    const response = await apiClient.uploadFile(
      '/api/storage/upload/event-image',
      {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      },
      { eventId }
    );

    console.log('Image uploadée:', response.data.url);
    return response.data.url;
  }
}
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Validation des fichiers** : Toujours valider le type MIME et la taille côté serveur
2. **Noms de fichiers** : Utiliser des noms uniques (timestamp + random) pour éviter les collisions
3. **Clés API** : Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
4. **Limites de taille** : Respecter les limites configurées dans les buckets
5. **Politiques RLS** : Configurer correctement les politiques de sécurité

### Limites recommandées

- **Images d'événements** : Max 5 MB
- **Vidéos d'événements** : Max 500 MB
- **Avatars** : Max 2 MB
- **Miniatures** : Max 1 MB

## 📊 Monitoring

### Vérifier l'utilisation du stockage

1. Allez dans **Storage** > **Buckets** dans Supabase
2. Cliquez sur un bucket pour voir l'utilisation
3. Surveillez les limites du plan gratuit :
   - **Gratuit** : 1 GB de stockage
   - **Pro** : 100 GB inclus, puis 0.021$/GB/mois

## 🐛 Dépannage

### Erreur : "Bucket not found"
- Vérifiez que le bucket existe dans Supabase
- Vérifiez que le nom du bucket correspond exactement (sensible à la casse)

### Erreur : "New row violates row-level security policy"
- Vérifiez que les politiques RLS sont correctement configurées
- Ou utilisez `SUPABASE_SERVICE_ROLE_KEY` pour contourner RLS

### Erreur : "File size exceeds limit"
- Vérifiez la taille du fichier
- Ajustez la limite dans le bucket ou réduisez la taille du fichier

### Erreur : "Invalid MIME type"
- Vérifiez que le type MIME est autorisé dans le bucket
- Vérifiez que le fichier est du bon type

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)
- [Row Level Security pour Storage](https://supabase.com/docs/guides/storage/security/access-control)

---

**Dernière mise à jour** : 2024

