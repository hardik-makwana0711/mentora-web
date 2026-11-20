/**
 * Trusted Navy (approved Nov 2026). Mirrors `apps/mobile/src/theme/colors.ts` — LightTheme + DarkTheme token maps.
 * Web applies these via `[data-theme]` CSS variables in `styles/index.css`.
 */
export const mobileDarkTheme = {
  primary: '#4B69EE',
  primaryText: '#8DA2FF',
  primaryLight: '#8DA2FF',
  primaryDark: '#2D4BD1',
  secondary: '#3FD3A6',
  accent: '#FFC24D',
  accentWarm: '#FFB84D',
  background: '#0A1022',
  surface: '#121B36',
  surfaceLight: '#16213F',
  surfaceElevated: '#1A2547',
  card: '#131D3B',
  cardBorder: '#22305A',
  textPrimary: '#F1F4FB',
  textSecondary: '#A9B4CF',
  textMuted: '#8696B5',
  sidebarBg: '#0B1226',
  navInactive: '#8592B0',
  success: '#3FD3A6',
  warning: '#FBBF24',
  error: '#FF7477',
  info: '#6EA8FF',
} as const;

export const mobileLightTheme = {
  primary: '#1F3FBF',
  primaryText: '#1F3FBF',
  primaryLight: '#3A63E8',
  primaryDark: '#14286F',
  secondary: '#0B7A5F',
  accent: '#FFB21E',
  accentWarm: '#E8890C',
  background: '#F5F7FB',
  surface: '#EBEFF7',
  surfaceLight: '#F8FAFD',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#DFE5EF',
  textPrimary: '#0B1533',
  textSecondary: '#46506A',
  textMuted: '#5B6680',
  sidebarBg: '#FFFFFF',
  navInactive: '#667189',
  success: '#0B7A5F',
  warning: '#A35A08',
  error: '#C8323A',
  info: '#1E54D6',
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
