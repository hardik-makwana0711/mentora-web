import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { usePresignedProfilePhotoUrl } from '@/features/profile/hooks/usePresignedProfilePhotoUrl';

/** Resolves private S3 profile URLs via presign GET (same contract as mobile `usePresignedUrl`). */
export function PresignedAvatar({
  storedUrl,
  name,
  className,
}: {
  storedUrl?: string | null;
  name: string;
  className?: string;
}) {
  const { displayUrl, isLoading } = usePresignedProfilePhotoUrl(storedUrl ?? undefined);
  if (isLoading) {
    return <Skeleton className={cn('shrink-0 rounded-full', className ?? 'size-10')} aria-hidden />;
  }
  return <Avatar src={displayUrl} name={name} className={className} />;
}
