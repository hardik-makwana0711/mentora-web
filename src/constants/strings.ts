/**
 * UI strings — resolved via i18next (`en` / `tr`, toggled globally).
 * In React components, prefer `useStrings()` so the UI updates when language changes.
 */
export { StringsProvider, useStrings, tr } from '@/app/providers/StringsProvider';
export type { Strings } from '@/locales/en';
