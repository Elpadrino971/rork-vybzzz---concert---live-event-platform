/**
 * VyBzzZ Color Palette
 * Centralized color constants for the mobile app
 */

export const Colors = {
  // Brand Colors
  primary: '#FF6B35',
  primaryDark: '#E85A25',
  primaryLight: '#FF8C66',

  // Secondary Colors
  secondary: '#4A5568',
  secondaryDark: '#2D3748',
  secondaryLight: '#718096',

  // Status Colors
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#E53E3E',
  info: '#4299E1',

  // Live Status
  live: '#E53E3E',
  liveDot: '#FFFFFF',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },

  // Background Colors
  background: '#FFFFFF',
  backgroundAlt: '#F7FAFC',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text Colors
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: '#E2E8F0',
  borderFocus: '#FF6B35',
  borderError: '#E53E3E',

  // Input Colors
  input: {
    background: '#FFFFFF',
    border: '#E2E8F0',
    placeholder: '#A0AEC0',
    text: '#2D3748',
  },

  // Button Colors
  button: {
    primary: '#FF6B35',
    primaryText: '#FFFFFF',
    secondary: '#4A5568',
    secondaryText: '#FFFFFF',
    outline: 'transparent',
    outlineText: '#FF6B35',
    danger: '#E53E3E',
    dangerText: '#FFFFFF',
    disabled: '#E2E8F0',
    disabledText: '#A0AEC0',
  },

  // Card Colors
  card: {
    background: '#FFFFFF',
    border: '#E2E8F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Badge Colors
  badge: {
    primary: '#FF6B35',
    primaryText: '#FFFFFF',
    success: '#48BB78',
    successText: '#FFFFFF',
    warning: '#ECC94B',
    warningText: '#2D3748',
    error: '#E53E3E',
    errorText: '#FFFFFF',
  },

  // Tab Bar Colors
  tabBar: {
    active: '#FF6B35',
    inactive: '#A0AEC0',
    background: '#FFFFFF',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

// Export individual color groups for easier imports
export const {
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  white,
  black,
  gray,
} = Colors;

export default Colors;
