import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { materialsService } from '@/services/materials.service';
import { MaterialTypeBadge } from '@/features/materials/components/MaterialTypeBadge';
import { SubmissionStatusBadge } from '@/features/materials/components/SubmissionStatusBadge';
import { PdfActions } from '@/features/materials/components/PdfActions';
import { PdfFileInput } from '@/features/materials/components/PdfFileInput';
import { isPdfFile } from '@/features/materials/lib/pdf-utils';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

export default function StudentMaterialDetailPage() {
  const tr = useStrings();
  const { materialId = '' } = useParams();
  const roleBase = useRoleBase();
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const materialQ = useQuery({
    queryKey: qk.studentMaterial(materialId),
    queryFn: () => materialsService.getStudentMaterial(materialId),
    enabled: Boolean(materialId),
  });

  const submitMutation = useMutation({
    mutationFn: () => materialsService.submitAssignment(materialId, file!),
    onSuccess: async () => {
      toast.success(tr.materialSubmissionSuccess);
      setFile(null);
      await qc.invalidateQueries({ queryKey: ['materials', 'student'] });
      await qc.invalidateQueries({ queryKey: qk.studentMaterial(materialId) });
    },
    onError: (e: unknown) => {
      setSubmitError((e as { message?: string }).message ?? tr.materialSubmissionFailed);
    },
  });

  const material = materialQ.data;
  const isAssignment = material?.type === 'assignment';
  const submissionStatus = material?.submission?.status ?? 'not_submitted';
  const isPastDue = material?.dueDate ? new Date(material.dueDate).getTime() < Date.now() : false;

  function handleSubmit() {
    if (!file) {
      setSubmitError(tr.materialValidationPdfRequired);
      return;
    }
    if (!isPdfFile(file)) {
      setSubmitError(tr.materialValidationPdfOnly);
      return;
    }
    setSubmitError(null);
    submitMutation.mutate();
  }

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
      <PageHeader title={material.title} description={material.teacherName ?? undefined} />

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <MaterialTypeBadge type={material.type} />
          {material.description ? (
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
          <Card className="space-y-4 p-6">
            <h3 className="text-lg font-semibold text-[var(--color-m-text)]">{tr.materialYourSubmission}</h3>
            <SubmissionStatusBadge status={submissionStatus} />
            {material.submission?.submittedAt ? (
              <p className="text-sm text-[var(--color-m-text-muted)]">
                {tr.materialSubmittedAt}: {format(new Date(material.submission.submittedAt), 'd MMM yyyy HH:mm')}
              </p>
            ) : null}
            {material.submission?.submittedFileUrl ? (
              <PdfActions
                fileUrl={material.submission.submittedFileUrl}
                fileName={material.submission.submittedFileName ?? 'submission.pdf'}
                variant="submitted"
              />
            ) : null}

            {isPastDue ? (
              <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{tr.materialPastDueWarning}</span>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-m-text)]">{tr.materialUploadSubmissionHint}</p>
              <PdfFileInput file={file} onChange={(f) => { setFile(f); setSubmitError(null); }} error={submitError} />
            </div>

            <Button type="button" onClick={handleSubmit} isLoading={submitMutation.isPending} disabled={!file}>
              {submissionStatus && submissionStatus !== 'not_submitted'
                ? tr.reuploadSubmission
                : tr.submitAssignment}
            </Button>
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
