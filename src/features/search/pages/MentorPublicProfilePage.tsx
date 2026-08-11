import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { MentorProfileHeader } from '@/features/search/components/MentorProfileHeader';
import { PublicListingCard } from '@/features/search/components/PublicListingCard';
import { MentorEducationSections } from '@/features/education/components/MentorEducationSections';
import { useMentorPublicProfile } from '@/features/search/hooks/useMentorPublicProfile';
import { isHttpNotFound } from '@/lib/http-errors';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';

export default function MentorPublicProfilePage() {
  const tr = useStrings();
  const { mentorId = '' } = useParams();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);

  const { data, isPending, isError, error, refetch } = useMentorPublicProfile(mentorId);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        <span className="sr-only">{tr.loading}</span>
      </div>
    );
  }

  if (isError || !data) {
    if (isHttpNotFound(error)) {
      return <EmptyState title={tr.mentorUnavailable} />;
    }
    return <ErrorState title={tr.mentorProfileLoadError} onRetry={() => void refetch()} />;
  }

  const canBook = data.viewer_permissions.can_book;
  const isStudent = role === 'student';

  return (
    <PageContainer>
      <BackLink to={`${roleBase}/search`}>{tr.back}</BackLink>

      <MentorProfileHeader
        mentor={data.mentor}
        isFavourited={data.mentor.is_favourited ?? false}
      />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.aboutMentor}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
          {data.mentor.bio || tr.notProvided}
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
        <MentorEducationSections
          primaryUniversity={data.mentor.primary_university}
          legacyUniversity={data.mentor.university}
          subjectProficiencies={data.mentor.subject_proficiencies}
          examProficiencies={data.mentor.exam_proficiencies}
        />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.services}</h2>
          <Badge>
            {data.listings.length} {tr.activeListings}
          </Badge>
        </div>

        {data.listings.length === 0 ? (
          <EmptyState title={tr.noActiveServices} />
        ) : (
          data.listings.map((listing) => (
            <PublicListingCard
              key={listing.id}
              listing={listing}
              mentorId={data.mentor.id}
              mentorName={data.mentor.name}
              canBook={canBook}
            />
          ))
        )}
      </section>

      {isStudent ? (
        <div className="mt-6 flex gap-3 rounded-xl border border-[var(--color-m-primary)]/30 bg-[var(--color-m-primary)]/10 p-4 text-sm text-[var(--color-m-text-secondary)]">
          <Info className="size-5 shrink-0 text-[var(--color-m-primary)]" aria-hidden />
          <p>{data.viewer_permissions.reason ?? tr.studentBookingNote}</p>
        </div>
      ) : null}
    </PageContainer>
  );
}
