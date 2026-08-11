/** Session statuses that may show Google Meet join UI (per backend join window rules). */
const MEET_UI_STATUSES = new Set(['scheduled', 'rescheduled', 'in_progress']);

export function isActiveSessionForMeet(status: string | undefined): boolean {
  if (!status) return true;
  return MEET_UI_STATUSES.has(status);
}
