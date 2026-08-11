const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const;

export function choiceLabel(index: number): string {
  return CHOICE_LABELS[index] ?? String(index + 1);
}

export function formatTimeLimit(minutes: number | null | undefined): string {
  if (minutes == null) return 'No time limit';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
}

export function formatQuestionCount(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

export const QUESTION_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10] as const;

const SESSION_QUIZ_ID_PREFIX = 'mentora:ai-quiz-id:';

export function storeAiQuizIdForSession(sessionId: string, quizId: string): void {
  try {
    sessionStorage.setItem(`${SESSION_QUIZ_ID_PREFIX}${sessionId}`, quizId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readAiQuizIdForSession(sessionId: string): string | null {
  try {
    return sessionStorage.getItem(`${SESSION_QUIZ_ID_PREFIX}${sessionId}`);
  } catch {
    return null;
  }
}

export const TIME_LIMIT_OPTIONS = [
  { value: 'none', label: 'No Time Limit', minutes: null },
  { value: '5', label: '5 Minutes', minutes: 5 },
  { value: '10', label: '10 Minutes', minutes: 10 },
  { value: '15', label: '15 Minutes', minutes: 15 },
  { value: '20', label: '20 Minutes', minutes: 20 },
  { value: '30', label: '30 Minutes', minutes: 30 },
] as const;

export function timeLimitMinutesFromValue(value: string): number | null {
  const found = TIME_LIMIT_OPTIONS.find((o) => o.value === value);
  return found?.minutes ?? null;
}
