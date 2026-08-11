import { useRef, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { profileService } from '@/services/profile.service';
import { qk } from '@/constants/query-keys';
import { useAuthStore } from '@/app/store/authStore';
import { PresignedAvatar } from '@/features/profile/components/PresignedAvatar';
import { useStrings } from '@/constants/strings';
import type { ProfileResponse } from '@/types/profile';

export function ProfilePhotoPicker({ photoUrl, displayName }: { photoUrl: string | null; displayName: string }) {
  const tr = useStrings();
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const mutation = useMutation({
    mutationFn: (file: File) => profileService.uploadPhoto(file),
    onSuccess: async (uploaded) => {
      if (userId) {
        qc.setQueryData<ProfileResponse | undefined>(qk.profile(userId), (old) => {
          if (!old) return old;
          return {
            ...old,
            common_profile: {
              ...old.common_profile,
              profile_photo_url: uploaded.profile_photo_url,
            },
          };
        });
      }
      const current = useAuthStore.getState().user;
      if (current) {
        useAuthStore.getState().setUser({
          ...current,
          avatar_url: uploaded.profile_photo_url,
        });
      }
      toast.success(tr.photoUploadOk);
      if (userId) await qc.refetchQueries({ queryKey: qk.profile(userId) });
    },
    onError: () => toast.error(tr.photoUploadFailed),
  });

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(tr.photoUploadFailed);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(tr.photoTooLarge);
      return;
    }
    mutation.mutate(file);
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-3 border-b border-[var(--color-m-card-border)] pb-6">
      <PresignedAvatar key={photoUrl ?? 'none'} storedUrl={photoUrl} name={displayName} className="size-24 text-2xl" />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onPick}
      />
      <Button type="button" variant="secondary" size="sm" isLoading={mutation.isPending} onClick={() => inputRef.current?.click()}>
        {tr.changePhoto}
      </Button>
      <p className="text-center text-xs text-[var(--color-m-text-muted)]">{tr.profilePhotoHint}</p>
    </div>
  );
}
