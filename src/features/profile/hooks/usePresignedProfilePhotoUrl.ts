import { useEffect, useState } from 'react';
import { uploadsService } from '@/services/uploads.service';

/**
 * Same idea as mobile `usePresignedUrl`: private S3 objects need a short-lived GET URL
 * before they can be shown in `<img src>` in the browser.
 */
function shouldPresign(storedUrl: string): boolean {
  const u = storedUrl.trim();
  if (!u) return false;
  if (u.startsWith('data:') || u.startsWith('blob:')) return false;
  if (u.includes('X-Amz-') || u.includes('x-id=GetObject')) return false;
  const isFull = /^https?:\/\//i.test(u);
  if (!isFull) return true;
  return u.includes('common_s3/') || u.includes('profile_photos');
}

export function usePresignedProfilePhotoUrl(storedUrl: string | null | undefined): {
  displayUrl: string | undefined;
  isLoading: boolean;
} {
  const [displayUrl, setDisplayUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const raw = storedUrl?.trim();
    if (!raw) {
      setDisplayUrl(undefined);
      setIsLoading(false);
      return;
    }

    if (!shouldPresign(raw)) {
      setDisplayUrl(raw);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const body = /^https?:\/\//i.test(raw) ? { object_url: raw } : { key: raw.replace(/^\/+/, '') };
        const { view_url } = await uploadsService.presignGet(body);
        if (!cancelled) setDisplayUrl(view_url);
      } catch {
        if (!cancelled) setDisplayUrl(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storedUrl]);

  return { displayUrl, isLoading };
}
