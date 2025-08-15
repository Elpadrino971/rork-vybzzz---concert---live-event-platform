import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  MapPin,
  Calendar,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { Video } from '@/types';
import { useTheme } from '@/hooks/theme-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

interface VideoOverlayProps {
  video: Video;
  isMuted: boolean;
  onMuteToggle: () => void;
}



export default function VideoOverlay({ video, isMuted, onMuteToggle }: VideoOverlayProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Mute Button */}
      <TouchableOpacity
        style={[styles.muteButton, { backgroundColor: colors.overlay }]}
        onPress={onMuteToggle}
      >
        {isMuted ? (
          <VolumeX size={20} color="#fff" />
        ) : (
          <Volume2 size={20} color="#fff" />
        )}
      </TouchableOpacity>

      {/* Right Side Actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => router.push(`../profile/${video.user.id}` as any)}
        >
          <Image source={{ uri: video.user.avatar }} style={styles.avatar} />
          {!video.user.isArtist && (
            <View style={[styles.followButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.followText}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart
            size={28}
            color={isLiked ? colors.accent : '#fff'}
            fill={isLiked ? colors.accent : 'transparent'}
          />
          <Text style={styles.actionText}>{formatNumber(likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={28} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={28} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.shares)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Music size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <TouchableOpacity onPress={() => router.push(`../profile/${video.user.id}` as any)}>
          <Text style={styles.username}>@{video.user.username}</Text>
        </TouchableOpacity>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.descriptionContainer}
        >
          <Text style={styles.description}>{video.description}</Text>
        </ScrollView>

        {video.event && (
          <TouchableOpacity
            style={[styles.eventCard, { backgroundColor: colors.overlay }]}
            onPress={() => video.event && router.push(`../event/${video.event.id}` as any)}
          >
            <View style={styles.eventInfo}>
              <View style={styles.eventRow}>
                <Music size={14} color="#fff" />
                <Text style={styles.eventText}>{video.event.artist}</Text>
              </View>
              <View style={styles.eventRow}>
                <MapPin size={14} color="#fff" />
                <Text style={styles.eventText}>
                  {video.event.venue}, {video.event.location.city}
                </Text>
              </View>
              <View style={styles.eventRow}>
                <Calendar size={14} color="#fff" />
                <Text style={styles.eventText}>
                  {new Date(video.event.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {video.event.ticketsAvailable && (
              <View style={[styles.ticketButton, { backgroundColor: colors.accent }]}>
                <Text style={styles.ticketText}>Get Tickets</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  muteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 12,
    maxHeight: 60,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 60,
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventText: {
    color: '#fff',
    fontSize: 12,
  },
  ticketButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  ticketText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});