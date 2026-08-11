import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { useStrings } from '@/constants/strings';
import { qk } from '@/constants/query-keys';
import { cn } from '@/lib/utils';
import { AssignedStudentsPicker } from '@/features/materials/components/AssignedStudentsPicker';
import { useMentorStudents } from '@/features/materials/hooks/useMentorStudents';
import { toDueDateIso, validateMaterialForm } from '@/features/materials/lib/material-validation';
import { materialsService, type MaterialStatus } from '@/services/materials.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

export default function EditMaterialPage() {
  const tr = useStrings();
  const { materialId = '' } = useParams();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const { students, isLoading: studentsLoading } = useMentorStudents();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [originalDueDate, setOriginalDueDate] = useState('');
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [status, setStatus] = useState<MaterialStatus>('active');
  const [materialType, setMaterialType] = useState<'assignment' | 'course_resource'>('assignment');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDueDateOpen, setConfirmDueDateOpen] = useState(false);

  const materialQ = useQuery({
    queryKey: qk.mentorMaterial(materialId),
    queryFn: () => materialsService.getMentorMaterial(materialId),
    enabled: Boolean(materialId),
  });

  useEffect(() => {
    const material = materialQ.data;
    if (!material) return;
    setTitle(material.title);
    setDescription(material.description ?? '');
    setMaterialType(material.type);
    const due = material.dueDate ? material.dueDate.slice(0, 10) : '';
    setDueDate(due);
    setOriginalDueDate(due);
    setAssignedStudentIds(
      material.assignedStudentIds ??
        material.assignedStudents?.map((s) => s.studentId) ??
        []
    );
    setStatus(material.status ?? 'active');
  }, [materialQ.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      materialsService.updateMentorMaterial(materialId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: materialType === 'assignment' && dueDate ? toDueDateIso(dueDate) : null,
        assignedStudentIds,
        status,
      }),
    onSuccess: async () => {
      toast.success(tr.materialUpdatedSuccess);
      await qc.invalidateQueries({ queryKey: ['materials', 'mentor'] });
      navigate(`${roleBase}/materials/${materialId}`, { replace: true });
    },
    onError: (e: unknown) => {
      setFormError((e as { message?: string }).message ?? tr.materialUpdateFailed);
    },
  });

  function persist() {
    const errorKey = validateMaterialForm({
      title,
      type: materialType,
      dueDate,
      assignedStudentIds,
      isEditing: true,
    });
    if (errorKey) {
      const messages: Record<string, string> = {
        materialValidationTitleRequired: tr.materialValidationTitleRequired,
        materialValidationTypeRequired: tr.materialValidationTypeRequired,
        materialValidationStudentsRequired: tr.materialValidationStudentsRequired,
        materialValidationDueDateRequired: tr.materialValidationDueDateRequired,
      };
      setFormError(messages[errorKey] ?? tr.materialValidationTitleRequired);
      return;
    }
    setFormError(null);
    updateMutation.mutate();
  }

  function handleSubmit() {
    if (materialType === 'assignment' && dueDate && dueDate !== originalDueDate) {
      setConfirmDueDateOpen(true);
      return;
    }
    persist();
  }

  if (materialQ.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (materialQ.isError || !materialQ.data) {
    return <ErrorState title={tr.materialsLoadError} onRetry={() => void materialQ.refetch()} />;
  }

  return (
    <PageContainer width="content" className="max-w-6xl">
      <BackLink to={`${roleBase}/materials/${materialId}`}>{tr.materialBackToDetail}</BackLink>
      <PageHeader title={tr.materialEditTitle} description={tr.materialEditDescription} />

      {formError ? (
        <p className="mb-4 rounded-lg bg-[var(--color-m-error)]/10 px-3 py-2 text-sm text-[var(--color-m-error)]">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <Card className="space-y-4 p-6">
          <Input label={tr.materialFieldTitle} value={title} onChange={(e) => setTitle(e.target.value)} />

          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
              {tr.materialFieldDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-sm text-[var(--color-m-text)] outline-none focus:border-[var(--color-brand-primary)]"
            />
          </div>

          {materialType === 'assignment' ? (
            <Input
              label={tr.materialFieldDueDate}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          ) : null}

          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
              {tr.materialFieldStatus}
            </label>
            <div className="flex gap-2">
              {(['active', 'archived'] as const).map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => setStatus(nextStatus)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                    status === nextStatus
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'
                      : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
                  )}
                >
                  {nextStatus === 'active' ? tr.materialStatusActive : tr.materialStatusArchived}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="h-fit p-6 lg:sticky lg:top-6">
          <AssignedStudentsPicker
            students={students}
            selectedIds={assignedStudentIds}
            onChange={setAssignedStudentIds}
            isLoading={studentsLoading}
          />
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--color-m-card-border)] pt-4">
        <Button type="button" variant="secondary" onClick={() => navigate(`${roleBase}/materials/${materialId}`)}>
          {tr.cancel}
        </Button>
        <Button type="button" onClick={handleSubmit} isLoading={updateMutation.isPending}>
          {tr.materialSaveChanges}
        </Button>
      </div>

      <Modal
        open={confirmDueDateOpen}
        title={tr.materialDueDateChangeTitle}
        onClose={() => setConfirmDueDateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirmDueDateOpen(false)}>
              {tr.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmDueDateOpen(false);
                persist();
              }}
              isLoading={updateMutation.isPending}
            >
              {tr.materialSaveChanges}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--color-m-text-secondary)]">{tr.materialDueDateChangeMessage}</p>
      </Modal>
    </PageContainer>
  );
}
