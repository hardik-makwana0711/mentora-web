import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { materialsService } from '@/services/materials.service';
import { profileService } from '@/services/profile.service';
import { MaterialTypeBadge } from '@/features/materials/components/MaterialTypeBadge';
import { SubmissionStatusBadge } from '@/features/materials/components/SubmissionStatusBadge';
import { PdfActions } from '@/features/materials/components/PdfActions';
import { resolveParentDisplayStatus } from '@/features/materials/lib/parent-assignment-status';
import { useAuthStore } from '@/app/store/authStore';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

export default function ParentMaterialDetailPage() {
  const tr = useStrings();
  const user = useAuthStore((s) => s.user);
  const { studentId = '', materialId = '' } = useParams();
  const roleBase = useRoleBase();

  const profileQ = useQuery({
    queryKey: user?.id ? qk.profile(user.id) : ['profile', 'none'],
    queryFn: () => profileService.getMe(),
    enabled: Boolean(user?.id),
  });

  const childName =
    profileQ.data?.parent_profile?.linked_students?.find((s) => s.id === studentId)?.name ?? null;

  const materialQ = useQuery({
    queryKey: qk.parentMaterial(studentId, materialId),
    queryFn: () => materialsService.getParentMaterial(studentId, materialId),
    enabled: Boolean(studentId && materialId),
  });

  const material = materialQ.data;
  const isAssignment = material?.type === 'assignment';
  const submissionStatus = material?.submissionStatus ?? material?.submission?.status ?? 'not_submitted';
  const parentStatus = resolveParentDisplayStatus(submissionStatus, material?.dueDate ?? null);

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

  return (
    <PageContainer width="content">
      <BackLink to={`${roleBase}/materials`}>{tr.materialBackToList}</BackLink>
      <PageHeader
        title={material.title}
        description={
          [childName, material.teacherName].filter(Boolean).join(' · ') || undefined
        }
      />

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <MaterialTypeBadge type={material.type} />
          {childName ? (
            <p className="text-sm text-[var(--color-m-text-secondary)]">{childName}</p>
          ) : null}
          {material.teacherName ? (
            <p className="text-sm text-[var(--color-m-text-muted)]">{material.teacherName}</p>
          ) : null}          {material.description ? (
            <p className="text-sm text-[var(--color-m-text-secondary)]">{material.description}</p>
          ) : null}
          {isAssignment && material.dueDate ? (
            <p className="text-sm text-[var(--color-m-text-muted)]">
              {tr.materialDue}: {format(new Date(material.dueDate), 'd MMM yyyy')}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-m-text-muted)]">{tr.materialCourseResourceDetailHint}</p>
          )}
          <PdfActions fileUrl={material.fileUrl} fileName={material.fileName} />
        </Card>

        {isAssignment ? (
          <Card className="space-y-3 p-6">
            <h3 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.materialSubmissionStatus}</h3>
            <SubmissionStatusBadge status={parentStatus} />
            {material.submittedAt || material.submission?.submittedAt ? (
              <p className="text-sm text-[var(--color-m-text-muted)]">
                {tr.materialSubmittedAt}:{' '}
                {format(
                  new Date(material.submittedAt ?? material.submission?.submittedAt ?? ''),
                  'd MMM yyyy HH:mm'
                )}
              </p>
            ) : (
              <p className="text-sm text-[var(--color-m-text-muted)]">{tr.materialNoSubmissionYet}</p>
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-sm text-[var(--color-m-text-secondary)]">{tr.materialCourseResourceDetailHint}</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
