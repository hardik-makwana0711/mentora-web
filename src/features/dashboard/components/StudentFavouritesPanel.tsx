import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { TextLink } from '@/components/ui/TextLink';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { formatSubjects } from '@/features/search/lib/format-labels';
import { favouritesService } from '@/services/favourites.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import i18n from '@/i18n';

export function StudentFavouritesPanel({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const { data, isPending, isError } = useQuery({
    queryKey: qk.studentFavouriteMentors(studentId),
    queryFn: () => favouritesService.listStudentMentors(studentId),
    enabled: Boolean(studentId),
    staleTime: 60_000,
  });

  const favourites = data?.favourites ?? [];
  const title = i18n.t('studentFavouritesTitle', { name: studentName });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-m-text)]">
          <Heart className="size-4 text-[#FF6B8A]" aria-hidden />
          {title}
        </h3>
        <TextLink to={`${roleBase}/favourites`}>{tr.navFavorites}</TextLink>
      </div>

      {isPending ? (
        <div className="flex justify-center py-6">
          <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : isError ? (
        <p className="mt-3 text-sm text-[var(--color-m-error)]">{tr.studentFavouritesLoadError}</p>
      ) : favourites.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-m-text-muted)]">{tr.studentFavouritesEmpty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {favourites.slice(0, 3).map((item) => (
            <li key={item.mentor_id}>
              <button
                type="button"
                onClick={() => navigate(`${roleBase}/search/mentors/${item.mentor_id}`)}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[var(--color-m-hover-overlay)]"
              >
                <PresignedAvatar
                  storedUrl={item.avatar_url}
                  name={item.mentor_name}
                  className="size-9 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--color-m-text)]">{item.mentor_name}</span>
                  <span className="block truncate text-xs text-[var(--color-m-text-muted)]">
                    {formatSubjects(item.subjects)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
