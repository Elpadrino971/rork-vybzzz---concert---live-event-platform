import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Video } from '@/types';
import { useTheme } from '@/hooks/theme-context';

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideoPlayer({ video, isActive, isMuted }: VideoPlayerProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // For web compatibility, we'll show a placeholder
  // In a real app, you'd use expo-av for mobile and video element for web
  
  return (
    <View style={styles.container}>
      <View style={[styles.videoContainer, { backgroundColor: colors.background }]}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        {/* Placeholder for video - in production, use expo-av */}
        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});