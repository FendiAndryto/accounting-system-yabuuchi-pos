export const colors = {
  primary: '#2563eb',          // Clean Corporate Blue (accent)
  primaryHover: '#1d4ed8',     // Deep Blue hover/active
  primaryLight: '#dbeafe',     // Soft Blue border/tint
  primarySubtle: '#eff6ff',    // Ultra soft Blue background
  primaryActive: '#1e40af',

  background: '#f8fafc',       // Slate 50 ultra clean minimalist
  surface: '#ffffff',          // Pure white card surfaces
  surfaceSecondary: '#f1f5f9', // Slate 100 muted containers
  surfaceHover: '#f8fafc',

  border: '#e2e8f0',           // Slate 200 crisp subtle borders
  borderLight: '#f1f5f9',      // Slate 100
  borderFocus: '#93c5fd',      // Blue 300

  textPrimary: '#0f172a',      // Slate 900 high contrast readable
  textSecondary: '#475569',    // Slate 600 secondary descriptions
  textMuted: '#64748b',        // Slate 500 placeholders & subtle tags
  textLight: '#94a3b8',        // Slate 400

  cashIn: '#059669',           // Emerald 600
  cashInLight: '#10b981',      // Emerald 500
  cashInBg: '#ecfdf5',         // Emerald 50
  cashInBorder: '#a7f3d0',

  cashOut: '#e11d48',          // Rose 600
  cashOutLight: '#f43f5e',     // Rose 500
  cashOutBg: '#fff1f2',        // Rose 50
  cashOutBorder: '#fecdd3',

  warning: '#d97706',          // Amber 600
  warningBg: '#fffbeb',        // Amber 50
  warningBorder: '#fde68a',

  indigo: '#4f46e5',           // Indigo 600
  indigoBg: '#eef2ff',         // Indigo 50
  indigoBorder: '#c7d2fe',

  sidebarBg: '#ffffff',
  sidebarBorder: '#e2e8f0',
  sidebarText: '#475569',
  sidebarTextActive: '#1d4ed8',
  sidebarItemActiveBg: '#eff6ff',
};

export const theme = {
  colors,
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    fab: {
      shadowColor: '#2563eb',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 8,
    },
  },
};

export default theme;
