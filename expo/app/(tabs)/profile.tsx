import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Settings,
  Star,
  Edit3,
  Grid,
  Heart,
  Calendar,
  Award,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { mockVideos } from '@/mocks/videos';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { currentUser, toggleProStatus } = useUser();
  const router = useRouter();

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const stats = [
    { label: 'Following', value: currentUser.following },
    { label: 'Followers', value: currentUser.followers },
    { label: 'Events', value: 12 },
  ];

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Grid },
    { id: 'liked', label: 'Liked', icon: Heart },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('../settings' as '../settings')}
          >
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.proButton, { backgroundColor: colors.primary }]}
            onPress={toggleProStatus}
          >
            <Star size={16} color={colors.background} />
            <Text style={[styles.proButtonText, { color: colors.background }]}>
              {currentUser.isPro ? 'PRO' : 'Go PRO'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            {currentUser.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <Award size={16} color="#fff" />
              </View>
            )}
          </View>

          <Text style={[styles.displayName, { color: colors.text }]}>
            {currentUser.displayName}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>
            @{currentUser.username}
          </Text>

          <Text style={[styles.bio, { color: colors.text }]}>{currentUser.bio}</Text>

          {/* Stats */}
          <View style={styles.stats}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.surface }]}
            >
              <Edit3 size={16} color={colors.text} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.shareButtonText, { color: colors.text }]}>
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TouchableOpacity key={tab.id} style={styles.tab}>
                  <Icon size={24} color={colors.text} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Content Grid */}
        <View style={styles.contentGrid}>
          {mockVideos.slice(0, 6).map((video) => (
            <TouchableOpacity key={video.id} style={styles.gridItem}>
              <Image source={{ uri: video.thumbnail }} style={styles.gridImage} />
              <View style={styles.gridOverlay}>
                <Text style={styles.gridViews}>{video.views / 1000}K</Text>
              </View>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tab: {
    padding: 8,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 9 / 16,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridViews: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});