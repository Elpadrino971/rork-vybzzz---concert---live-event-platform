/**
 * VyBzzZ Design System - Colors
 *
 * Light Mode: Blanc + Or (Luxe)
 * Dark Mode: Noir + Rouge Netflix (Premium)
 */

export const Colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',

    primary: '#FFD700', // Or
    primaryDark: '#FFA500', // Or foncé

    text: '#000000',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',

    card: '#FFFFFF',
    cardHover: '#F9FAFB',

    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  dark: {
    background: '#000000',
    backgroundSecondary: '#0F0F0F',

    primary: '#E50914', // Rouge Netflix
    primaryDark: '#B20710', // Rouge Netflix foncé

    text: '#FFFFFF',
    textSecondary: '#A1A1A6',
    textTertiary: '#6E6E73',

    border: '#2C2C2E',
    borderLight: '#1C1C1E',

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',

    card: '#1C1C1E',
    cardHover: '#2C2C2E',

    shadow: 'rgba(0, 0, 0, 0.5)',
  },
}

export const GradientColors = {
  light: {
    gold: ['#FFD700', '#FFA500', '#FF8C00'],
    subtle: ['#FFFFFF', '#F9FAFB'],
  },
  dark: {
    netflix: ['#E50914', '#B20710', '#8B0000'],
    subtle: ['#000000', '#0F0F0F'],
  },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
}

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
}

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

export type ColorScheme = 'light' | 'dark'
