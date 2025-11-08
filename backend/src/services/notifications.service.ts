import { Expo } from 'expo-server-sdk';
import { supabaseService } from './supabase.service';

const expo = new Expo();

export const notificationsService = {
  /**
   * Envoie une notification push
   */
  async sendNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return null;
    }

    const message = {
      to: pushToken,
      sound: 'default' as const,
      title,
      body,
      data: data || {},
      badge: 1,
    };

    try {
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  },

  /**
   * Envoie une notification à plusieurs utilisateurs
   */
  async sendNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ) {
    try {
      const supabase = supabaseService.getClient();
      
      // Récupérer les tokens push des utilisateurs depuis Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('push_token')
        .in('id', userIds)
        .not('push_token', 'is', null);

      if (error) {
        console.error('Error fetching user push tokens:', error);
        return null;
      }

      const pushTokens = users
        ?.map((user: any) => user.push_token)
        .filter((token: string) => token && Expo.isExpoPushToken(token)) || [];

      if (pushTokens.length === 0) {
        console.log('No valid push tokens found for users');
        return null;
      }

      const messages = pushTokens.map((token: string) => ({
        to: token,
        sound: 'default' as const,
        title,
        body,
        data: data || {},
        badge: 1,
      }));

      try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error('Error sending push notifications:', error);
          }
        }

        return tickets;
      } catch (error) {
        console.error('Error sending push notifications:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in sendNotificationToUsers:', error);
      throw error;
    }
  },

  /**
   * Envoie une notification pour un nouvel événement
   */
  async notifyNewEvent(eventId: string, eventTitle: string) {
    try {
      const supabase = supabaseService.getClient();
      
      // Récupérer tous les utilisateurs qui ont activé les notifications
      const { data: users, error } = await supabase
        .from('users')
        .select('push_token')
        .not('push_token', 'is', null);

      if (error) {
        console.error('Error fetching users:', error);
        return null;
      }

      const pushTokens = users
        ?.map((user: any) => user.push_token)
        .filter((token: string) => token && Expo.isExpoPushToken(token)) || [];

      if (pushTokens.length === 0) {
        console.log('No valid push tokens found for users');
        return null;
      }

      const messages = pushTokens.map((token: string) => ({
        to: token,
        sound: 'default' as const,
        title: 'Nouvel événement disponible ! 🎵',
        body: eventTitle,
        data: { eventId, type: 'new_event' },
        badge: 1,
      }));

      try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error('Error sending push notifications:', error);
          }
        }

        console.log(`✅ Notifications envoyées pour l'événement ${eventId}`);
        return tickets;
      } catch (error) {
        console.error('Error sending push notifications:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in notifyNewEvent:', error);
      throw error;
    }
  },

  /**
   * Envoie une notification pour un paiement réussi
   */
  async notifyPaymentSuccess(userId: string, amount: number, eventTitle?: string) {
    try {
      const supabase = supabaseService.getClient();
      
      // Récupérer le token push de l'utilisateur
      const { data: user, error } = await supabase
        .from('users')
        .select('push_token')
        .eq('id', userId)
        .single();

      if (error || !user?.push_token) {
        console.error('Error fetching user push token:', error);
        return null;
      }

      if (!Expo.isExpoPushToken(user.push_token)) {
        console.error('Invalid push token for user:', userId);
        return null;
      }

      const message = {
        to: user.push_token,
        sound: 'default' as const,
        title: 'Paiement réussi ! ✅',
        body: eventTitle
          ? `Votre paiement de ${amount}€ pour ${eventTitle} a été traité avec succès.`
          : `Votre paiement de ${amount}€ a été traité avec succès.`,
        data: { type: 'payment_success', amount, eventTitle },
        badge: 1,
      };

      try {
        const chunks = expo.chunkPushNotifications([message]);
        const tickets = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error('Error sending push notification:', error);
          }
        }

        return tickets;
      } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in notifyPaymentSuccess:', error);
      throw error;
    }
  },

  /**
   * Envoie une notification pour un événement en direct
   */
  async notifyEventLive(eventId: string, eventTitle: string) {
    try {
      const supabase = supabaseService.getClient();
      
      // Récupérer les utilisateurs qui suivent cet événement
      // (Vous pouvez créer une table 'event_followers' pour cela)
      const { data: users, error } = await supabase
        .from('users')
        .select('push_token')
        .not('push_token', 'is', null);

      if (error) {
        console.error('Error fetching users:', error);
        return null;
      }

      const pushTokens = users
        ?.map((user: any) => user.push_token)
        .filter((token: string) => token && Expo.isExpoPushToken(token)) || [];

      if (pushTokens.length === 0) {
        return null;
      }

      const messages = pushTokens.map((token: string) => ({
        to: token,
        sound: 'default' as const,
        title: 'Événement en direct ! 🔴',
        body: `${eventTitle} est maintenant en direct !`,
        data: { eventId, type: 'event_live' },
        badge: 1,
      }));

      try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error('Error sending push notifications:', error);
          }
        }

        return tickets;
      } catch (error) {
        console.error('Error sending push notifications:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in notifyEventLive:', error);
      throw error;
    }
  },
};

