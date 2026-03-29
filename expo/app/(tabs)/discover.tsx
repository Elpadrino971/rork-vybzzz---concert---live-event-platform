import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Search, MapPin, Calendar, Filter, Radio } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { mockEvents } from '@/mocks/events';
import { mockVideos } from '@/mocks/videos';
import EventCard from '@/components/EventCard';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'concerts', 'festivals', 'clubs', 'tours'];
  const liveEvents = mockEvents.filter(e => e.isLive);
  const upcomingEvents = mockEvents.filter(e => !e.isLive);

  const renderShortVideo = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.shortVideo}>
      <Image source={{ uri: item.thumbnail }} style={styles.shortThumbnail} />
      <View style={styles.shortOverlay}>
        <Text style={styles.shortViews}>{item.views / 1000}K</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
          
          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search artists, venues, events..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Quick Filters */}
          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface }]}
            >
              <MapPin size={16} color={colors.text} />
              <Text style={[styles.filterText, { color: colors.text }]}>Near Me</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface }]}
            >
              <Calendar size={16} color={colors.text} />
              <Text style={[styles.filterText, { color: colors.text }]}>This Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface }]}
            >
              <Filter size={16} color={colors.text} />
              <Text style={[styles.filterText, { color: colors.text }]}>Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Now Section */}
        {liveEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Radio size={20} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Live Now
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Shorts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trending Concert Moments
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockVideos}
            renderItem={renderShortVideo}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === category
                          ? colors.background
                          : colors.text,
                    },
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming Events
            </Text>
          </View>
          
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
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
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  shortVideo: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  shortThumbnail: {
    width: '100%',
    height: '100%',
  },
  shortOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  shortViews: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categories: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});