import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStrings } from '@/constants/strings';
import { marketingService } from '@/services/marketing.service';
import type { SponsoredCardPublic, SponsoredCampaignPlacement } from '@/types/marketing';

type Props = {
  card: SponsoredCardPublic;
  placement: SponsoredCampaignPlacement;
  preview?: boolean;
  className?: string;
  onVisible?: () => void;
};

export function SponsoredCard({ card, placement, preview, className, onVisible }: Props) {
  const tr = useStrings();
  const rootRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (preview || !onVisible) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          onVisible();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [preview, onVisible]);

  const badge = card.badgeText?.trim() || tr.marketingSponsoredLabel;
  const cta = card.ctaText?.trim() || tr.marketingDefaultCta;
  const badgeIsDefault = !card.badgeText?.trim();

  const handleCtaClick = async (e: React.MouseEvent) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    void marketingService.recordClick(card.id, { placement, platform: 'web' }).catch(() => undefined);
    window.open(card.ctaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      ref={rootRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--color-brand-primary)]/25 bg-gradient-to-br from-[var(--color-m-card)] to-[var(--color-m-card)]/80 p-4 shadow-[var(--shadow-m-card)] ring-1 ring-[var(--color-brand-primary)]/10',
        className
      )}
      aria-label={tr.marketingSponsoredAria}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex max-w-[70%] items-center rounded-full bg-[var(--color-brand-primary)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-brand-primary)]',
            badgeIsDefault ? 'uppercase tracking-wide' : 'normal-case tracking-normal'
          )}
        >
          {badge}
        </span>
        {card.sponsorLabel ? (
          <span className="truncate text-xs text-[var(--color-m-text-muted)]">{card.sponsorLabel}</span>
        ) : null}
      </div>

      <div className="flex gap-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--color-m-hover-overlay)]">
          <img
            src={card.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-m-text)]">{card.title}</h3>
          {card.subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-m-text-secondary)]">
              {card.subtitle}
            </p>
          ) : null}
          {card.description ? (
            <p
              className={cn(
                'mt-1.5 text-xs leading-relaxed text-[var(--color-m-text-muted)]',
                preview ? 'line-clamp-4' : 'line-clamp-2'
              )}
            >
              {card.description}
            </p>
          ) : null}
        </div>
      </div>

      <a
        href={card.ctaUrl}
        onClick={(e) => void handleCtaClick(e)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-m-text)] transition hover:brightness-110"
        {...(preview ? { 'aria-disabled': true, tabIndex: -1 } : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {cta}
        <ExternalLink className="size-4 shrink-0" aria-hidden />
      </a>
    </article>
  );
}
