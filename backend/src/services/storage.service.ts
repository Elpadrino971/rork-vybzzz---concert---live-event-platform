import { getSupabaseClient } from './supabase.service';

/**
 * Types de buckets disponibles dans Supabase Storage
 */
export enum StorageBucket {
  EVENT_IMAGES = 'event-images',
  EVENT_VIDEOS = 'event-videos',
  USER_AVATARS = 'user-avatars',
  EVENT_THUMBNAILS = 'event-thumbnails',
  ARTIST_BANNERS = 'artist-banners',
  SHORTS_VIDEOS = 'shorts-videos',
}

/**
 * Limites de taille par bucket (en bytes)
 */
export const BUCKET_SIZE_LIMITS = {
  [StorageBucket.EVENT_IMAGES]: 5 * 1024 * 1024, // 5MB
  [StorageBucket.EVENT_VIDEOS]: 500 * 1024 * 1024, // 500MB
  [StorageBucket.USER_AVATARS]: 2 * 1024 * 1024, // 2MB
  [StorageBucket.EVENT_THUMBNAILS]: 1 * 1024 * 1024, // 1MB
  [StorageBucket.ARTIST_BANNERS]: 3 * 1024 * 1024, // 3MB
  [StorageBucket.SHORTS_VIDEOS]: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Types MIME autorisés par bucket
 */
export const BUCKET_ALLOWED_MIMETYPES = {
  [StorageBucket.EVENT_IMAGES]: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  [StorageBucket.EVENT_VIDEOS]: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
  [StorageBucket.USER_AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [StorageBucket.EVENT_THUMBNAILS]: ['image/jpeg', 'image/png', 'image/webp'],
  [StorageBucket.ARTIST_BANNERS]: ['image/jpeg', 'image/png', 'image/webp'],
  [StorageBucket.SHORTS_VIDEOS]: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

/**
 * Interface pour les résultats d'upload
 */
export interface UploadResult {
  path: string;
  url: string;
  publicUrl: string;
  fullPath: string;
}

/**
 * Service de stockage Supabase
 */
export const storageService = {
  /**
   * Valide un fichier avant upload
   */
  validateFile(bucket: StorageBucket, file: Express.Multer.File): void {
    // Vérifier la taille du fichier
    const sizeLimit = BUCKET_SIZE_LIMITS[bucket];
    if (file.size > sizeLimit) {
      const sizeMB = Math.round(sizeLimit / 1024 / 1024);
      throw new Error(`Le fichier dépasse la limite de ${sizeMB}MB pour ce bucket`);
    }

    // Vérifier le type MIME
    const allowedTypes = BUCKET_ALLOWED_MIMETYPES[bucket];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
    }

    // Vérifier que le fichier n'est pas vide
    if (file.size === 0) {
      throw new Error('Le fichier est vide');
    }

    // Vérifier l'extension du fichier
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new Error('Le fichier doit avoir une extension');
    }

    // Vérifier que l'extension correspond au type MIME
    const validExtensions: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
      'video/mp4': ['mp4'],
      'video/webm': ['webm'],
      'video/quicktime': ['mov'],
      'video/x-matroska': ['mkv'],
    };

    const expectedExtensions = validExtensions[file.mimetype];
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      throw new Error(`Extension de fichier invalide pour le type ${file.mimetype}`);
    }
  },

  /**
   * Upload un fichier dans un bucket spécifique
   */
  async uploadFile(
    bucket: StorageBucket,
    file: Express.Multer.File,
    folder?: string,
    options?: {
      upsert?: boolean;
      contentType?: string;
      validateFile?: boolean;
    }
  ): Promise<UploadResult> {
    const supabase = getSupabaseClient();

    // Valider le fichier si demandé (activé par défaut)
    if (options?.validateFile !== false) {
      this.validateFile(bucket, file);
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.originalname.split('.').pop() || '';
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Construire le chemin complet
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: options?.contentType || file.mimetype,
        upsert: options?.upsert || false,
        cacheControl: '3600', // Cache for 1 hour
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      publicUrl: urlData.publicUrl,
      fullPath: `${bucket}/${data.path}`,
    };
  },

  /**
   * Upload une image d'événement
   */
  async uploadEventImage(file: Express.Multer.File, eventId?: string): Promise<UploadResult> {
    const folder = eventId ? `events/${eventId}` : 'events';
    return this.uploadFile(StorageBucket.EVENT_IMAGES, file, folder, {
      contentType: file.mimetype || 'image/jpeg',
    });
  },

  /**
   * Upload une vidéo d'événement
   */
  async uploadEventVideo(file: Express.Multer.File, eventId?: string): Promise<UploadResult> {
    const folder = eventId ? `events/${eventId}` : 'events';
    return this.uploadFile(StorageBucket.EVENT_VIDEOS, file, folder, {
      contentType: file.mimetype || 'video/mp4',
    });
  },

  /**
   * Upload un avatar utilisateur
   */
  async uploadUserAvatar(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    const folder = `users/${userId}`;
    return this.uploadFile(StorageBucket.USER_AVATARS, file, folder, {
      contentType: file.mimetype || 'image/jpeg',
    });
  },

  /**
   * Upload une miniature d'événement
   */
  async uploadEventThumbnail(file: Express.Multer.File, eventId?: string): Promise<UploadResult> {
    const folder = eventId ? `events/${eventId}` : 'events';
    return this.uploadFile(StorageBucket.EVENT_THUMBNAILS, file, folder, {
      contentType: file.mimetype || 'image/jpeg',
    });
  },

  /**
   * Supprime un fichier
   */
  async deleteFile(bucket: StorageBucket, filePath: string): Promise<void> {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  },

  /**
   * Récupère l'URL publique d'un fichier
   */
  getPublicUrl(bucket: StorageBucket, filePath: string): string {
    const supabase = getSupabaseClient();
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  /**
   * Liste les fichiers d'un dossier
   */
  async listFiles(bucket: StorageBucket, folder?: string): Promise<any[]> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`Erreur lors de la liste: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Vérifie si un fichier existe
   */
  async fileExists(bucket: StorageBucket, filePath: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(filePath.split('/').slice(0, -1).join('/') || '');

    if (error) return false;

    const fileName = filePath.split('/').pop();
    return data?.some((file) => file.name === fileName) || false;
  },

  /**
   * Upload une bannière d'artiste
   */
  async uploadArtistBanner(file: Express.Multer.File, artistId: string): Promise<UploadResult> {
    const folder = `artists/${artistId}`;
    return this.uploadFile(StorageBucket.ARTIST_BANNERS, file, folder, {
      contentType: file.mimetype || 'image/jpeg',
    });
  },

  /**
   * Upload une vidéo short (TikTok-style)
   */
  async uploadShortVideo(file: Express.Multer.File, userId: string, eventId?: string): Promise<UploadResult> {
    const folder = eventId ? `events/${eventId}/shorts` : `users/${userId}/shorts`;
    return this.uploadFile(StorageBucket.SHORTS_VIDEOS, file, folder, {
      contentType: file.mimetype || 'video/mp4',
    });
  },

  /**
   * Supprime tous les fichiers d'un dossier
   */
  async deleteFolder(bucket: StorageBucket, folderPath: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Lister tous les fichiers du dossier
    const files = await this.listFiles(bucket, folderPath);

    if (files.length === 0) {
      return; // Rien à supprimer
    }

    // Construire les chemins complets
    const filePaths = files.map((file) => `${folderPath}/${file.name}`);

    // Supprimer tous les fichiers en une seule requête
    const { error } = await supabase.storage.from(bucket).remove(filePaths);

    if (error) {
      throw new Error(`Erreur lors de la suppression du dossier: ${error.message}`);
    }
  },

  /**
   * Récupère l'URL signée d'un fichier (pour les fichiers privés)
   */
  async getSignedUrl(bucket: StorageBucket, filePath: string, expiresIn: number = 3600): Promise<string> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data) {
      throw new Error(`Erreur lors de la génération de l'URL signée: ${error?.message}`);
    }

    return data.signedUrl;
  },

  /**
   * Copie un fichier d'un bucket à un autre
   */
  async copyFile(
    sourceBucket: StorageBucket,
    sourcePath: string,
    destBucket: StorageBucket,
    destPath: string
  ): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(sourceBucket)
      .copy(sourcePath, destPath);

    if (error) {
      throw new Error(`Erreur lors de la copie du fichier: ${error.message}`);
    }
  },

  /**
   * Déplace un fichier (copie + suppression)
   */
  async moveFile(
    sourceBucket: StorageBucket,
    sourcePath: string,
    destBucket: StorageBucket,
    destPath: string
  ): Promise<void> {
    const supabase = getSupabaseClient();

    const { error: moveError } = await supabase.storage
      .from(sourceBucket)
      .move(sourcePath, destPath);

    if (moveError) {
      throw new Error(`Erreur lors du déplacement du fichier: ${moveError.message}`);
    }
  },

  /**
   * Nettoie les fichiers temporaires (plus de 24h)
   */
  async cleanupTemporaryFiles(bucket: StorageBucket): Promise<number> {
    const supabase = getSupabaseClient();
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 heures

    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (error || !files) {
      throw new Error(`Erreur lors de la récupération des fichiers: ${error?.message}`);
    }

    // Filtrer les fichiers plus anciens que 24h
    const oldFiles = files.filter((file) => {
      const createdAt = new Date(file.created_at);
      return createdAt < cutoffDate;
    });

    if (oldFiles.length === 0) {
      return 0;
    }

    // Supprimer les fichiers
    const filePaths = oldFiles.map((file) => `temp/${file.name}`);
    const { error: deleteError } = await supabase.storage.from(bucket).remove(filePaths);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression des fichiers: ${deleteError.message}`);
    }

    return oldFiles.length;
  },
};

