import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { FavouriteButton } from '@/features/search/components/FavouriteButton';
import {
  formatGradeLevels,
  formatSubjects,
  isVerified,
} from '@/features/search/lib/format-labels';
import {
  formatExamSubjectsForDisplay,
  formatStructuredSubjectsForCard,
  getUniversityDisplayName,
} from '@/features/education/lib/format-proficiencies';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import type { MentorSearchCard as MentorCardType } from '@/types/search';

export function MentorSearchCard({
  item,
  layout = 'list',
  unavailable = false,
}: {
  item: MentorCardType;
  layout?: 'list' | 'grid';
  unavailable?: boolean;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const isParent = role === 'parent';

  function openProfile() {
    navigate(`${roleBase}/search/mentors/${item.mentor_id}`);
  }

  const structuredSubjects = item.subjects_structured ?? [];
  const structuredExams = item.exam_subjects ?? [];
  const { visible: subjectLines, overflow } = formatStructuredSubjectsForCard(structuredSubjects);
  const examLines = formatExamSubjectsForDisplay(structuredExams);
  const universityDisplay = getUniversityDisplayName(item.university_structured, item.university);

  return (
    <Card
      className={cn(
        'p-5 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-m-ring-subtle)] transition',
        unavailable ? 'opacity-70' : 'cursor-pointer hover:border-[var(--color-m-primary)]/45 hover:shadow-[var(--shadow-m-glow)]',
        layout === 'list' && 'mb-4',
        layout === 'grid' && 'mb-0 flex h-full flex-col'
      )}
      onClick={unavailable ? undefined : openProfile}
    >
      {unavailable ? (
        <p className="mb-3 text-sm text-[var(--color-m-text-muted)]">{tr.savedMentorUnavailable}</p>
      ) : null}
      <div className="flex gap-3">
        <PresignedAvatar storedUrl={item.avatar_url} name={item.mentor_name} className="size-16 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-[var(--color-m-text)]">{item.mentor_name}</h3>
              {isVerified(item.verification_status) ? (
                <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[var(--color-m-primary)]">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  {tr.verifiedMentor}
                </span>
              ) : null}
              <p className="mt-1 line-clamp-1 text-sm italic text-[var(--color-m-text-secondary)]">
                {item.short_bio ||
                  i18n.t('expertIn', { subjects: formatSubjects(item.subjects) })}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" aria-hidden />
                  {item.rating != null && Number.isFinite(item.rating)
                    ? (item.rating as number).toFixed(1)
                    : '—'}
                </span>
                {item.review_count > 0 ? (
                  <span className="text-xs text-[var(--color-m-text-muted)]">
                    ({item.review_count})
                  </span>
                ) : null}
              </div>
            </div>
            <FavouriteButton mentorId={item.mentor_id} initialIsFavourited={item.is_favourited} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-xl bg-[var(--color-m-surface-light)] p-3 text-sm ring-1 ring-[var(--color-m-ring-subtle)]">
        {universityDisplay ? (
          <p className="font-medium text-[var(--color-m-text)]">{universityDisplay}</p>
        ) : null}
        {subjectLines.length > 0 ? (
          <div className={universityDisplay ? 'mt-2' : ''}>
            {subjectLines.map((line) => (
              <p key={line} className="text-[var(--color-m-text-muted)]">
                <span className="text-[var(--color-m-text)]">{line}</span>
              </p>
            ))}
            {overflow > 0 ? (
              <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
                {i18n.t('moreProficiencies', { count: overflow })}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <p className="text-[var(--color-m-text-muted)]">
              <span className="font-semibold">{tr.gradeLabel}:</span>{' '}
              <span className="text-[var(--color-m-text)]">{formatGradeLevels(item.grade_levels)}</span>
            </p>
            <p className="mt-1 text-[var(--color-m-text-muted)]">
              <span className="font-semibold">{tr.servicesLabel}:</span>{' '}
              <span className="text-[var(--color-m-text)]">{formatSubjects(item.subjects)}</span>
            </p>
          </>
        )}
        {examLines.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {examLines.map((name) => (
              <span
                key={name}
                className="rounded-full border border-[var(--color-m-primary)]/30 bg-[var(--color-m-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-m-text)]"
              >
                {name}
              </span>
            ))}
          </div>
        ) : null}
        {!universityDisplay && !subjectLines.length && item.university ? (
          <p className="mt-1 text-[var(--color-m-text-muted)]">
            <span className="font-semibold">{tr.university}:</span>{' '}
            <span className="text-[var(--color-m-text)]">{item.university}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {item.starting_price != null ? (
            <p className="text-lg font-bold text-[var(--color-m-text)]">
              ${item.starting_price}
              <span className="text-xs font-medium text-[var(--color-m-text-muted)]">/saat</span>
            </p>
          ) : (
            <p className="text-xs italic text-[var(--color-m-text-muted)]">{tr.priceDuringBooking}</p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          disabled={unavailable}
          onClick={(e) => {
            e.stopPropagation();
            if (!unavailable) openProfile();
          }}
        >
          {isParent ? tr.viewServices : tr.viewMentor}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </Card>
  );
}
