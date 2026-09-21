import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import i18n from '@/i18n';
import {
  contactRequestStatusLabelKey,
  contactRequestStatusVariant,
  contactRequestTypeLabelKey,
} from '@/features/mentor/lib/contact-request-labels';
import type { ContactRequest } from '@/types/contact-requests';

function fmtDate(iso: string | Date): string {
  try {
    return format(new Date(iso), 'PP', { locale: getDateFnsLocale() });
  } catch {
    return '—';
  }
}

export function ContactRequestCard({
  request,
  onViewDetails,
  onAccept,
  onDecline,
  isAccepting,
}: {
  request: ContactRequest;
  onViewDetails: () => void;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
}) {
  const tr = useStrings();
  const isParentSubmitted = Boolean(request.student);
  const primaryName = isParentSubmitted
    ? (request.student!.name ?? '—')
    : (request.requester?.name ?? '—');

  const metaParts = [
    request.subject,
    request.gradeLevel,
    tr[contactRequestTypeLabelKey(request.requestType)],
  ].filter(Boolean);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={primaryName} className="size-11" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-m-text)]">
              {primaryName}
            </p>
            {isParentSubmitted ? (
              <p className="mt-0.5 truncate text-xs text-[var(--color-m-text-muted)]">
                {i18n.t('contactRequestParentLabel', { name: request.requester?.name ?? '—' })}
              </p>
            ) : null}
          </div>
        </div>
        <Badge variant={contactRequestStatusVariant(request.status)} className="shrink-0">
          {tr[contactRequestStatusLabelKey(request.status)]}
        </Badge>
      </div>

      {metaParts.length > 0 ? (
        <p className="mt-3 text-sm text-[var(--color-m-text-secondary)]">{metaParts.join(' · ')}</p>
      ) : null}

      {request.message ? (
        <p className="mt-2 line-clamp-2 text-sm italic text-[var(--color-m-text-muted)]">
          “{request.message}”
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-m-text-muted)]">{fmtDate(request.createdAt)}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onViewDetails}>
            {tr.contactRequestViewDetails}
          </Button>

          {request.status === 'pending' ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onDecline}>
                {tr.rejectRequestBtn}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isAccepting}
                onClick={onAccept}
              >
                {tr.acceptRequest}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
