import { Router, Request, Response } from 'express';
import multer from 'multer';
import { storageService, StorageBucket } from '../services/storage.service';

const router = Router();

// Configuration de multer pour stocker les fichiers en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max par défaut
  },
  fileFilter: (req, file, cb) => {
    // Accepter tous les types de fichiers pour l'instant
    // Vous pouvez ajouter une validation plus stricte ici
    cb(null, true);
  },
});

/**
 * POST /api/storage/upload/image
 * Upload une image (générique)
 */
router.post('/upload/image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const bucket = (req.body.bucket as StorageBucket) || StorageBucket.EVENT_IMAGES;
    const folder = req.body.folder as string | undefined;

    const result = await storageService.uploadFile(bucket, req.file, folder);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur upload image:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de l\'image',
    });
  }
});

/**
 * POST /api/storage/upload/event-image
 * Upload une image d'événement
 */
router.post('/upload/event-image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Vérifier que c'est bien une image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Le fichier doit être une image' });
    }

    const eventId = req.body.eventId as string | undefined;
    const result = await storageService.uploadEventImage(req.file, eventId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur upload image événement:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de l\'image d\'événement',
    });
  }
});

/**
 * POST /api/storage/upload/event-video
 * Upload une vidéo d'événement
 */
router.post('/upload/event-video', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Vérifier que c'est bien une vidéo
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'Le fichier doit être une vidéo' });
    }

    // Limite de taille pour les vidéos : 500MB
    if (req.file.size > 500 * 1024 * 1024) {
      return res.status(400).json({ error: 'La vidéo ne doit pas dépasser 500MB' });
    }

    const eventId = req.body.eventId as string | undefined;
    const result = await storageService.uploadEventVideo(req.file, eventId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur upload vidéo événement:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de la vidéo d\'événement',
    });
  }
});

/**
 * POST /api/storage/upload/avatar
 * Upload un avatar utilisateur
 */
router.post('/upload/avatar', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Vérifier que c'est bien une image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Le fichier doit être une image' });
    }

    const userId = req.body.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId est requis' });
    }

    const result = await storageService.uploadUserAvatar(req.file, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de l\'avatar',
    });
  }
});

/**
 * POST /api/storage/upload/thumbnail
 * Upload une miniature d'événement
 */
router.post('/upload/thumbnail', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Le fichier doit être une image' });
    }

    const eventId = req.body.eventId as string | undefined;
    const result = await storageService.uploadEventThumbnail(req.file, eventId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Erreur upload miniature:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'upload de la miniature',
    });
  }
});

/**
 * DELETE /api/storage/delete/:bucket/:path
 * Supprime un fichier
 */
router.delete('/delete/:bucket/:path(*)', async (req: Request, res: Response) => {
  try {
    const bucket = req.params.bucket as StorageBucket;
    const filePath = req.params.path;

    // Vérifier que le bucket est valide
    if (!Object.values(StorageBucket).includes(bucket)) {
      return res.status(400).json({ error: 'Bucket invalide' });
    }

    await storageService.deleteFile(bucket, filePath);

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur suppression fichier:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la suppression du fichier',
    });
  }
});

/**
 * GET /api/storage/list/:bucket
 * Liste les fichiers d'un bucket
 */
router.get('/list/:bucket', async (req: Request, res: Response) => {
  try {
    const bucket = req.params.bucket as StorageBucket;
    const folder = req.query.folder as string | undefined;

    // Vérifier que le bucket est valide
    if (!Object.values(StorageBucket).includes(bucket)) {
      return res.status(400).json({ error: 'Bucket invalide' });
    }

    const files = await storageService.listFiles(bucket, folder);

    res.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('Erreur liste fichiers:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la récupération de la liste',
    });
  }
});

/**
 * GET /api/storage/url/:bucket/:path
 * Récupère l'URL publique d'un fichier
 */
router.get('/url/:bucket/:path(*)', async (req: Request, res: Response) => {
  try {
    const bucket = req.params.bucket as StorageBucket;
    const filePath = req.params.path;

    // Vérifier que le bucket est valide
    if (!Object.values(StorageBucket).includes(bucket)) {
      return res.status(400).json({ error: 'Bucket invalide' });
    }

    const url = storageService.getPublicUrl(bucket, filePath);

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    console.error('Erreur récupération URL:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la récupération de l\'URL',
    });
  }
});

export default router;

