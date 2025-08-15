import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  Camera,
  Video,
  Radio,
  Upload,
  Music,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const createOptions = [
    {
      id: 'record',
      title: 'Record Video',
      description: 'Capture concert moments',
      icon: Video,
      color: colors.primary,
    },
    {
      id: 'live',
      title: 'Go Live',
      description: 'Stream your experience',
      icon: Radio,
      color: colors.accent,
    },
    {
      id: 'upload',
      title: 'Upload',
      description: 'Share existing videos',
      icon: Upload,
      color: colors.primary,
    },
    {
      id: 'photo',
      title: 'Take Photo',
      description: 'Snap concert pics',
      icon: Camera,
      color: colors.primary,
    },
  ];

  const handleCreate = () => {
    // Handle creation based on selected option
    console.log('Creating with option:', selectedOption);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Share Your Vybzzz
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Capture and share your live music moments
          </Text>

          <View style={styles.options}>
            {createOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;
              const isLive = option.id === 'live';
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? option.color
                        : colors.surface,
                      borderColor: isSelected ? option.color : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedOption(option.id)}
                  activeOpacity={0.8}
                >
                  {isLive && (
                    <View style={[styles.liveBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.liveBadgeText}>RECOMMENDED</Text>
                    </View>
                  )}
                  
                  <Icon
                    size={32}
                    color={isSelected ? '#fff' : option.color}
                  />
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: isSelected ? '#fff' : colors.text },
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.tipsHeader}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                Pro Tips
              </Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tip, { color: colors.textSecondary }]}>
                • Use good lighting for better quality
              </Text>
              <Text style={[styles.tip, { color: colors.textSecondary }]}>
                • Keep videos under 60 seconds
              </Text>
              <Text style={[styles.tip, { color: colors.textSecondary }]}>
                • Add music and effects after recording
              </Text>
              <Text style={[styles.tip, { color: colors.textSecondary }]}>
                • Tag the event and artist for more views
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: selectedOption ? colors.accent : colors.surface,
                opacity: selectedOption ? 1 : 0.5,
              },
            ]}
            onPress={handleCreate}
            disabled={!selectedOption}
          >
            <Text
              style={[
                styles.createButtonText,
                { color: selectedOption ? '#fff' : colors.textSecondary },
              ]}
            >
              {selectedOption === 'live' ? 'Start Live Stream' : 'Continue'}
            </Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});