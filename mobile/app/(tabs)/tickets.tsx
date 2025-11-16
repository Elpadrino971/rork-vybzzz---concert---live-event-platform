import { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { tickets as ticketsApi } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'react-native-qrcode-svg';
import Loading from '@/components/Loading';

const { width } = Dimensions.get('window');

interface Ticket {
  id: string;
  purchase_date: string;
  events: {
    id: string;
    title: string;
    event_date: string;
    image_url: string;
    stream_url: string;
    status: string;
  };
}

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await ticketsApi.list(user.id);

      if (error) throw error;

      if (data) {
        setTickets(data as Ticket[]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, []);

  const handleWatchLive = (ticket: Ticket) => {
    if (ticket.events.status === 'live') {
      router.push(`/events/${ticket.events.id}/live`);
    }
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const eventDate = new Date(item.events.event_date);
    const isLive = item.events.status === 'live';
    const isPast = eventDate < new Date() && !isLive;
    const formattedDate = format(eventDate, 'dd MMMM yyyy à HH:mm', { locale: fr });

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.events.title}
            </Text>
            <Text style={styles.eventDate}>{formattedDate}</Text>

            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN DIRECT</Text>
              </View>
            )}

            {isPast && (
              <Text style={styles.pastText}>Concert terminé</Text>
            )}
          </View>
        </View>

        <View style={styles.qrContainer}>
          <QRCode value={item.id} size={width - 120} />
        </View>

        <View style={styles.ticketFooter}>
          <Text style={styles.ticketId}>Ticket: {item.id.slice(0, 8).toUpperCase()}</Text>

          {isLive && (
            <TouchableOpacity
              style={styles.watchButton}
              onPress={() => handleWatchLive(item)}
            >
              <Text style={styles.watchButtonText}>▶️ Regarder</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading fullScreen text="Chargement de vos tickets..." />;
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎫</Text>
        <Text style={styles.emptyTitle}>Aucun ticket</Text>
        <Text style={styles.emptyText}>
          Vous n'avez pas encore acheté de tickets.{'\n'}
          Découvrez les prochains concerts !
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.browseButtonText}>Voir les concerts</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
            colors={['#FF6B35']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  listContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  ticketHeader: {
    marginBottom: 20,
  },
  ticketInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53E3E',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  pastText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontStyle: 'italic',
    marginTop: 8,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  ticketFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  ticketId: {
    fontSize: 12,
    color: '#A0AEC0',
    fontFamily: 'monospace',
  },
  watchButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F7FAFC',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
