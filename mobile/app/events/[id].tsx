import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '@/hooks/useAuth';
import { events as eventsApi, tickets as ticketsApi } from '@/lib/supabase';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchEvent();
      checkTicket();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await eventsApi.getById(id!);

      if (error) throw error;

      if (data) {
        setEvent({
          ...data,
          artist_name: data.profiles?.display_name || 'Artiste inconnu',
          artist_bio: data.profiles?.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'événement');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkTicket = async () => {
    if (!user || !id) return;

    try {
      const { hasTicket: userHasTicket } = await ticketsApi.hasTicket(user.id, id);
      setHasTicket(userHasTicket);
    } catch (error) {
      console.error('Error checking ticket:', error);
    }
  };

  const handlePurchaseTicket = async () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour acheter un ticket',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/sign-in') },
        ]
      );
      return;
    }

    setPurchasing(true);

    try {
      // 1. Create payment intent
      const { clientSecret, error: apiError } = await api.purchaseTicket(id!);

      if (apiError || !clientSecret) {
        throw new Error(apiError?.message || 'Erreur lors de la création du paiement');
      }

      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'VyBzzZ',
        returnURL: 'vybzzz://payment-success',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Erreur de paiement', paymentError.message);
        }
      } else {
        Alert.alert(
          'Paiement réussi !',
          'Votre ticket a été acheté avec succès. Retrouvez-le dans l\'onglet "Mes Tickets".',
          [
            {
              text: 'Voir mes tickets',
              onPress: () => router.push('/(tabs)/tickets'),
            },
            { text: 'OK' },
          ]
        );
        setHasTicket(true);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleWatchLive = () => {
    if (event?.status === 'live') {
      router.push(`/events/${id}/live`);
    }
  };

  if (loading || !event) {
    return <Loading fullScreen text="Chargement de l'événement..." />;
  }

  const eventDate = new Date(event.event_date);
  const isLive = event.status === 'live';
  const isPast = eventDate < new Date() && !isLive;
  const formattedDate = format(eventDate, 'EEEE dd MMMM yyyy', { locale: fr });
  const formattedTime = format(eventDate, 'HH:mm');

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.image_url }} style={styles.image} />

      {isLive && (
        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.artistInfo}>
          <Text style={styles.artistLabel}>Artiste</Text>
          <Text style={styles.artistName}>{event.artist_name}</Text>
          {event.artist_bio && (
            <Text style={styles.artistBio} numberOfLines={2}>
              {event.artist_bio}
            </Text>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Prix</Text>
              <Text style={styles.infoValue}>{event.ticket_price}€</Text>
            </View>
          </View>
        </View>

        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>À propos du concert</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        <View style={styles.actionSection}>
          {isPast && !isLive ? (
            <View style={styles.pastNotice}>
              <Text style={styles.pastText}>Cet événement est terminé</Text>
            </View>
          ) : isLive ? (
            <>
              {hasTicket ? (
                <Button
                  title="▶️ Regarder le concert"
                  onPress={handleWatchLive}
                  fullWidth
                  size="large"
                />
              ) : (
                <View style={styles.liveNotice}>
                  <Text style={styles.liveNoticeText}>
                    Vous devez acheter un ticket pour regarder ce concert
                  </Text>
                  <Button
                    title={`Acheter pour ${event.ticket_price}€`}
                    onPress={handlePurchaseTicket}
                    loading={purchasing}
                    fullWidth
                    size="large"
                    style={styles.purchaseButton}
                  />
                </View>
              )}
            </>
          ) : hasTicket ? (
            <View style={styles.ticketOwned}>
              <Text style={styles.ticketOwnedIcon}>✅</Text>
              <Text style={styles.ticketOwnedText}>
                Vous avez déjà acheté un ticket pour ce concert
              </Text>
              <Button
                title="Voir mon ticket"
                onPress={() => router.push('/(tabs)/tickets')}
                variant="outline"
                fullWidth
                style={styles.viewTicketButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Ticket</Text>
                <Text style={styles.priceValue}>{event.ticket_price}€</Text>
              </View>
              <Button
                title="Acheter un ticket"
                onPress={handlePurchaseTicket}
                loading={purchasing}
                fullWidth
                size="large"
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: width,
    height: width * 0.6,
  },
  liveBanner: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  artistInfo: {
    marginBottom: 24,
  },
  artistLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 4,
  },
  artistBio: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  actionSection: {
    marginTop: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#718096',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B35',
  },
  pastNotice: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pastText: {
    fontSize: 16,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  liveNotice: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  liveNoticeText: {
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 12,
  },
  purchaseButton: {
    marginTop: 8,
  },
  ticketOwned: {
    backgroundColor: '#F0FFF4',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#48BB78',
    alignItems: 'center',
  },
  ticketOwnedIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  ticketOwnedText: {
    fontSize: 16,
    color: '#2F855A',
    textAlign: 'center',
    marginBottom: 16,
  },
  viewTicketButton: {
    marginTop: 8,
  },
});
