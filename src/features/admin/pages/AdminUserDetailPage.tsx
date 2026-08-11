import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
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
import { ReasonModal } from '@/features/admin/components/ReasonModal';
import { ConfirmModal } from '@/features/admin/components/ConfirmModal';
import { ModerationStatusBadge } from '@/features/admin/components/ModerationStatusBadge';
import { formatUserRole } from '@/features/admin/lib/admin-labels';
import { adminService } from '@/services/admin.service';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export default function AdminUserDetailPage() {
  const tr = useStrings();
  const { userId = '' } = useParams();
  const qc = useQueryClient();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const query = useQuery({
    queryKey: qk.adminUser(userId),
    queryFn: () => adminService.getUser(userId),
    enabled: Boolean(userId),
  });

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => adminService.suspendUser(userId, reason),
    onSuccess: async () => {
      toast.success(tr.adminUserSuspended);
      setSuspendOpen(false);
      await qc.invalidateQueries({ queryKey: qk.adminUser(userId) });
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(normAxios(e, tr.adminActionFailed)),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => adminService.reactivateUser(userId),
    onSuccess: async () => {
      toast.success(tr.adminUserReactivated);
      setReactivateOpen(false);
      await qc.invalidateQueries({ queryKey: qk.adminUser(userId) });
      await qc.invalidateQueries({ queryKey: ['admin', 'users'] });
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
    return <ErrorState title={tr.adminUserLoadError} onRetry={() => void query.refetch()} />;
  }

  const user = query.data.user;
  const isSuspended = user.account_status === 'suspended';
  const isAdmin = user.role === 'admin';

  return (
    <PageContainer width="full">
      <BackLink to="/admin/users">{tr.back}</BackLink>
      <PageHeader
        title={`${user.first_name} ${user.last_name}`.trim()}
        description={user.email}
      />

      <Card className="mt-6 p-5">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[var(--color-text-muted)]">{tr.role}</dt>
            <dd className="text-[var(--color-m-text)]">{formatUserRole(user.role)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">{tr.adminColAccountStatus}</dt>
            <dd>
              <ModerationStatusBadge status={user.account_status} kind="account" />
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">{tr.adminColCreated}</dt>
            <dd className="text-[var(--color-m-text)]">{format(new Date(user.created_at), 'PPpp')}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">ID</dt>
            <dd className="break-all text-[var(--color-m-text)]">{user.id}</dd>
          </div>
        </dl>
      </Card>

      {!isAdmin ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {!isSuspended ? (
            <Button type="button" variant="danger" onClick={() => setSuspendOpen(true)}>
              {tr.adminSuspendUser}
            </Button>
          ) : (
            <Button type="button" onClick={() => setReactivateOpen(true)}>
              {tr.adminReactivateUser}
            </Button>
          )}
        </div>
      ) : null}

      <ReasonModal
        open={suspendOpen}
        title={tr.adminSuspendUserTitle}
        confirmLabel={tr.adminSuspendUser}
        loading={suspendMutation.isPending}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => suspendMutation.mutate(reason)}
      />

      <ConfirmModal
        open={reactivateOpen}
        title={tr.adminReactivateUserTitle}
        body={tr.adminReactivateUserBody}
        confirmLabel={tr.adminReactivateUser}
        loading={reactivateMutation.isPending}
        onClose={() => setReactivateOpen(false)}
        onConfirm={() => reactivateMutation.mutate()}
      />
    </PageContainer>
  );
}
