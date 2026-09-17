import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { ContactRequestCard } from '@/features/mentor/components/contact-requests/ContactRequestCard';
import {
  ContactRequestControls,
  type ContactRequestSort,
} from '@/features/mentor/components/contact-requests/ContactRequestControls';
import { ContactRequestDetailDrawer } from '@/features/mentor/components/contact-requests/ContactRequestDetailDrawer';
import { ContactRequestStatusTabs } from '@/features/mentor/components/contact-requests/ContactRequestStatusTabs';
import { ContactRequestSummaryCards } from '@/features/mentor/components/contact-requests/ContactRequestSummaryCards';
import {
  useMentorContactRequestsCount,
  useMentorContactRequestsList,
} from '@/features/mentor/hooks/useMentorContactRequestsList';
import { contactRequestsService } from '@/services/contact-requests.service';
import { useStrings } from '@/constants/strings';
import type { ContactRequestStatus } from '@/types/contact-requests';

export default function MentorContactRequestsPage() {
  const tr = useStrings();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<'all' | ContactRequestStatus>('all');
  const hasSetInitialTab = useRef(false);
  const pendingCountQuery = useMentorContactRequestsCount('pending');

  useEffect(() => {
    if (hasSetInitialTab.current) return;
    if (pendingCountQuery.data === undefined) return;
    hasSetInitialTab.current = true;
    setActiveTab(pendingCountQuery.data > 0 ? 'pending' : 'all');
  }, [pendingCountQuery.data]);

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [sort, setSort] = useState<ContactRequestSort>('newest');

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);

  const listQuery = useMentorContactRequestsList(activeTab);

  const invalidateAll = () => qc.invalidateQueries({ queryKey: ['contact-requests', 'mentor'] });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => contactRequestsService.accept(id),
    onSuccess: () => {
      toast.success(tr.requestAccepted);
      void invalidateAll();
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      contactRequestsService.reject(id, message),
    onSuccess: () => {
      toast.success(tr.requestRejected);
      setDecliningRequestId(null);
      void invalidateAll();
    },
    onError: () => toast.error(tr.actionFailed),
  });

  const allLoadedItems = useMemo(
    () => listQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [listQuery.data]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = allLoadedItems.filter((r) => {
      if (subject && r.subject !== subject) return false;
      if (grade && r.gradeLevel !== grade) return false;
      if (q) {
        const studentName = r.student?.name ?? r.requester?.name ?? '';
        const parentName = r.student ? (r.requester?.name ?? '') : '';
        const haystack = `${studentName} ${parentName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    items = [...items].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === 'newest' ? -diff : diff;
    });
    return items;
  }, [allLoadedItems, search, subject, grade, sort]);

  const selectedRequest = allLoadedItems.find((r) => r.id === selectedRequestId) ?? null;
  const decliningRequest = allLoadedItems.find((r) => r.id === decliningRequestId) ?? null;

  const isFiltered = Boolean(search.trim() || subject || grade);
  const emptyTitle = isFiltered
    ? tr.contactRequestsEmptyFilteredTitle
    : activeTab === 'pending'
      ? tr.contactRequestsEmptyPendingTitle
      : activeTab === 'all'
        ? tr.contactRequestsEmptyAllTitle
        : tr.contactRequestsEmptyStatusTitle;
  const emptyBody = isFiltered
    ? tr.contactRequestsEmptyFilteredBody
    : activeTab === 'pending'
      ? tr.contactRequestsEmptyPendingBody
      : activeTab === 'all'
        ? tr.contactRequestsEmptyAllBody
        : tr.contactRequestsEmptyStatusBody;

  return (
    <PageContainer>
      <PageHeader title={tr.mentorContactRequests} description={tr.mentorContactRequestsSubtitle} />

      <div className="mt-6 flex flex-col gap-5">
        <ContactRequestSummaryCards />

        <ContactRequestStatusTabs value={activeTab} onChange={setActiveTab} />

        <ContactRequestControls
          items={allLoadedItems}
          search={search}
          onSearchChange={setSearch}
          subject={subject}
          onSubjectChange={setSubject}
          grade={grade}
          onGradeChange={setGrade}
          sort={sort}
          onSortChange={setSort}
        />

        {listQuery.isPending ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
          </div>
        ) : listQuery.isError ? (
          <ErrorState title={tr.loadError} onRetry={() => void listQuery.refetch()} />
        ) : filteredItems.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyBody} />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((request) => (
              <ContactRequestCard
                key={request.id}
                request={request}
                onViewDetails={() => setSelectedRequestId(request.id)}
                onAccept={() => acceptMutation.mutate(request.id)}
                onDecline={() => setDecliningRequestId(request.id)}
                isAccepting={acceptMutation.isPending && acceptMutation.variables === request.id}
              />
            ))}

            {listQuery.hasNextPage ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={listQuery.isFetchingNextPage}
                  onClick={() => void listQuery.fetchNextPage()}
                >
                  {tr.loadMore}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ContactRequestDetailDrawer
        request={selectedRequest}
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequestId(null)}
        onAccept={() => selectedRequest && acceptMutation.mutate(selectedRequest.id)}
        onDecline={() => selectedRequest && setDecliningRequestId(selectedRequest.id)}
        isAccepting={acceptMutation.isPending && acceptMutation.variables === selectedRequest?.id}
      />

      <ReasonModal
        open={Boolean(decliningRequest)}
        title={tr.rejectRequest}
        confirmLabel={tr.rejectRequestBtn}
        onClose={() => setDecliningRequestId(null)}
        onConfirm={(reason) => {
          if (decliningRequest) rejectMutation.mutate({ id: decliningRequest.id, message: reason });
        }}
        loading={rejectMutation.isPending}
      />
    </PageContainer>
  );
}
