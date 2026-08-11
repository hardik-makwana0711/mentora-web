import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PhotoCarousel } from '@/features/mentor-discovery/components/PhotoCarousel';
import { discoveryService } from '@/services/discovery.service';
import { qk } from '@/constants/query-keys';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useStrings } from '@/constants/strings';
import type { DiscoveryMentorCard } from '@/types/discovery';

function SavedCard({
  mentor,
  onView,
  onRemove,
  busy,
}: {
  mentor: DiscoveryMentorCard;
  onView: () => void;
  onRemove: () => void;
  busy: boolean;
}) {
  const tr = useStrings();
  const unavailable = mentor.mentor_unavailable;
  const photos = [
    ...(mentor.primary_photo_url ? [mentor.primary_photo_url] : []),
    ...(mentor.additional_photos ?? []),
  ];

  return (
    <article
      className={`rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4 shadow-[var(--shadow-m-card)] ${
        unavailable ? 'opacity-70' : ''
      }`}
    >
      {unavailable ? (
        <p className="mb-3 text-sm text-[var(--color-m-text-muted)]">{tr.savedMentorUnavailable}</p>
      ) : null}
      <div className="flex gap-4">
        <div className="w-28 shrink-0 overflow-hidden rounded-xl">
          <PhotoCarousel photos={photos} alt={mentor.display_name} className="aspect-square" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--color-m-text)]">{mentor.display_name}</h3>
          {mentor.title ? (
            <p className="text-sm text-[var(--color-m-text-secondary)]">{mentor.title}</p>
          ) : null}
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            ⭐ {mentor.rating_average?.toFixed(1) ?? '—'} · {mentor.review_count} {tr.reviews}
          </p>
          {mentor.subjects.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--color-m-text-secondary)]">
              {mentor.subjects.join(' · ')}
            </p>
          ) : null}
          {mentor.teaching_style_tags.length > 0 ? (
            <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
              {mentor.teaching_style_tags.join(' · ')}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={unavailable}
              onClick={onView}
            >
              {tr.viewProfile}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              isLoading={busy}
              onClick={onRemove}
            >
              {tr.removeFromSaved}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SavedMentorsPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.discoverySaved({}),
    queryFn: () => discoveryService.getSaved({ limit: 50 }),
  });

  const removeMutation = useMutation({
    mutationFn: (mentorId: string) => discoveryService.unsaveMentor(mentorId),
    onSuccess: () => {
      toast.success(tr.mentorUnsaved);
      void qc.invalidateQueries({ queryKey: qk.discoverySaved({}) });
    },
    onError: () => toast.error(tr.actionFailed),
  });

  return (
    <PageContainer>
      <BackLink to={`${roleBase}/mentor-discovery`}>{tr.backToDiscovery}</BackLink>
      <PageHeader title={tr.savedMentors} description={tr.savedMentorsSubtitle} />

      {query.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      ) : query.isError ? (
        <ErrorState title={tr.mentorsLoadError} onRetry={() => void query.refetch()} />
      ) : !query.data?.items.length ? (
        <EmptyState
          title={tr.noSavedMentors}
          description={tr.noSavedMentorsHint}
          action={
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate(`${roleBase}/mentor-discovery`)}
            >
              {tr.startDiscovery}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((mentor) => (
            <SavedCard
              key={mentor.mentor_id}
              mentor={mentor}
              busy={removeMutation.isPending}
              onView={() => navigate(`${roleBase}/mentors/${mentor.mentor_id}`)}
              onRemove={() => removeMutation.mutate(mentor.mentor_id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
