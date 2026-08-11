import { Bookmark } from 'lucide-react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { useFavouriteListing } from '@/features/search/hooks/useFavouriteListing';

export function FavouriteListingButton({
  listingId,
  initialIsFavourited,
  className,
  size = 22,
}: {
  listingId: string;
  initialIsFavourited?: boolean;
  className?: string;
  size?: number;
}) {
  const tr = useStrings();
  const { isFavourited, isUpdating, toggleFavourite } = useFavouriteListing(
    listingId,
    initialIsFavourited
  );

  return (
    <button
      type="button"
      aria-label={isFavourited ? tr.removeFromFavourites : tr.addToFavourites}
      disabled={isUpdating}
      onClick={(e) => {
        e.stopPropagation();
        void toggleFavourite().catch(() => undefined);
      }}
      className={cn(
        'rounded-full p-2 text-[var(--color-m-text-muted)] transition hover:bg-[var(--color-m-hover-overlay)] hover:text-[var(--color-m-primary)] disabled:opacity-50',
        className
      )}
    >
      <Bookmark
        style={{ width: size, height: size }}
        className={cn(isFavourited && 'fill-[var(--color-m-primary)] text-[var(--color-m-primary)]')}
        aria-hidden
      />
    </button>
  );
}
