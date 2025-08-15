import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, MapPin, Calendar, Clock, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockEvents } from '@/mocks/events';
import { Image } from 'expo-image';

export default function EventDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const event = mockEvents.find(e => e.id === id);
  
  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Event not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Event Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: event.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
          <Text style={[styles.artist, { color: colors.primary }]}>{event.artist}</Text>
          
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <MapPin size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {event.venue}, {event.location.city}, {event.location.state}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {event.time}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                Starting at ${event.price}
              </Text>
            </View>
          </View>
          
          {event.ticketsAvailable ? (
            <TouchableOpacity
              style={[styles.ticketButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.ticketButtonText}>Get Tickets</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.soldOutButton, { backgroundColor: colors.surface }]}>
              <Text style={[styles.soldOutText, { color: colors.textSecondary }]}>
                Sold Out
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  details: {
    gap: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  ticketButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  soldOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  soldOutText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});