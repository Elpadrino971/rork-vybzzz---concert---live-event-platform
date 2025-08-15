import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { lightTheme, darkTheme, ThemeColors } from '@/constants/theme';
import { Theme } from '@/types';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors: ThemeColors = theme === 'light' ? lightTheme : darkTheme;

  return {
    theme,
    colors,
    toggleTheme,
    isLoading,
  };
});