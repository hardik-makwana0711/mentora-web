import { useEffect } from 'react';

/** Refetch dashboard / session lists when the tab becomes visible again. */
export function useRefetchOnVisible(refetch: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [refetch]);
}
