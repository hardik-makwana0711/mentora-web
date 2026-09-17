import { useState, type RefObject } from 'react';
import { AlertTriangle, PlayCircle, Play } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useStrings } from '@/constants/strings';
import { ProfileSectionWrapper } from '@/features/mentor-discovery/components/profile/ProfileSectionWrapper';
import type { DiscoveryFullProfile } from '@/types/discovery';

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ProfileVideoSection({
  video,
  sectionRef,
}: {
  video: DiscoveryFullProfile['intro_video'];
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const tr = useStrings();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  if (!video) {
    return (
      <ProfileSectionWrapper id="video" heading={tr.introVideo} sectionRef={sectionRef}>
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] text-center">
          <PlayCircle className="size-10 text-[var(--color-m-text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--color-m-text-muted)]">{tr.profileVideoUnavailable}</p>
        </div>
      </ProfileSectionWrapper>
    );
  }

  const duration = formatDuration(video.duration_seconds);

  return (
    <ProfileSectionWrapper id="video" heading={tr.introVideo} sectionRef={sectionRef}>
      <button
        type="button"
        aria-label={tr.playVideo}
        onClick={() => {
          setState('loading');
          setOpen(true);
        }}
        className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-[var(--color-m-card-border)]"
      >
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={tr.introVideo}
            className="size-full object-cover transition group-hover:brightness-90"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--color-m-surface-light)]">
            <Play className="size-12 text-[var(--color-m-primary)]" />
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:bg-black/75">
            <Play className="ml-1 size-6 fill-white" aria-hidden />
          </span>
        </span>
        {duration ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {duration}
          </span>
        ) : null}
      </button>

      <Modal open={open} title={tr.introVideo} onClose={() => setOpen(false)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {state === 'error' ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-center">
              <AlertTriangle className="size-8 text-[var(--color-brand-accent)]" aria-hidden />
              <p className="text-sm text-[var(--color-m-text-muted)]">{tr.profileVideoError}</p>
            </div>
          ) : (
            <>
              <video
                src={video.url}
                controls
                autoPlay
                preload="metadata"
                className="size-full object-contain"
                onCanPlay={() => setState('ready')}
                onError={() => setState('error')}
              />
              {state === 'loading' ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                  <Spinner className="size-8 border-white/30 border-t-white" />
                  <span className="sr-only">{tr.profileVideoLoading}</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </ProfileSectionWrapper>
  );
}
