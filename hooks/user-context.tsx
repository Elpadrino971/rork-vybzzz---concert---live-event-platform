import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export const [UserProvider, useUser] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('current-user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Create default user
        const defaultUser: User = {
          id: '1',
          username: 'musicfan',
          displayName: 'Music Fan',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
          bio: 'Living for live music 🎵',
          isArtist: false,
          isPro: false,
          followers: 234,
          following: 567,
          verified: false,
        };
        setCurrentUser(defaultUser);
        await AsyncStorage.setItem('current-user', JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    try {
      await AsyncStorage.setItem('current-user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const toggleProStatus = () => {
    if (currentUser) {
      updateUser({ isPro: !currentUser.isPro });
    }
  };

  return {
    currentUser,
    updateUser,
    toggleProStatus,
    isLoading,
  };
});