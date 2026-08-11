import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { useStrings, type Strings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { useAuthStore } from '@/app/store/authStore';
import { fetchMessageThreads, fetchThreadMessages, markMessageRead, sendMessage } from '@/services/messages.service';
import type { MessageThreadSummary, ThreadMessage } from '@/types/messages';
import { cn } from '@/lib/utils';
import { DashboardPanelCard } from '@/features/dashboard/components/DashboardPanelCard';
import { getDateFnsLocale } from '@/lib/date-locale';

function participantLabel(t: MessageThreadSummary, selfId: string, tr: Strings): string {
  const others = t.participants.filter((p) => p.user_id !== selfId);
  if (others.length === 0) return tr.messagesChatFallback;
  const names = others.map((p) => [p.first_name, p.last_name].filter(Boolean).join(' ')).join(', ');
  if (t.thread_type === 'lesson') {
    return `${tr.messagesLessonThreadPrefix} · ${names}`;
  }
  return names;
}

function directReceiverId(t: MessageThreadSummary, selfId: string): string | undefined {
  if (t.thread_type !== 'direct') return undefined;
  const other = t.participants.find((p) => p.user_id !== selfId);
  return other?.user_id;
}

export default function MessagesPlaceholderPage() {
  const tr = useStrings();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const selfId = user?.id ?? '';
  const [searchParams] = useSearchParams();
  const deepLinkThreadId = searchParams.get('threadId');
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkThreadId);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const dateLocale = getDateFnsLocale();

  const threadsQuery = useQuery({
    queryKey: qk.messageThreads,
    queryFn: fetchMessageThreads,
    enabled: Boolean(selfId),
  });

  const messagesQuery = useQuery({
    queryKey: selectedId ? qk.messageThreadMessages(selectedId) : ['messages', 'thread', 'none'],
    queryFn: () => fetchThreadMessages(selectedId!),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (!threadsQuery.data?.length) return;
    if (!selectedId) {
      const target = deepLinkThreadId
        ? threadsQuery.data.find((t) => t.id === deepLinkThreadId)
        : threadsQuery.data[0];
      setSelectedId(target?.id ?? threadsQuery.data[0]?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadsQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!selectedId || !messagesQuery.data?.length || !selfId) return;
    const unread = messagesQuery.data.filter((m) => !m.read_at && m.sender_id !== selfId);
    const latest = unread[unread.length - 1];
    if (!latest?.id) return;
    void markMessageRead(latest.id).then(() => {
      void qc.invalidateQueries({ queryKey: qk.messageThreads });
      void qc.invalidateQueries({ queryKey: qk.messageUnreadTotal });
    });
  }, [selectedId, messagesQuery.data, selfId, qc]);

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async () => {
      setDraft('');
      await qc.invalidateQueries({ queryKey: qk.messageThreads });
      await qc.invalidateQueries({ queryKey: qk.messageUnreadTotal });
      if (selectedId) await qc.invalidateQueries({ queryKey: qk.messageThreadMessages(selectedId) });
    },
  });

  const selectedThread = useMemo(
    () => threadsQuery.data?.find((t) => t.id === selectedId) ?? null,
    [threadsQuery.data, selectedId]
  );

  function handleSend() {
    const text = draft.trim();
    if (!selectedId || !text || sendMutation.isPending) return;
    const receiver_id = selectedThread ? directReceiverId(selectedThread, selfId) : undefined;
    if (selectedThread?.thread_type === 'direct' && !receiver_id) return;
    sendMutation.mutate({
      thread_id: selectedId,
      receiver_id,
      message_type: 'text',
      encrypted_payload: text,
    });
  }

  if (!selfId) {
    return (
      <div>
        <PageHeader title={tr.messages} description="" />
        <p className="text-sm text-[var(--color-text-muted)]">{tr.messagesLoginRequired}</p>
      </div>
    );
  }

  if (threadsQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (threadsQuery.isError || !threadsQuery.data) {
    return (
      <div>
        <PageHeader title={tr.messages} description="" />
        <ErrorState title={tr.messagesLoadError} onRetry={() => void threadsQuery.refetch()} />
      </div>
    );
  }

  const threads = threadsQuery.data;

  return (
    <div>
      <PageHeader title={tr.messages} description={tr.messagesPageDescription} />

      <div className="flex min-h-[60vh] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-80">
        <div className="space-y-2">
          {threads.length === 0 ? (
            <DashboardPanelCard>
              <p className="text-sm text-[var(--color-text-muted)]">{tr.messagesEmptyThreads}</p>
            </DashboardPanelCard>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition',
                  selectedId === t.id
                    ? 'border-[var(--color-brand-primary)]/50 bg-[var(--color-m-primary)]/10'
                    : 'border-[var(--color-m-card-border)] bg-[var(--color-m-card)] hover:bg-[var(--color-m-hover-overlay)]'
                )}
              >
                <p className="font-medium text-[var(--color-m-text)]">{participantLabel(t, selfId, tr)}</p>
                <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-muted)]">
                  {t.last_message_at
                    ? format(new Date(t.last_message_at), 'd MMM HH:mm', { locale: dateLocale })
                    : '—'}
                </p>
                {t.unread_count > 0 ? (
                  <Badge className="mt-2">{t.unread_count}</Badge>
                ) : null}
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="flex min-h-[50vh] min-w-0 flex-1 flex-col rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)]">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--color-text-muted)]">
            {tr.messagesSelectThread}
          </div>
        ) : messagesQuery.isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
          </div>
        ) : messagesQuery.isError ? (
          <div className="p-4">
            <ErrorState title={tr.messagesLoadError} onRetry={() => void messagesQuery.refetch()} />
          </div>
        ) : (
          <>
            <div className="border-b border-[var(--color-m-card-border)] px-4 py-3">
              <p className="font-semibold text-[var(--color-m-text)]">
                {selectedThread ? participantLabel(selectedThread, selfId, tr) : ''}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" style={{ maxHeight: 'min(60vh, 520px)' }}>
              {(messagesQuery.data ?? []).map((m: ThreadMessage) => {
                const mine = m.sender_id === selfId;
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                        mine ? 'bg-[var(--color-m-primary)]/30 text-[var(--color-m-text)]' : 'bg-[var(--color-m-hover-overlay)] text-[var(--color-m-text)]'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.encrypted_payload}</p>
                      <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                        {format(new Date(m.sent_at), 'd MMM HH:mm', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-[var(--color-m-card-border)] p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={tr.messagesWritePlaceholder}
                rows={2}
                className="mb-2"
              />
              <Button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || sendMutation.isPending}
                isLoading={sendMutation.isPending}
              >
                {tr.messagesSend}
              </Button>
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}
