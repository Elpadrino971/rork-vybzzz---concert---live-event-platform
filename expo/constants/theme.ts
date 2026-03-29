export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#FFD700', // Gold
  accent: '#FF0000', // Red for CTAs
  border: '#E0E0E0',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabIconDefault: '#999999',
  tabIconSelected: '#FFD700',
  overlay: 'rgba(0, 0, 0, 0.5)',
  card: '#FFFFFF',
  success: '#4CAF50',
  error: '#F44336',
};

export const darkTheme = {
  background: '#000000',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#999999',
  primary: '#FF0000', // Red in dark mode
  accent: '#FF0000',
  border: '#333333',
  tabBar: '#000000',
  tabBarBorder: '#333333',
  tabIconDefault: '#666666',
  tabIconSelected: '#FF0000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  card: '#1A1A1A',
  success: '#4CAF50',
  error: '#F44336',
};

export type ThemeColors = typeof lightTheme;