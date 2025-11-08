import { getSupabaseClient } from './supabase.service';

/**
 * Types de buckets disponibles dans Supabase Storage
 */
export enum StorageBucket {
  EVENT_IMAGES = 'event-images',
  EVENT_VIDEOS = 'event-videos',
  USER_AVATARS = 'user-avatars',
  EVENT_THUMBNAILS = 'event-thumbnails',
}

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
   * Upload un fichier dans un bucket spécifique
   */
  async uploadFile(
    bucket: StorageBucket,
    file: Express.Multer.File,
    folder?: string,
    options?: {
      upsert?: boolean;
      contentType?: string;
    }
  ): Promise<UploadResult> {
    const supabase = getSupabaseClient();
    
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
};

