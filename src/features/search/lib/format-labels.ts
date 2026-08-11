const SUBJECT_LABELS: Record<string, string> = {
  mathematics: 'Matematik',
  physics: 'Fizik',
  chemistry: 'Kimya',
  biology: 'Biyoloji',
  english: 'İngilizce',
  french: 'Fransızca',
  history: 'Tarih',
  geography: 'Coğrafya',
  computer_science: 'Bilgisayar',
};

const GRADE_LABELS: Record<string, string> = {
  elementary: 'İlkokul',
  middle_school: 'Ortaokul',
  high_school: 'Lise',
  university: 'Üniversite',
};

export function formatSubject(value: string): string {
  return SUBJECT_LABELS[value] ?? value.replace(/_/g, ' ');
}

export function formatSubjects(values: string[]): string {
  if (!values.length) return '—';
  return values.map(formatSubject).join(', ');
}

export function formatGradeLevel(value: string): string {
  return GRADE_LABELS[value] ?? value.replace(/_/g, ' ');
}

export function formatGradeLevels(values?: string[]): string {
  if (!values?.length) return 'Belirtilmedi';
  return values.map(formatGradeLevel).join(', ');
}

export function formatLessonFormat(value: string): string {
  if (value === 'one_to_one') return '1:1';
  if (value === 'group') return 'Grup';
  return value;
}

export function isVerified(status?: string): boolean {
  return status === 'verified';
}

/** Placeholder when reviews are not implemented yet. */
export function formatRatingDisplay(rating: number | null, reviewCount: number): string {
  if (rating != null && Number.isFinite(rating)) {
    const count = reviewCount > 0 ? ` (${reviewCount})` : '';
    return `${rating.toFixed(1)}★${count}`;
  }
  return '—';
}
