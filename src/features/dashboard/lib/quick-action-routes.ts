/**
 * Map mobile-style `target_route` from dashboard `quick_actions` to web app paths under `roleBase`.
 */
export function webPathForQuickAction(roleBase: string, targetRoute: string): string {
  const t = targetRoute.startsWith('/') ? targetRoute : `/${targetRoute}`;
  const base = roleBase.replace(/\/$/, '');
  const map: Record<string, string> = {
    '/wallet': `${base}/wallet`,
    '/lessons': `${base}/lessons`,
    '/messages': `${base}/messages`,
    '/search': `${base}/search`,
    '/sessions/join': `${base}/lessons`,
    '/availability': `${base}/availability`,
    '/earnings': `${base}/earnings`,
    '/listings': `${base}/listings`,
  };
  return map[t] ?? `${base}/dashboard`;
}
