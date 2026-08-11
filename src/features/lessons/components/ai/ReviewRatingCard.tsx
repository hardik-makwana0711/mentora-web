import { useStrings } from '@/constants/strings';
import { AiSectionCard } from './AiSectionCard';

/** Post-lesson review/rating — API not available yet; keep states clear for parents. */
export function ReviewRatingCard({ sessionStatus }: { sessionStatus?: string }) {
  const tr = useStrings();
  const planned =
    sessionStatus === 'scheduled' ||
    sessionStatus === 'rescheduled' ||
    sessionStatus === 'in_progress';
  const completed = sessionStatus === 'completed';

  return (
    <AiSectionCard title={completed ? tr.rateLessonTitle : tr.ratingNotAvailable}>
      {planned ? (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.ratingAfterCompleted}</p>
      ) : completed ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-m-text-secondary)]">{tr.rateLessonDescription}</p>
          {/* TODO: Wire parent lesson rating API when available. */}
          <p className="text-sm italic text-[var(--color-m-text-muted)]">{tr.ratingUnavailableApi}</p>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-m-text-muted)]">{tr.ratingAfterCompleted}</p>
      )}
    </AiSectionCard>
  );
}
