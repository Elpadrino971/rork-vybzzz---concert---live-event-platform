import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
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
} from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { currentUser } = useUser();
  const router = useRouter();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => console.log('Edit Profile'),
        },
        {
          icon: Shield,
          label: 'Privacy',
          onPress: () => console.log('Privacy'),
        },
        {
          icon: CreditCard,
          label: 'Payment Methods',
          onPress: () => console.log('Payment'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          value: theme === 'dark',
          isToggle: true,
          onToggle: toggleTheme,
        },
        {
          icon: Bell,
          label: 'Notifications',
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
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          onPress: () => console.log('Help'),
        },
        {
          icon: Lock,
          label: 'Terms & Privacy',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
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
            {currentUser.isPro && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
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
              {section.items.map((item, index) => {
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
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
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
            Log Out
          </Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Vybzzz v1.0.0
        </Text>
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
  },
  settingLabel: {
    fontSize: 16,
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