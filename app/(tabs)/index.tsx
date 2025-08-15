import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/theme-context';
import { mockVideos } from '@/mocks/videos';
import VideoPlayer from '@/components/VideoPlayer';
import VideoOverlay from '@/components/VideoOverlay';
import { Image } from 'expo-image';
import { Radio } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [isMuted, setIsMuted] = useState(false);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderVideo = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.videoContainer}>
        {/* Video Background */}
        <Image
          source={{ uri: item.thumbnail }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        
        {/* Video Player Placeholder */}
        <VideoPlayer
          video={item}
          isActive={index === activeIndex}
          isMuted={isMuted}
        />
        
        {/* Overlay with controls */}
        <VideoOverlay
          video={item}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Tabs */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => setActiveTab('following')}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'following' ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: activeTab === 'following' ? 'bold' : 'normal',
                  },
                ]}
              >
                Following
              </Text>
            </TouchableOpacity>
            
            <View style={styles.tabDivider} />
            
            <TouchableOpacity
              onPress={() => setActiveTab('forYou')}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'forYou' ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: activeTab === 'forYou' ? 'bold' : 'normal',
                  },
                ]}
              >
                For You
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Button */}
          <TouchableOpacity
            style={[styles.liveButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('./discover' as any)}
          >
            <Radio size={16} color="#fff" />
            <Text style={styles.liveButtonText}>LIVE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Video Feed */}
      <FlatList
        data={mockVideos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
  },
  tabDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: screenHeight,
  },
});