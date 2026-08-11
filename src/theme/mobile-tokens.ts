/**
 * Mirrors `apps/mobile/src/theme/colors.ts` — LightTheme + DarkTheme token maps.
 * Web applies these via `[data-theme]` CSS variables in `styles/index.css`.
 */
export const mobileDarkTheme = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#5A52E0',
  secondary: '#43B89C',
  accent: '#FF6584',
  accentWarm: '#FFD166',
  background: '#0F0E17',
  surface: '#1A1929',
  surfaceLight: '#232136',
  surfaceElevated: '#2A2843',
  card: '#1E1D2E',
  cardBorder: '#2D2B45',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B5D0',
  textMuted: '#6E6B88',
  sidebarBg: '#0F111A',
  navInactive: '#8A8DA8',
  success: '#43B89C',
  warning: '#FFD166',
  error: '#FF6584',
  info: '#4CC9F0',
} as const;

export const mobileLightTheme = {
  primary: '#1E3A8A',
  primaryLight: '#3B82F6',
  primaryDark: '#0D1B3D',
  secondary: '#43B89C',
  accent: '#F4B400',
  accentWarm: '#FFF3CD',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  surfaceLight: '#F9FAFB',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  sidebarBg: '#FFFFFF',
  navInactive: '#6B7280',
  success: '#43B89C',
  warning: '#F4B400',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

/** @deprecated Use CSS variables — kept for legacy imports */
export const mobileColors = mobileDarkTheme;

export const mobileSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const mobileRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const mobileFontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;
