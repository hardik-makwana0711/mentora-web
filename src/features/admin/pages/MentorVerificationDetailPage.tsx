import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function MentorVerificationDetailPage() {
  const tr = useStrings();
  const { mentorId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const query = useQuery({
    queryKey: qk.adminMentorVerification(mentorId),
    queryFn: () => adminService.getMentorVerification(mentorId),
    enabled: Boolean(mentorId),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminService.approveMentorVerification(mentorId),
    onSuccess: async () => {
      toast.success(tr.adminActionApproved);
      await qc.invalidateQueries({ queryKey: qk.adminMentorVerifications });
      navigate('/admin/mentor-verifications');
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => adminService.rejectMentorVerification(mentorId, reason),
    onSuccess: async () => {
      toast.success(tr.adminActionRejected);
      setRejectOpen(false);
      await qc.invalidateQueries({ queryKey: qk.adminMentorVerifications });
      navigate('/admin/mentor-verifications');
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  if (query.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState title={tr.adminVerificationLoadError} onRetry={() => void query.refetch()} />;
  }

  const { mentor, verification, documents } = query.data;
  const ver = verification as Record<string, string>;

  return (
    <PageContainer width="full">
      <BackLink to="/admin/mentor-verifications">{tr.back}</BackLink>
      <PageHeader title={mentor.name} description={mentor.email} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.adminMentorInfo}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">{tr.email}</dt>
              <dd className="text-[var(--color-m-text)]">{mentor.email}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">{tr.adminColSubmitted}</dt>
              <dd className="text-[var(--color-m-text)]">{format(new Date(mentor.created_at), 'PPpp')}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.verificationStatus}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <ModerationStatusBadge status={ver.student_verification_status ?? 'pending'} kind="account" />
            <ModerationStatusBadge status={ver.identity_verification_status ?? 'not_started'} kind="account" />
            <ModerationStatusBadge status={ver.mentor_access_status ?? 'restricted'} kind="account" />
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.adminUploadedDocuments}</h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">{tr.adminNoDocuments}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-surface-border)] p-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-m-text)]">{doc.original_file_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {doc.type} · {format(new Date(doc.uploaded_at), 'PP')}
                  </p>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-brand-primary)] hover:underline"
                >
                  {tr.adminViewDocument}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setApproveOpen(true)} disabled={approveMutation.isPending}>
          {tr.adminApprove}
        </Button>
        <Button type="button" variant="danger" onClick={() => setRejectOpen(true)} disabled={rejectMutation.isPending}>
          {tr.adminReject}
        </Button>
      </div>

      <ConfirmModal
        open={approveOpen}
        title={tr.adminApproveVerificationTitle}
        body={tr.adminApproveVerificationBody}
        confirmLabel={tr.adminApprove}
        loading={approveMutation.isPending}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => approveMutation.mutate()}
      />

      <ReasonModal
        open={rejectOpen}
        title={tr.adminRejectVerificationTitle}
        confirmLabel={tr.adminReject}
        loading={rejectMutation.isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => rejectMutation.mutate(reason)}
      />
    </PageContainer>
  );
}
