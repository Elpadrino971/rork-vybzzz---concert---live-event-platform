import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import {
  X,
  Moon,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Smartphone,
  Globe,
  Crown,
  Users,
  BarChart3,
  MessageCircle,
  Star,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import { useLanguage } from '@/hooks/language-context';
import { useRouter } from 'expo-router';
import { Language } from '@/types';

interface SettingItem {
  icon: any;
  label: string;
  onPress?: () => void;
  badge?: string;
  subtitle?: string;
  isToggle?: boolean;
  value?: boolean;
  onToggle?: () => void;
}

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const handleLanguageSelect = (language: Language) => {
    changeLanguage(language);
    setShowLanguageModal(false);
  };

  const settingsSections = [
    {
      title: t('settings.account'),
      items: [
        {
          icon: User,
          label: t('settings.editProfile'),
          onPress: () => console.log('Edit Profile'),
        },
        {
          icon: Shield,
          label: t('settings.privacy'),
          onPress: () => console.log('Privacy'),
        },
        {
          icon: CreditCard,
          label: t('settings.paymentMethods'),
          onPress: () => console.log('Payment'),
        },
      ],
    },
    {
      title: t('settings.userAccess'),
      items: [
        {
          icon: Crown,
          label: t('settings.upgradeToPremium'),
          onPress: () => router.push('../premium' as any),
          badge: !currentUser?.isPremium ? 'NEW' : undefined,
        },
        {
          icon: Users,
          label: t('settings.referralProgram'),
          onPress: () => router.push('../referral' as any),
          subtitle: currentUser?.referralEarnings ? `${currentUser.referralEarnings.toFixed(2)} earned` : undefined,
        },
        ...(currentUser?.isPro ? [{
          icon: BarChart3,
          label: t('settings.proDashboard'),
          onPress: () => router.push('../dashboard' as any),
        }] : []),
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        {
          icon: Moon,
          label: t('settings.darkMode'),
          value: theme === 'dark',
          isToggle: true,
          onToggle: toggleTheme,
        },
        {
          icon: Globe,
          label: t('settings.language'),
          onPress: () => setShowLanguageModal(true),
          subtitle: languages.find(l => l.code === currentLanguage)?.name,
        },
        {
          icon: Bell,
          label: t('settings.notifications'),
          onPress: () => console.log('Notifications'),
        },
        {
          icon: Smartphone,
          label: 'App Settings',
          onPress: () => console.log('App Settings'),
        },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        {
          icon: MessageCircle,
          label: t('settings.aiAssistant'),
          onPress: () => router.push('../chat' as any),
        },
        {
          icon: HelpCircle,
          label: t('settings.helpCenter'),
          onPress: () => console.log('Help'),
        },
        {
          icon: Lock,
          label: t('settings.terms'),
          onPress: () => console.log('Terms'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        {currentUser && (
          <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {currentUser.displayName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              @{currentUser.username}
            </Text>
            {currentUser.isPremium && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.proText}>PREMIUM</Text>
              </View>
            )}
            {currentUser.isPro && (
              <View style={[styles.proBadge, { backgroundColor: colors.accent, marginTop: 4 }]}>
                <Text style={styles.proText}>PRO MEMBER</Text>
              </View>
            )}
          </View>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item: SettingItem, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;
                
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.settingItem,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                    onPress={item.onPress}
                    disabled={item.isToggle}
                  >
                    <View style={styles.settingLeft}>
                      <Icon size={20} color={colors.text} />
                      <View style={styles.settingTextContainer}>
                        <View style={styles.settingLabelRow}>
                          <Text style={[styles.settingLabel, { color: colors.text }]}>
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                              <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        {item.subtitle && (
                          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    {item.isToggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: colors.surface, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={() => console.log('Logout')}
        >
          <LogOut size={20} color={colors.accent} />
          <Text style={[styles.logoutText, { color: colors.accent }]}>
            {t('settings.logout')}
          </Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Vybzzz v1.0.0
        </Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('settings.language')}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    currentLanguage === item.code && { backgroundColor: colors.surface },
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {currentLanguage === item.code && (
                    <Star size={16} color={colors.primary} fill={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  userCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
});