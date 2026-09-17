/**
 * UI strings — resolved via i18next (`en` / `tr`, toggled globally).
 * In React components, prefer `useStrings()` so the UI updates when language changes.
 */
export { StringsProvider } from '@/app/providers/StringsProvider';
export { useStrings, tr } from '@/app/providers/strings-context';
export type { Strings } from '@/locales/en';
