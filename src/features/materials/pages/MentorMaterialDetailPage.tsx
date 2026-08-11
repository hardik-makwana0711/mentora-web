import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Archive, Pencil } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { materialsService } from '@/services/materials.service';
import { MaterialTypeBadge } from '@/features/materials/components/MaterialTypeBadge';
import { PdfActions } from '@/features/materials/components/PdfActions';
import { SubmissionStatusTable } from '@/features/materials/components/SubmissionStatusTable';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

export default function MentorMaterialDetailPage() {
  const tr = useStrings();
  const { materialId = '' } = useParams();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const [archiveOpen, setArchiveOpen] = useState(false);

  const materialQ = useQuery({
    queryKey: qk.mentorMaterial(materialId),
    queryFn: () => materialsService.getMentorMaterial(materialId),
    enabled: Boolean(materialId),
  });

  const archiveMutation = useMutation({
    mutationFn: () => materialsService.archiveMentorMaterial(materialId),
    onSuccess: async () => {
      toast.success(tr.materialArchivedSuccess);
      await qc.invalidateQueries({ queryKey: ['materials', 'mentor'] });
      navigate(`${roleBase}/materials`, { replace: true });
    },
    onError: () => toast.error(tr.materialArchiveFailed),
  });

  const material = materialQ.data;
  const isAssignment = material?.type === 'assignment';
  const isActive = (material?.status ?? 'active') === 'active';

  const stats = useMemo(() => {
    const assigned = material?.assignedStudents?.length ?? material?.assignedStudentCount ?? 0;
    const submitted =
      material?.assignedStudents?.filter((s) => s.status && s.status !== 'not_submitted').length ??
      material?.submissionCount ??
      0;
    return { assigned, submitted, missing: Math.max(assigned - submitted, 0) };
  }, [material]);

  if (materialQ.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (materialQ.isError || !material) {
    return <ErrorState title={tr.materialsLoadError} onRetry={() => void materialQ.refetch()} />;
  }

  const metaParts = [
    isAssignment ? tr.materialTypeAssignment : tr.materialTypeCourseResource,
    isAssignment && material.dueDate
      ? `${tr.materialDue} ${format(new Date(material.dueDate), 'd MMM yyyy')}`
      : null,
    isActive ? tr.materialHeaderActive : tr.materialStatusArchived,
  ].filter(Boolean);

  return (
    <PageContainer width="content" className="max-w-7xl">
      <BackLink to={`${roleBase}/materials`}>{tr.materialBackToList}</BackLink>
      <PageHeader
        title={material.title}
        description={metaParts.join(' · ')}
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`${roleBase}/materials/${material.id}/edit`)}
            >
              <Pencil className="mr-2 size-4" />
              {tr.materialEdit}
            </Button>
            {isActive ? (
              <Button type="button" variant="secondary" onClick={() => setArchiveOpen(true)}>
                <Archive className="mr-2 size-4" />
                {tr.materialArchive}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <MaterialTypeBadge type={material.type} />
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? tr.materialHeaderActive : tr.materialStatusArchived}
            </Badge>
          </div>

          {material.description ? (
            <p className="text-sm text-[var(--color-m-text-secondary)]">{material.description}</p>
          ) : null}

          <p className="text-sm text-[var(--color-m-text-muted)]">
            {tr.materialAssignedToCount.replace('{{count}}', String(stats.assigned))}
          </p>

          {isAssignment ? (
            <div className="flex flex-wrap gap-4 text-sm text-[var(--color-m-text-secondary)]">
              <span>
                {tr.materialSubmittedOf
                  .replace('{{submitted}}', String(stats.submitted))
                  .replace('{{total}}', String(stats.assigned))}
              </span>
              <span>{tr.materialMissingLabel.replace('{{count}}', String(stats.missing))}</span>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-m-text-muted)]">{tr.materialNoSubmissionRequired}</p>
          )}

          <PdfActions fileUrl={material.fileUrl} fileName={material.fileName} variant="teacher" />
        </Card>

        {isAssignment ? (
          <SubmissionStatusTable submissions={material.assignedStudents ?? []} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-[var(--color-m-text-secondary)]">
              {tr.materialCourseResourceDetailHint}
            </p>
            {material.createdAt ? (
              <p className="mt-3 text-sm text-[var(--color-m-text-muted)]">
                {tr.materialCreated}: {format(new Date(material.createdAt), 'd MMM yyyy')}
              </p>
            ) : null}
          </Card>
        )}
      </div>

      <Modal
        open={archiveOpen}
        title={tr.materialArchiveConfirmTitle}
        onClose={() => !archiveMutation.isPending && setArchiveOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setArchiveOpen(false)}
              disabled={archiveMutation.isPending}
            >
              {tr.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => archiveMutation.mutate()}
              isLoading={archiveMutation.isPending}
            >
              {tr.materialArchiveConfirmAction}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-m-text-secondary)]">{tr.materialArchiveConfirmBody}</p>
      </Modal>
    </PageContainer>
  );
}
