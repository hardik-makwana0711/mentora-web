import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { translateNotificationText } from '@/lib/translate-notification';
import { notificationsService, type NotificationRow } from '@/services/notifications.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useAuthStore } from '@/app/store/authStore';
import { cn } from '@/lib/utils';

const ASSIGNMENT_NOTIFICATION_TYPES = new Set([
  'assignment_due_3_days',
  'assignment_due_1_day',
  'assignment_missing_submission',
]);

function resolveThreadId(n: NotificationRow): string | null {
  if (n.thread_id) return n.thread_id;
  if (n.related_entity_type === 'thread' && n.related_entity_id) return n.related_entity_id;
  return null;
}

function isAssignmentNotification(n: NotificationRow): boolean {
  return Boolean(n.type && ASSIGNMENT_NOTIFICATION_TYPES.has(n.type));
}

function isClickableNotification(n: NotificationRow): boolean {
  if (n.type === 'message_notification' || isAssignmentNotification(n)) return true;
  const discoveryTypes = new Set([
    'mentor_contact_request_created',
    'mentor_contact_request_submitted',
    'mentor_contact_request_accepted',
    'mentor_contact_request_rejected',
    'mentor_profile_approved',
    'mentor_profile_rejected',
  ]);
  return Boolean(n.type && discoveryTypes.has(n.type));
}

export default function NotificationsPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const role = useAuthStore((s) => s.user?.role);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsService.list(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  });

  function handleNotificationClick(n: NotificationRow) {
    if (!n.is_read && !n.read) {
      markRead.mutate(n.id);
    }

    if (n.type === 'message_notification') {
      const threadId = resolveThreadId(n);
      if (threadId) {
        navigate(`${roleBase}/messages?threadId=${threadId}`);
      } else {
        navigate(`${roleBase}/messages`);
      }
      return;
    }

    if (isAssignmentNotification(n) && n.related_entity_id) {
      const materialId = n.related_entity_id;
      if (role === 'student') {
        navigate(`${roleBase}/materials/${materialId}`);
      } else if (role === 'mentor') {
        navigate(`${roleBase}/materials/${materialId}`);
      } else if (role === 'parent') {
        navigate(`${roleBase}/materials?materialId=${materialId}`);
      }
      return;
    }

    const discoveryTypes = new Set([
      'mentor_contact_request_created',
      'mentor_contact_request_submitted',
      'mentor_contact_request_accepted',
      'mentor_contact_request_rejected',
      'mentor_profile_approved',
      'mentor_profile_rejected',
      'mentor_photo_approved',
      'mentor_photo_rejected',
      'mentor_video_approved',
      'mentor_video_rejected',
      'mentor_review_approved',
      'mentor_review_rejected',
      'mentor_success_story_approved',
      'mentor_success_story_rejected',
    ]);

    if (n.type && discoveryTypes.has(n.type)) {
      if (n.type === 'mentor_contact_request_created' && role === 'mentor') {
        navigate(`${roleBase}/contact-requests`);
        return;
      }
      if (
        (n.type === 'mentor_contact_request_submitted' ||
          n.type === 'mentor_contact_request_accepted' ||
          n.type === 'mentor_contact_request_rejected') &&
        (role === 'parent' || role === 'student')
      ) {
        navigate(`${roleBase}/my-mentor-requests`);
        return;
      }
      if (
        (n.type === 'mentor_profile_approved' || n.type === 'mentor_profile_rejected') &&
        role === 'mentor'
      ) {
        navigate(`${roleBase}/profile/edit`);
        return;
      }
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-m-primary)]/30 border-t-[var(--color-m-primary)]" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title={tr.notificationsLoadError} onRetry={() => void refetch()} />;
  }

  return (
    <PageContainer>
      <PageHeader
        title={tr.notifications}
        actions={
          <Button type="button" variant="secondary" isLoading={markAll.isPending} onClick={() => markAll.mutate()}>
            {tr.markAllNotificationsRead}
          </Button>
        }
      />
      {!data?.length ? (
        <EmptyState title={tr.notificationsEmpty} />
      ) : (
        <div className="relative">
          <div className="app-scroll-area max-h-[calc(100dvh-240px)] overflow-y-auto pr-2">
            <ul className="flex flex-col gap-3">
              {data.map((n) => {
                const { title, body } = translateNotificationText(n.title, n.body ?? n.message);
                const isRead = n.read || n.is_read;
                const isMessage = n.type === 'message_notification';
                const isAssignment = isAssignmentNotification(n);
                const isClickable = isClickableNotification(n);
                const threadId = resolveThreadId(n);
                return (
                  <li key={n.id}>
                    <Card
                      className={cn(
                        'transition-colors',
                        isRead ? 'opacity-60' : '',
                        isClickable ? 'cursor-pointer hover:border-[var(--color-brand-primary)]/50' : ''
                      )}
                      onClick={isClickable ? () => handleNotificationClick(n) : undefined}
                    >
                      <div className="flex items-start gap-3">
                        {isMessage && (
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/20">
                            <MessageSquare className="size-4 text-[var(--color-brand-primary)]" />
                          </div>
                        )}
                        {isAssignment && (
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                            <BookOpen className="size-4 text-orange-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-[var(--color-m-text)]">{title}</p>
                            {!isRead && (
                              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand-primary)]" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{body}</p>
                          {n.created_at ? (
                            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                              {format(new Date(n.created_at), 'd MMM yyyy HH:mm', {
                                locale: getDateFnsLocale(),
                              })}
                            </p>
                          ) : null}
                          {isMessage && threadId && (
                            <p className="mt-1 text-xs text-[var(--color-brand-primary)]">
                              {tr.notificationOpenThread}
                            </p>
                          )}
                          {isAssignment && (
                            <p className="mt-1 text-xs text-[var(--color-brand-primary)]">
                              {tr.notificationOpenAssignment}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--color-m-bg)] to-transparent" />
        </div>
      )}
    </PageContainer>
  );
}
