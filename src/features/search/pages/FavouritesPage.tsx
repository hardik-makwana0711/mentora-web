import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Bookmark } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MentorSearchCard } from '@/features/search/components/MentorSearchCard';
import { useFavouriteMentorSearchCards } from '@/features/search/hooks/useFavouriteMentorSearchCards';
import { favouritesService } from '@/services/favourites.service';
import { profileService } from '@/services/profile.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { formatSubject } from '@/features/search/lib/format-labels';
import { cn } from '@/lib/utils';
import i18n from '@/i18n';
import type { FavouriteListingSummary } from '@/types/search';

type FavouritesTab = 'mentors' | 'listings';

export default function FavouritesPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.role);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<FavouritesTab>('mentors');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { entries, isPending: mentorsPending, isError: mentorsError, refetch: refetchMentors } =
    useFavouriteMentorSearchCards();

  const listingsQuery = useQuery({
    queryKey: qk.favouriteListings,
    queryFn: () => favouritesService.listListings(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const profileQuery = useQuery({
    queryKey: [...qk.profileScope, 'parent-linked'],
    queryFn: () => profileService.getMe(),
    enabled: role === 'parent',
  });

  const linkedStudents = profileQuery.data?.parent_profile?.linked_students ?? [];
  const linkedStudent = useMemo(() => {
    if (role !== 'parent' || linkedStudents.length === 0) return null;
    return linkedStudents.find((s) => s.id === selectedStudentId) ?? linkedStudents[0] ?? null;
  }, [linkedStudents, role, selectedStudentId]);

  useEffect(() => {
    if (role === 'parent' && linkedStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(linkedStudents[0]!.id);
    }
  }, [linkedStudents, role, selectedStudentId]);

  const studentFavouritesQuery = useQuery({
    queryKey: linkedStudent?.id ? qk.studentFavouriteMentors(linkedStudent.id) : ['favourites', 'student', 'none'],
    queryFn: () => favouritesService.listStudentMentors(linkedStudent!.id),
    enabled: role === 'parent' && Boolean(linkedStudent?.id),
    staleTime: 60_000,
  });

  const removeListingMutation = useMutation({
    mutationFn: (listingId: string) => favouritesService.removeListing(listingId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.favouriteListings });
    },
  });

  const isPending =
    activeTab === 'mentors'
      ? mentorsPending
      : listingsQuery.isPending || (role === 'parent' && profileQuery.isPending);

  const isError = activeTab === 'mentors' ? mentorsError : listingsQuery.isError;

  function refetchAll() {
    void refetchMentors();
    void listingsQuery.refetch();
    if (linkedStudent?.id) void studentFavouritesQuery.refetch();
  }

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title={tr.errorTitle} onRetry={refetchAll} />;
  }

  return (
    <PageContainer>
      <PageHeader title={tr.favourites} />

      <div className="mb-4 flex gap-2 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-1">
        <TabButton active={activeTab === 'mentors'} onClick={() => setActiveTab('mentors')}>
          {tr.favouritesTabMentors}
        </TabButton>
        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')}>
          {tr.favouritesTabListings}
        </TabButton>
      </div>

      {activeTab === 'mentors' ? (
        <>
          {entries.length === 0 ? (
            <EmptyState title={tr.favouritesEmpty} />
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li key={entry.card.mentor_id}>
                  <MentorSearchCard item={entry.card} layout="list" unavailable={entry.unavailable} />
                </li>
              ))}
            </ul>
          )}

          {role === 'parent' && linkedStudents.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.studentFavouriteMentors}</h2>
              {linkedStudents.length > 1 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {linkedStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition',
                        linkedStudent?.id === student.id
                          ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)]/15 text-[var(--color-m-text)]'
                          : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)]'
                      )}
                    >
                      {student.name}
                    </button>
                  ))}
                </div>
              ) : null}
              {studentFavouritesQuery.isPending ? (
                <div className="flex justify-center py-6">
                  <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
                </div>
              ) : studentFavouritesQuery.isError ? (
                <p className="text-sm text-[var(--color-m-error)]">{tr.studentFavouritesLoadError}</p>
              ) : (studentFavouritesQuery.data?.favourites.length ?? 0) === 0 ? (
                <p className="text-sm text-[var(--color-m-text-muted)]">{tr.studentFavouritesEmpty}</p>
              ) : (
                <ul className="space-y-2">
                  {studentFavouritesQuery.data!.favourites.map((item) => (
                    <li key={item.mentor_id}>
                      <button
                        type="button"
                        onClick={() => navigate(`${roleBase}/search/mentors/${item.mentor_id}`)}
                        className="flex w-full items-center justify-between rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] px-4 py-3 text-left transition hover:border-[var(--color-m-primary)]/40"
                      >
                        <span className="font-medium text-[var(--color-m-text)]">{item.mentor_name}</span>
                        <span className="text-xs text-[var(--color-m-text-muted)]">{tr.viewMentor}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      ) : listingsQuery.data?.length ? (
        <ul className="space-y-3">
          {listingsQuery.data.map((item) => (
            <li key={item.listing_id}>
              <FavouriteListingCard
                item={item}
                removing={removeListingMutation.isPending}
                onRemove={() => removeListingMutation.mutate(item.listing_id)}
                onView={() =>
                  navigate(`${roleBase}/search/listings/${item.listing_id}`, {
                    state: {
                      mentorId: item.mentor?.id ?? item.mentor_id,
                      mentorName: item.mentor?.name,
                    },
                  })
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={tr.noSavedListings} description={tr.savedListingsHint} />
      )}
    </PageContainer>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-[var(--color-m-primary)] text-[var(--color-m-text)]'
          : 'text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
      )}
    >
      {children}
    </button>
  );
}

function FavouriteListingCard({
  item,
  onRemove,
  onView,
  removing,
}: {
  item: FavouriteListingSummary;
  onRemove: () => void;
  onView: () => void;
  removing: boolean;
}) {
  const tr = useStrings();
  const mentorId = item.mentor?.id ?? item.mentor_id;
  const mentorName = item.mentor?.name;
  const displaySubject = formatSubject(item.subject);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bookmark className="size-4 shrink-0 text-[var(--color-m-primary)]" aria-hidden />
            <h3 className="truncate font-semibold text-[var(--color-m-text)]">{displaySubject}</h3>
          </div>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            {mentorName ? i18n.t('byMentor', { name: mentorName }) : tr.savedLessonListing}
          </p>
          {item.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--color-m-text-secondary)]">
              {item.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="shrink-0 text-[var(--color-m-error)]"
          aria-label={tr.removeFromFavourites}
        >
          <Heart className="size-5 fill-current" aria-hidden />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onRemove} disabled={removing}>
          {tr.remove}
        </Button>
        {mentorId ? (
          <Button type="button" size="sm" onClick={onView}>
            {tr.viewListing}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
