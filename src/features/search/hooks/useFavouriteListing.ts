import { useCallback, useEffect, useState } from 'react';
import { favouritesService } from '@/services/favourites.service';

export function useFavouriteListing(listingId: string, initialIsFavourited?: boolean) {
  const [isFavourited, setIsFavourited] = useState(initialIsFavourited ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (initialIsFavourited !== undefined) {
      setIsFavourited(initialIsFavourited);
      return;
    }
    if (!listingId) return;
    void favouritesService
      .listListings()
      .then((listings) => setIsFavourited(listings.some((l) => l.listing_id === listingId)))
      .catch(() => undefined);
  }, [initialIsFavourited, listingId]);

  const toggleFavourite = useCallback(async () => {
    if (isUpdating || !listingId) return;
    const previous = isFavourited;
    setIsFavourited(!previous);
    setIsUpdating(true);
    try {
      if (previous) await favouritesService.removeListing(listingId);
      else await favouritesService.addListing(listingId);
    } catch (err) {
      setIsFavourited(previous);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [isFavourited, isUpdating, listingId]);

  return { isFavourited, isUpdating, toggleFavourite };
}
