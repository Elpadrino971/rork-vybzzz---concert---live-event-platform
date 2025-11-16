import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications push</Text>
            <Text style={styles.settingDescription}>
              Recevoir des notifications pour les nouveaux événements
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications email</Text>
            <Text style={styles.settingDescription}>
              Recevoir des emails pour vos tickets et événements
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Mode sombre</Text>
            <Text style={styles.settingDescription}>
              Activer le thème sombre (bientôt disponible)
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            disabled
            trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.menuItemText}>Modifier le profil</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/privacy')}
        >
          <Text style={styles.menuItemText}>Confidentialité</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/security')}
        >
          <Text style={styles.menuItemText}>Sécurité</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Centre d'aide</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Signaler un problème</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Contactez-nous</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Légal</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Politique de confidentialité</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Licences open source</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2D3748',
  },
  menuItemIcon: {
    fontSize: 24,
    color: '#A0AEC0',
  },
  version: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 12,
    marginTop: 32,
    marginBottom: 40,
  },
});
