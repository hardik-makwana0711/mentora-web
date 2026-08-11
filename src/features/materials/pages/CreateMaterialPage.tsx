import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { AssignedStudentsPicker } from '@/features/materials/components/AssignedStudentsPicker';
import { PdfFileInput } from '@/features/materials/components/PdfFileInput';
import { useMentorStudents } from '@/features/materials/hooks/useMentorStudents';
import { toDueDateIso, validateMaterialForm } from '@/features/materials/lib/material-validation';
import { materialsService, type MaterialType } from '@/services/materials.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

export default function CreateMaterialPage() {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const { students, isLoading: studentsLoading } = useMentorStudents();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaterialType>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const validationMessages: Record<string, string> = {
    materialValidationTitleRequired: tr.materialValidationTitleRequired,
    materialValidationTypeRequired: tr.materialValidationTypeRequired,
    materialValidationPdfRequired: tr.materialValidationPdfRequired,
    materialValidationPdfOnly: tr.materialValidationPdfOnly,
    materialValidationStudentsRequired: tr.materialValidationStudentsRequired,
    materialValidationDueDateRequired: tr.materialValidationDueDateRequired,
    materialValidationFileTooLarge: tr.materialValidationFileTooLarge,
  };

  const createMutation = useMutation({
    mutationFn: () =>
      materialsService.createMentorMaterial({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        dueDate: type === 'assignment' && dueDate ? toDueDateIso(dueDate) : undefined,
        assignedStudentIds,
        file: file!,
      }),
    onSuccess: (material) => {
      toast.success(tr.materialCreatedSuccess);
      navigate(`${roleBase}/materials/${material.id}`, { replace: true });
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string }).message ?? tr.materialCreateFailed;
      setFormError(msg);
    },
  });

  function handleSubmit() {
    const errorKey = validateMaterialForm({
      title,
      type,
      dueDate,
      assignedStudentIds,
      file,
    });
    if (errorKey) {
      setFormError(validationMessages[errorKey] ?? tr.materialValidationTitleRequired);
      return;
    }
    setFormError(null);
    createMutation.mutate();
  }

  return (
    <PageContainer width="content" className="max-w-6xl">
      <BackLink to={`${roleBase}/materials`}>{tr.materialBackToList}</BackLink>
      <PageHeader title={tr.materialCreateTitle} description={tr.materialCreateDescription} />

      {formError ? (
        <p className="mb-4 rounded-lg bg-[var(--color-m-error)]/10 px-3 py-2 text-sm text-[var(--color-m-error)]">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <Card className="space-y-4 p-6">
          <Input
            label={tr.materialFieldTitle}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFormError(null);
            }}
            placeholder={tr.materialTitlePlaceholder}
          />

          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
              {tr.materialFieldType}
            </label>
            <div className="flex gap-2">
              {(['assignment', 'course_resource'] as const).map((nextType) => (
                <button
                  key={nextType}
                  type="button"
                  onClick={() => {
                    setType(nextType);
                    if (nextType === 'course_resource') setDueDate('');
                  }}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
                    type === nextType
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'
                      : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-muted)] hover:text-[var(--color-m-text)]'
                  )}
                >
                  {nextType === 'assignment' ? tr.materialTypeAssignment : tr.materialTypeCourseResource}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
              {tr.materialFieldDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={tr.materialDescriptionPlaceholder}
              className="w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-sm text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)] focus:border-[var(--color-brand-primary)]"
            />
          </div>

          {type === 'assignment' ? (
            <Input
              label={tr.materialFieldDueDate}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          ) : null}

          <PdfFileInput
            file={file}
            onChange={(f) => {
              setFile(f);
              setFormError(null);
            }}
          />
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
        <Button type="button" variant="secondary" onClick={() => navigate(`${roleBase}/materials`)}>
          {tr.cancel}
        </Button>
        <Button type="button" onClick={handleSubmit} isLoading={createMutation.isPending}>
          {tr.materialUploadAction}
        </Button>
      </div>
    </PageContainer>
  );
}
