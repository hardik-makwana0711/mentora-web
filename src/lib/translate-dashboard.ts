import i18n from '@/i18n';

const QUICK_ACTION_KEYS: Record<string, string> = {
  'a1000000-0000-4000-8000-000000000001': 'quickActionJoinLesson',
  'a1000000-0000-4000-8000-000000000002': 'quickActionMyLessons',
  'a1000000-0000-4000-8000-000000000003': 'quickActionMessages',
  'b2000000-0000-4000-8000-000000000001': 'quickActionFindMentor',
  'b2000000-0000-4000-8000-000000000002': 'quickActionWallet',
  'b2000000-0000-4000-8000-000000000003': 'quickActionChildProgress',
  'c3000000-0000-4000-8000-000000000001': 'quickActionMyLessons',
  'c3000000-0000-4000-8000-000000000002': 'quickActionAvailability',
  'c3000000-0000-4000-8000-000000000003': 'quickActionEarnings',
  'c3000000-0000-4000-8000-000000000004': 'quickActionListings',
};

/** Backend sends English `welcome_message`; build a localized greeting from the user's name. */
export function translateWelcomeMessage(apiMessage: string | undefined, displayName: string): string {
  const name = displayName.trim() || i18n.t('userDisplayFallback');
  const welcomeMatch = /^Welcome back,?\s+(.+?)!?\s*$/i.exec(apiMessage?.trim() ?? '');
  const resolvedName = welcomeMatch?.[1]?.trim() || name;
  return i18n.t('welcomeBackGreeting', { name: resolvedName });
}

export function translateQuickActionLabel(actionId: string, fallback: string): string {
  const key = QUICK_ACTION_KEYS[actionId];
  return key ? i18n.t(key) : fallback;
}
