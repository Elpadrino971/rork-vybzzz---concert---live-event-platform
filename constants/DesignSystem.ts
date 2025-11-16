/**
 * VyBzzZ Design System
 *
 * Centralized design tokens for consistent UI/UX across the platform
 */

export const DESIGN_SYSTEM = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Brand colors
    brand: {
      primary: '#9333ea',      // Violet - Main brand color
      primaryHover: '#7e22ce', // Darker violet for hover states
      primaryLight: '#a855f7', // Lighter violet for backgrounds
      secondary: '#ec4899',    // Pink - Secondary actions, CTAs
      secondaryHover: '#db2777',
      accent: '#f59e0b',       // Amber - Highlights, badges
      accentHover: '#d97706',
    },

    // UI colors
    ui: {
      background: '#0f172a',   // Dark blue - Main background
      backgroundAlt: '#020617', // Darker for contrast
      surface: '#1e293b',      // Slate - Cards, modals
      surfaceHover: '#334155', // Lighter slate for hover
      border: '#334155',       // Slate - Borders
      borderLight: '#475569',  // Lighter borders
      divider: '#1e293b',      // Subtle dividers
    },

    // Text colors
    text: {
      primary: '#f8fafc',      // White - Main text
      secondary: '#cbd5e1',    // Gray light - Secondary text
      muted: '#64748b',        // Gray - Muted text
      disabled: '#475569',     // Disabled state
      inverse: '#0f172a',      // Dark text on light backgrounds
    },

    // Semantic colors
    semantic: {
      success: '#22c55e',      // Green - Success states
      successBg: '#15803d',    // Darker green for backgrounds
      error: '#ef4444',        // Red - Error states
      errorBg: '#991b1b',      // Darker red for backgrounds
      warning: '#f59e0b',      // Orange - Warning states
      warningBg: '#b45309',    // Darker orange for backgrounds
      info: '#3b82f6',         // Blue - Info states
      infoBg: '#1e40af',       // Darker blue for backgrounds
    },

    // Social media brand colors
    social: {
      facebook: '#1877f2',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      youtube: '#ff0000',
      spotify: '#1db954',
      tiktok: '#000000',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fonts: {
      display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, "Fira Code", "Courier New", monospace',
    },

    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================
  // SPACING (based on 4px grid)
  // ============================================
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',

    // Custom VyBzzZ shadows
    glow: '0 0 20px rgb(147 51 234 / 0.5)',
    glowStrong: '0 0 40px rgb(147 51 234 / 0.7)',
    glowPink: '0 0 20px rgb(236 72 153 / 0.5)',
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '700ms',
    },

    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },

    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideInRight: {
        from: { transform: 'translateX(100%)' },
        to: { transform: 'translateX(0)' },
      },
      slideInLeft: {
        from: { transform: 'translateX(-100%)' },
        to: { transform: 'translateX(0)' },
      },
      slideInUp: {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0)' },
      },
      slideInDown: {
        from: { transform: 'translateY(-100%)' },
        to: { transform: 'translateY(0)' },
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    },
  },

  // ============================================
  // BREAKPOINTS (mobile-first)
  // ============================================
  breakpoints: {
    sm: '640px',   // Small tablets
    md: '768px',   // Tablets
    lg: '1024px',  // Laptops
    xl: '1280px',  // Desktops
    '2xl': '1536px', // Large desktops
  },

  // ============================================
  // Z-INDEX LAYERS
  // ============================================
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  // ============================================
  // COMPONENT VARIANTS
  // ============================================
  components: {
    button: {
      sizes: {
        xs: { height: '1.75rem', px: '0.75rem', fontSize: '0.75rem' },
        sm: { height: '2rem', px: '1rem', fontSize: '0.875rem' },
        md: { height: '2.5rem', px: '1.25rem', fontSize: '1rem' },
        lg: { height: '3rem', px: '1.5rem', fontSize: '1.125rem' },
        xl: { height: '3.5rem', px: '2rem', fontSize: '1.25rem' },
      },
    },
    input: {
      sizes: {
        sm: { height: '2rem', px: '0.75rem', fontSize: '0.875rem' },
        md: { height: '2.5rem', px: '1rem', fontSize: '1rem' },
        lg: { height: '3rem', px: '1.25rem', fontSize: '1.125rem' },
      },
    },
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
  },
} as const

// Export types for TypeScript
export type DesignSystemColors = typeof DESIGN_SYSTEM.colors
export type DesignSystemTypography = typeof DESIGN_SYSTEM.typography
export type DesignSystemSpacing = typeof DESIGN_SYSTEM.spacing
export type DesignSystemAnimations = typeof DESIGN_SYSTEM.animations
