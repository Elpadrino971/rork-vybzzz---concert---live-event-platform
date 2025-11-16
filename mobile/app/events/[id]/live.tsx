import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/hooks/useAuth';
import { events as eventsApi, tickets as ticketsApi } from '@/lib/supabase';
import Loading from '@/components/Loading';

const { width, height } = Dimensions.get('window');

export default function LiveStreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      checkAccess();
    }
  }, [id]);

  const checkAccess = async () => {
    if (!user) {
      Alert.alert(
        'Accès refusé',
        'Vous devez être connecté pour regarder ce concert',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    try {
      // Check if user has a ticket
      const { hasTicket: userHasTicket } = await ticketsApi.hasTicket(user.id, id!);

      if (!userHasTicket) {
        Alert.alert(
          'Accès refusé',
          'Vous devez acheter un ticket pour regarder ce concert',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      setHasTicket(true);

      // Get event details
      const { data, error } = await eventsApi.getById(id!);

      if (error) throw error;

      if (data) {
        setEvent(data);

        if (data.status !== 'live') {
          Alert.alert(
            'Concert non disponible',
            'Ce concert n\'est pas encore en direct',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      Alert.alert('Erreur', 'Impossible de vérifier l\'accès au concert');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Chargement du concert..." />;
  }

  if (!hasTicket || !event) {
    return null;
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = getYouTubeVideoId(event.stream_url || '');

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>URL de stream invalide</Text>
      </View>
    );
  }

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <>
      <Stack.Screen
        options={{
          title: event.title || 'Concert en direct',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => <Loading text="Chargement du stream..." />}
          />
        </View>

        <View style={styles.infoBar}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
        </View>

        {/* Future: Add chat here */}
        <View style={styles.chatPlaceholder}>
          <Text style={styles.chatPlaceholderText}>
            💬 Le chat sera disponible prochainement
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: width,
    height: Platform.OS === 'ios' ? width * (9 / 16) : 250,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  infoBar: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53E3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
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
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chatPlaceholderText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
