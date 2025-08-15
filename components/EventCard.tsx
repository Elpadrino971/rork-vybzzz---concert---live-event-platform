import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar, MapPin, DollarSign, Radio } from 'lucide-react-native';
import { Event } from '@/types';
import { useTheme } from '@/hooks/theme-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

const { width: screenWidth } = Dimensions.get('window');

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const cardWidth = variant === 'compact' ? screenWidth * 0.45 : screenWidth - 32;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          width: cardWidth,
        },
      ]}
      onPress={() => router.push(`../event/${event.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        {event.isLive && (
          <View style={[styles.liveBadge, { backgroundColor: colors.accent }]}>
            <Radio size={12} color="#fff" />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={[styles.categoryBadge, { backgroundColor: colors.overlay }]}>
          <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[styles.artist, { color: colors.primary }]} numberOfLines={1}>
          {event.artist}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {event.venue}, {event.location.city}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <DollarSign size={16} color={colors.text} />
            <Text style={[styles.price, { color: colors.text }]}>{event.price}</Text>
          </View>
          {event.ticketsAvailable ? (
            <TouchableOpacity
              style={[styles.ticketButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.ticketButtonText}>Get Tickets</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.soldOutBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.soldOutText, { color: colors.textSecondary }]}>
                Sold Out
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  details: {
    gap: 4,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ticketButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  soldOutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  soldOutText: {
    fontSize: 12,
    fontWeight: '600',
  },
});