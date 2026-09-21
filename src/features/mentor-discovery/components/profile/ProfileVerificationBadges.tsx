import { BadgeCheck } from 'lucide-react';
import { verificationBadgeLabel } from '@/features/mentor-discovery/lib/mentor-profile-format';

export function ProfileVerificationBadges({ rawBadges }: { rawBadges: string[] }) {
  if (rawBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {rawBadges.map((raw) => (
        <span
          key={raw}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-m-success)]/30 bg-[var(--color-m-success)]/10 px-3 py-1 text-sm font-medium text-[var(--color-m-success)]"
        >
          <BadgeCheck className="size-3.5" aria-hidden />
          {verificationBadgeLabel(raw)}
        </span>
      ))}
    </div>
  );
}
