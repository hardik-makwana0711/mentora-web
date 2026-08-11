import { useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';

export function PhotoCarousel({
  photos,
  alt,
  className,
  variant = 'card',
}: {
  photos: string[];
  alt: string;
  className?: string;
  variant?: 'card' | 'panel';
}) {
  const tr = useStrings();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const hasMultiple = photos.length > 1;
  const current = photos[index];
  const isPanel = variant === 'panel';

  const frameClass = cn(
    isPanel
      ? 'aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[400px]'
      : 'aspect-[4/5] max-h-72 w-full',
    'overflow-hidden bg-[var(--color-m-surface-light)]',
    isPanel ? 'lg:rounded-l-2xl' : 'rounded-t-3xl',
    className
  );

  if (photos.length === 0 || error) {
    return (
      <div
        className={cn(
          frameClass,
          'flex items-center justify-center bg-gradient-to-br from-[var(--color-m-surface-light)] to-[var(--color-m-card)]'
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex size-24 items-center justify-center rounded-full bg-[var(--color-m-hover-overlay)] ring-1 ring-[var(--color-m-ring-subtle)]">
          <User className="size-12 text-[var(--color-m-text-muted)]" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(frameClass, 'relative bg-black/20')}>
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-[var(--color-m-surface-light)]" /> : null}
      <img
        src={current}
        alt={hasMultiple ? `${alt} — photo ${index + 1} of ${photos.length}` : alt}
        className="size-full object-cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {isPanel ? (
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-[var(--color-m-card)]/80 lg:block" />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-m-card)] to-transparent" />
      )}
      {hasMultiple ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => Math.max(0, i - 1));
              setLoaded(false);
            }}
            disabled={index === 0}
            aria-label={tr.photoPrevious}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => Math.min(photos.length - 1, i + 1));
              setLoaded(false);
            }}
            disabled={index === photos.length - 1}
            aria-label={tr.photoNext}
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 top-3 flex justify-center gap-1.5" aria-hidden>
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 rounded-full bg-white transition-all',
                  i === index ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
