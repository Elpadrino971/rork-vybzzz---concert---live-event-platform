import express from 'express';
import { supabaseService } from '../services/supabase.service';
import { notificationsService } from '../services/notifications.service';

const router = express.Router();

/**
 * GET /api/events
 * Récupère tous les événements
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, isLive } = req.query;
    const supabase = supabaseService.getClient();

    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1);

    if (isLive !== undefined) {
      query = query.eq('is_live', isLive === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/events/:id
 * Récupère un événement par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await supabaseService.getEventById(id);
    res.json(event);
  } catch (error: any) {
    console.error('Error getting event:', error);
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/events
 * Crée un nouvel événement
 */
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;
    const event = await supabaseService.createEvent(eventData);
    
    // Envoyer une notification push pour le nouvel événement
    if (event && event.id && event.title) {
      try {
        await notificationsService.notifyNewEvent(event.id, event.title);
        console.log('✅ Notification envoyée pour le nouvel événement');
      } catch (notifError) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', notifError);
        // Ne pas bloquer la création de l'événement si la notification échoue
      }
    }
    
    res.json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/events/:id
 * Met à jour un événement
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const event = await supabaseService.updateEvent(id, updates);
    res.json(event);
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/events/:id
 * Supprime un événement
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await supabaseService.deleteEvent(id);
    res.json(event);
  } catch (error: any) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

