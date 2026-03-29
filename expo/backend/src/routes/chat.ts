import express from 'express';
import { openaiService } from '../services/openai.service';
import { supabaseService } from '../services/supabase.service';

const router = express.Router();

/**
 * POST /api/chat/message
 * Envoie un message au chat IA
 */
router.post('/message', async (req, res) => {
  try {
    const { messages, model, max_tokens, temperature } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const result = await openaiService.sendMessage({
      messages,
      model,
      max_tokens,
      temperature,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Récupère l'historique d'une conversation
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = supabaseService.getClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/conversations
 * Crée une nouvelle conversation
 */
router.post('/conversations', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const supabase = supabaseService.getClient();

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation',
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

