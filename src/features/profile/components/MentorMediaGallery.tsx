import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star, Trash2, Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { mentorMediaService } from '@/services/mentor-media.service';

const MAX_PHOTOS = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function MentorMediaGallery() {
  const tr = useStrings();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = useQuery({
    queryKey: ['mentor-media', 'photos'],
    queryFn: () => mentorMediaService.listPhotos(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mentorMediaService.uploadPhoto(file),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mentor-media', 'photos'] }),
    onError: () => toast.error(tr.mentorMediaUploadFailed),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => mentorMediaService.deletePhoto(photoId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['mentor-media', 'photos'] }),
    onError: () => toast.error(tr.mentorMediaDeleteFailed),
  });

  const photos = query.data ?? [];

  function handleFileSelected(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(tr.mentorMediaUploadFailed);
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      toast.error(tr.mentorMediaMaxReached);
      return;
    }
    uploadMutation.mutate(file);
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--color-m-text)]">
        {tr.mentorMediaGalleryTitle}
      </h2>
      <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{tr.mentorMediaGalleryHint}</p>

      {query.isPending ? (
        <div className="flex min-h-[10vh] items-center justify-center">
          <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-m-card-border)]"
            >
              <img
                src={photo.thumbnail_url ?? photo.url}
                alt=""
                className="size-full object-cover"
              />
              {photo.is_primary ? (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-m-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="size-3 fill-current" aria-hidden />
                  {tr.mentorMediaPrimaryBadge}
                </span>
              ) : null}
              <button
                type="button"
                aria-label={tr.mentorMediaDelete}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(photo.id)}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)] transition hover:border-[var(--color-m-primary)]/40"
            >
              {uploadMutation.isPending ? (
                <Spinner className="size-5" />
              ) : (
                <>
                  <Upload className="size-5" aria-hidden />
                  <span className="text-xs">{tr.mentorMediaUpload}</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />
    </div>
  );
}
