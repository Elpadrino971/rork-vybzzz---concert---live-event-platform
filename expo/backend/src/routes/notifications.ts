import express, { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';

const router = express.Router();

/**
 * POST /api/notifications/send
 * Envoie une notification push à un utilisateur
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { pushToken, title, body, data } = req.body;

    if (!pushToken || !title || !body) {
      return res.status(400).json({ 
        error: 'pushToken, title, and body are required' 
      });
    }

    const tickets = await notificationsService.sendNotification(
      pushToken,
      title,
      body,
      data
    );

    res.json({ 
      success: true, 
      tickets,
      message: 'Notification sent successfully' 
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      error: error.message || 'Error sending notification' 
    });
  }
});

/**
 * POST /api/notifications/send-to-users
 * Envoie une notification à plusieurs utilisateurs
 */
router.post('/send-to-users', async (req: Request, res: Response) => {
  try {
    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        error: 'userIds must be a non-empty array' 
      });
    }

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'title and body are required' 
      });
    }

    const tickets = await notificationsService.sendNotificationToUsers(
      userIds,
      title,
      body,
      data
    );

    res.json({ 
      success: true, 
      tickets,
      message: `Notifications sent to ${userIds.length} users` 
    });
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ 
      error: error.message || 'Error sending notifications' 
    });
  }
});

/**
 * POST /api/notifications/new-event
 * Envoie une notification pour un nouvel événement
 */
router.post('/new-event', async (req: Request, res: Response) => {
  try {
    const { eventId, eventTitle } = req.body;

    if (!eventId || !eventTitle) {
      return res.status(400).json({ 
        error: 'eventId and eventTitle are required' 
      });
    }

    const tickets = await notificationsService.notifyNewEvent(
      eventId,
      eventTitle
    );

    res.json({ 
      success: true, 
      tickets,
      message: 'Event notifications sent successfully' 
    });
  } catch (error: any) {
    console.error('Error sending event notifications:', error);
    res.status(500).json({ 
      error: error.message || 'Error sending event notifications' 
    });
  }
});

/**
 * POST /api/notifications/payment-success
 * Envoie une notification pour un paiement réussi
 */
router.post('/payment-success', async (req: Request, res: Response) => {
  try {
    const { userId, amount, eventTitle } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'userId and amount are required' 
      });
    }

    const tickets = await notificationsService.notifyPaymentSuccess(
      userId,
      amount,
      eventTitle
    );

    res.json({ 
      success: true, 
      tickets,
      message: 'Payment success notification sent' 
    });
  } catch (error: any) {
    console.error('Error sending payment notification:', error);
    res.status(500).json({ 
      error: error.message || 'Error sending payment notification' 
    });
  }
});

/**
 * POST /api/notifications/event-live
 * Envoie une notification pour un événement en direct
 */
router.post('/event-live', async (req: Request, res: Response) => {
  try {
    const { eventId, eventTitle } = req.body;

    if (!eventId || !eventTitle) {
      return res.status(400).json({ 
        error: 'eventId and eventTitle are required' 
      });
    }

    const tickets = await notificationsService.notifyEventLive(
      eventId,
      eventTitle
    );

    res.json({ 
      success: true, 
      tickets,
      message: 'Event live notifications sent successfully' 
    });
  } catch (error: any) {
    console.error('Error sending live event notifications:', error);
    res.status(500).json({ 
      error: error.message || 'Error sending live event notifications' 
    });
  }
});

export default router;

