import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  ticket_price: number;
  image_url: string;
  artist_name?: string;
  status?: string;
}

interface EventCardProps {
  event: Event;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export default function EventCard({
  event,
  onPress,
  variant = 'default',
}: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const isLive = event.status === 'live';
  const isPast = eventDate < new Date() && !isLive;

  const formattedDate = format(eventDate, 'dd MMM yyyy', { locale: fr });
  const formattedTime = format(eventDate, 'HH:mm');

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: event.image_url }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {event.title}
          </Text>
          {event.artist_name && (
            <Text style={styles.compactArtist} numberOfLines={1}>
              {event.artist_name}
            </Text>
          )}
          <Text style={styles.compactDate}>
            {formattedDate} · {formattedTime}
          </Text>
        </View>
        <View style={styles.compactPrice}>
          <Text style={styles.priceText}>{event.ticket_price}€</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isPast}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        )}

        {isPast && (
          <View style={styles.pastOverlay}>
            <Text style={styles.pastText}>Terminé</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>{format(eventDate, 'dd')}</Text>
            <Text style={styles.dateMonth}>{format(eventDate, 'MMM', { locale: fr })}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            {event.artist_name && (
              <Text style={styles.artist} numberOfLines={1}>
                👤 {event.artist_name}
              </Text>
            )}
            <Text style={styles.time}>
              🕐 {formattedTime}
            </Text>
          </View>
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>À partir de</Text>
            <Text style={styles.price}>{event.ticket_price}€</Text>
          </View>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>
              {isLive ? 'Rejoindre' : 'Acheter'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default variant
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  pastOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 60,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: '#718096',
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 12,
    color: '#718096',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  ctaButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  compactArtist: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  compactDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  compactPrice: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
});
