import { GraduationCap, Laptop, MapPin, Users } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import type { DiscoveryFullProfile } from '@/types/discovery';

/**
 * Only surfaces highlights the API actually provides (teaching formats, exam-prep
 * flag). Years of experience, languages, completed-lesson count, and response
 * time aren't returned by this endpoint — showing them would mean fabricating
 * data, so they're intentionally left out rather than hardcoded.
 */
export function ProfileQuickHighlights({ profile }: { profile: DiscoveryFullProfile }) {
  const tr = useStrings();

  const items: { key: string; icon: typeof Laptop; label: string }[] = [];
  if (profile.teaching_formats.includes('online')) {
    items.push({ key: 'online', icon: Laptop, label: tr.profileHighlightOnlineLessons });
  }
  if (profile.teaching_formats.includes('hybrid')) {
    items.push({ key: 'hybrid', icon: Users, label: tr.profileHighlightHybridLessons });
  }
  if (profile.teaching_formats.includes('in_person')) {
    items.push({ key: 'in_person', icon: MapPin, label: tr.profileHighlightInPersonLessons });
  }
  if (profile.exam_types.length > 0) {
    items.push({ key: 'exam_prep', icon: GraduationCap, label: tr.profileHighlightExamPrep });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ key, icon: Icon, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-3 py-1.5 text-sm text-[var(--color-m-text-secondary)]"
        >
          <Icon className="size-4 text-[var(--color-m-primary)]" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
