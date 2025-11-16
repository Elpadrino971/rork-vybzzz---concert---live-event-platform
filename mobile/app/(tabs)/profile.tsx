import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { profiles } from '@/lib/supabase';
import { api } from '@/lib/api';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Loading from '@/components/Loading';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await profiles.get(user.id);

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await profiles.update(user.id, {
        display_name: displayName.trim(),
        bio: bio.trim(),
      });

      if (error) throw error;

      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!user) return;

    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à vos photos pour changer votre avatar'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploadingAvatar(true);

      // Upload to backend
      const { publicUrl, error } = await api.uploadAvatar(
        result.assets[0].uri,
        user.id
      );

      if (error || !publicUrl) {
        throw new Error(error?.message || 'Erreur lors de l\'upload');
      }

      // Update profile with new avatar URL
      const { error: updateError } = await profiles.update(user.id, {
        avatar_url: publicUrl,
      });

      if (updateError) throw updateError;

      // Update local state
      setAvatarUrl(publicUrl);
      Alert.alert('Succès', 'Photo de profil mise à jour');
    } catch (error) {
      console.error('Avatar change error:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de changer la photo'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen text="Chargement du profil..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.changeAvatarButton}
          onPress={handleChangeAvatar}
          disabled={uploadingAvatar}
        >
          {uploadingAvatar ? (
            <ActivityIndicator size="small" color="#FF6B35" />
          ) : (
            <Text style={styles.changeAvatarText}>Changer la photo</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <Input
          label="Email"
          value={user?.email || ''}
          editable={false}
          containerStyle={styles.input}
        />

        <Input
          label="Nom d'affichage"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Votre nom"
          containerStyle={styles.input}
        />

        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Parlez-nous de vous..."
          multiline
          numberOfLines={4}
          containerStyle={styles.input}
          style={styles.bioInput}
        />

        <Button
          title="Enregistrer"
          onPress={handleSaveProfile}
          loading={saving}
          fullWidth
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Concerts vus</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.menuItemText}>Paramètres</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Aide & Support</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Politique de confidentialité</Text>
          <Text style={styles.menuItemIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Déconnexion"
        onPress={handleSignOut}
        variant="danger"
        fullWidth
        style={styles.signOutButton}
      />

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeAvatarButton: {
    paddingVertical: 8,
  },
  changeAvatarText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
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
  signOutButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  version: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 12,
    marginBottom: 20,
  },
});
