import { Heart } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { useFavouriteMentor } from '@/features/search/hooks/useFavouriteMentor';

export function FavouriteButton({
  mentorId,
  initialIsFavourited,
  className,
  size = 22,
}: {
  mentorId: string;
  initialIsFavourited: boolean;
  className?: string;
  size?: number;
}) {
  const tr = useStrings();
  const { isFavourited, isUpdating, error, toggleFavourite } = useFavouriteMentor(
    mentorId,
    initialIsFavourited
  );

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <button
        type="button"
        aria-label={isFavourited ? tr.favourites : tr.addToFavourites}
        disabled={isUpdating}
        onClick={(e) => {
          e.stopPropagation();
          void toggleFavourite().catch(() => undefined);
        }}
        className="rounded-full p-2 text-[var(--color-m-text-muted)] transition hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-error)] disabled:opacity-50"
      >
        <Heart
          style={{ width: size, height: size }}
          className={cn(isFavourited && 'fill-[var(--color-m-error)] text-[var(--color-m-error)]')}
          aria-hidden
        />
      </button>
      {error ? (
        <span className="mt-1 max-w-[120px] text-center text-xs text-[var(--color-m-error)]">
          {tr.favouriteUpdateError}
        </span>
      ) : null}
    </div>
  );
}
