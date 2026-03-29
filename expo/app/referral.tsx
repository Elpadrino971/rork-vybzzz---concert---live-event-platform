import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Gift, Users, DollarSign, Copy, Share2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useLanguage } from '@/hooks/language-context';
import { useUser } from '@/hooks/user-context';

export default function ReferralScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { currentUser } = useUser();
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyCode = async () => {
    if (!currentUser?.referralCode) return;
    
    try {
      await Clipboard.setString(currentUser.referralCode);
      Alert.alert(t('common.success'), 'Referral code copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleShareCode = async () => {
    if (!currentUser?.referralCode) return;
    
    setIsSharing(true);
    try {
      const message = `Join me on Vybzzz - the ultimate concert & live event platform! Use my referral code: ${currentUser.referralCode} and let's discover amazing live music together! 🎵`;
      
      await Share.share({
        message,
        title: 'Join Vybzzz with my referral code!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 32,
      padding: 24,
      backgroundColor: colors.surface,
      borderRadius: 16,
    },
    giftIcon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    codeSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    codeLabel: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    codeText: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.primary,
      textAlign: 'center',
      letterSpacing: 2,
    },
    copyButton: {
      padding: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonSecondary: {
      backgroundColor: colors.border,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.background,
      marginLeft: 8,
    },
    actionButtonTextSecondary: {
      color: colors.text,
    },
    howItWorksSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    stepNumberText: {
      fontSize: 12,
      fontWeight: 'bold' as const,
      color: colors.background,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    stepDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  const steps = [
    {
      title: t('referral.step1'),
      description: 'Share your unique referral code with friends and family',
    },
    {
      title: t('referral.step2'),
      description: 'When they sign up using your code, you both get rewards',
    },
    {
      title: t('referral.step3'),
      description: 'Earn points and exclusive perks for each successful referral',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('referral.title')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.giftIcon}>
            <Gift size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('referral.title')}</Text>
          <Text style={styles.subtitle}>{t('referral.subtitle')}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>${currentUser?.referralEarnings?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>{t('referral.earnings')}</Text>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>{t('referral.yourCode')}</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>
              {currentUser?.referralCode || 'LOADING...'}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
              testID="copy-code-button"
            >
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareCode}
              disabled={isSharing}
              testID="share-code-button"
            >
              <Share2 size={16} color={colors.background} />
              <Text style={styles.actionButtonText}>
                {isSharing ? 'Sharing...' : t('referral.shareCode')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>{t('referral.howItWorks')}</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}