import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Check, Crown } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useLanguage } from '@/hooks/language-context';
import { useUser } from '@/hooks/user-context';
import { usePayments } from '@/services/payment-service';

type PlanType = 'monthly' | 'yearly';

interface PremiumPlan {
  id: string;
  type: PlanType;
  price: number;
  originalPrice?: number;
  features: string[];
}

const premiumPlans: PremiumPlan[] = [
  {
    id: 'premium_monthly',
    type: 'monthly',
    price: 9.99,
    features: [
      'Ad-free experience',
      'Exclusive content access',
      'Priority customer support',
      'Advanced search filters',
      'Unlimited video downloads',
    ],
  },
  {
    id: 'premium_yearly',
    type: 'yearly',
    price: 99.99,
    originalPrice: 119.88,
    features: [
      'Ad-free experience',
      'Exclusive content access',
      'Priority customer support',
      'Advanced search filters',
      'Unlimited video downloads',
      '2 months free',
    ],
  },
];

export default function PremiumScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { currentUser, updateUser } = useUser();
  const { createSubscription } = usePayments();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const plan = premiumPlans.find(p => p.type === selectedPlan);
      if (!plan) return;

      await createSubscription(plan.id, currentUser.id);
      
      await updateUser({
        isPremium: true,
        subscriptionStatus: 'active',
        subscriptionPlan: 'premium',
      });

      Alert.alert(
        t('common.success'),
        'Welcome to Premium! Enjoy your ad-free experience.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        t('common.error'),
        'Failed to process subscription. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
    },
    crownIcon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
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
    planSelector: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
    },
    planOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    planOptionActive: {
      backgroundColor: colors.primary,
    },
    planOptionText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
    },
    planOptionTextActive: {
      color: colors.background,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    planHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    planPrice: {
      fontSize: 36,
      fontWeight: 'bold' as const,
      color: colors.primary,
    },
    planPeriod: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    originalPrice: {
      fontSize: 14,
      color: colors.textSecondary,
      textDecorationLine: 'line-through' as const,
      marginTop: 4,
    },
    savings: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '600' as const,
      marginTop: 4,
    },
    featuresList: {
      marginBottom: 24,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
    subscribeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    subscribeButtonDisabled: {
      opacity: 0.6,
    },
    subscribeButtonText: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.background,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 18,
    },
  });

  const selectedPlanData = premiumPlans.find(p => p.type === selectedPlan);

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
        <Text style={styles.headerTitle}>{t('premium.title')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.crownIcon}>
            <Crown size={48} color={colors.primary} fill={colors.primary} />
          </View>
          <Text style={styles.title}>{t('premium.title')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
        </View>

        <View style={styles.planSelector}>
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'monthly' && styles.planOptionActive,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            testID="monthly-plan"
          >
            <Text
              style={[
                styles.planOptionText,
                selectedPlan === 'monthly' && styles.planOptionTextActive,
              ]}
            >
              {t('premium.monthly')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.planOption,
              selectedPlan === 'yearly' && styles.planOptionActive,
            ]}
            onPress={() => setSelectedPlan('yearly')}
            testID="yearly-plan"
          >
            <Text
              style={[
                styles.planOptionText,
                selectedPlan === 'yearly' && styles.planOptionTextActive,
              ]}
            >
              {t('premium.yearly')}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedPlanData && (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planPrice}>
                ${selectedPlanData.price}
              </Text>
              <Text style={styles.planPeriod}>
                per {selectedPlanData.type === 'monthly' ? 'month' : 'year'}
              </Text>
              {selectedPlanData.originalPrice && (
                <>
                  <Text style={styles.originalPrice}>
                    ${selectedPlanData.originalPrice}
                  </Text>
                  <Text style={styles.savings}>
                    Save ${(selectedPlanData.originalPrice - selectedPlanData.price).toFixed(2)}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.featuresList}>
              {selectedPlanData.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Check size={20} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                isLoading && styles.subscribeButtonDisabled,
              ]}
              onPress={handleSubscribe}
              disabled={isLoading}
              testID="subscribe-button"
            >
              <Text style={styles.subscribeButtonText}>
                {isLoading ? t('common.loading') : t('premium.subscribe')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          You can manage your subscription in your account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}