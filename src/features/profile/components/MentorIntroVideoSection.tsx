import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { mentorMediaService } from '@/services/mentor-media.service';
import type { MentorIntroVideo } from '@/services/mentor-media.service';

function statusVariant(status: MentorIntroVideo['status']): 'success' | 'warning' | 'danger' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

export function MentorIntroVideoSection() {
  const tr = useStrings();
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [editing, setEditing] = useState(false);

  const query = useQuery({
    queryKey: ['mentor-media', 'intro-video'],
    queryFn: () => mentorMediaService.getIntroVideo(),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { url: string }) => mentorMediaService.setIntroVideo(input),
    onSuccess: () => {
      toast.success(tr.introVideoSaveSuccess);
      setEditing(false);
      setUrl('');
      void qc.invalidateQueries({ queryKey: ['mentor-media', 'intro-video'] });
    },
    onError: (e: unknown) => {
      const err = e as { normalizedMessage?: string };
      toast.error(err.normalizedMessage || tr.introVideoSaveFailed);
    },
  });

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      toast.error(tr.introVideoUrlInvalid);
      return;
    }
    saveMutation.mutate({ url: trimmed });
  }

  const video = query.data ?? null;

  return (
    <div className="mt-6 border-t border-[var(--color-m-card-border)] pt-6">
      <h2 className="text-sm font-semibold text-[var(--color-m-text)]">{tr.introVideoTitle}</h2>
      <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">{tr.introVideoHint}</p>

      {query.isPending ? (
        <div className="flex min-h-[8vh] items-center justify-center">
          <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {video && !editing ? (
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-3">
              <PlayCircle
                className="mt-0.5 size-8 shrink-0 text-[var(--color-m-text-muted)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--color-m-text)]">
                    {video.url}
                  </p>
                  <Badge variant={statusVariant(video.status)}>
                    {video.status === 'approved'
                      ? tr.verificationStatusApproved
                      : video.status === 'rejected'
                        ? tr.verificationStatusRejected
                        : tr.verificationStatusPending}
                  </Badge>
                </div>
                {video.rejection_reason ? (
                  <p className="mt-1 text-xs text-[var(--color-m-error)]">
                    {video.rejection_reason}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setUrl(video.url);
                  setEditing(true);
                }}
              >
                {tr.introVideoReplace}
              </Button>
            </div>
          ) : null}

          {!video || editing ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                label={tr.introVideoUrlLabel}
                placeholder={tr.introVideoUrlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mb-0 flex-1"
              />
              <div className="flex gap-2">
                <Button type="button" isLoading={saveMutation.isPending} onClick={handleSave}>
                  {tr.save}
                </Button>
                {editing ? (
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                    {tr.cancel}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
