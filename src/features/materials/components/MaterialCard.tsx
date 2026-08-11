import { format } from 'date-fns';
import { FileText, BookOpen, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';
import { MaterialTypeBadge } from '@/features/materials/components/MaterialTypeBadge';
import { SubmissionStatusBadge } from '@/features/materials/components/SubmissionStatusBadge';
import { PdfActions } from '@/features/materials/components/PdfActions';
import { resolveParentDisplayStatus } from '@/features/materials/lib/parent-assignment-status';
import type { SubmissionStatus, TeacherMaterial } from '@/services/materials.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

function resolveSubmissionStatus(material: TeacherMaterial): SubmissionStatus | null {
  if (material.type !== 'assignment') return null;
  return (
    material.submissionStatus ??
    material.submission?.status ??
    'not_submitted'
  );
}

export function MaterialCard({
  material,
  role,
  studentId,
  onSubmitClick,
}: {
  material: TeacherMaterial;
  role: 'mentor' | 'student' | 'parent';
  studentId?: string;
  onSubmitClick?: () => void;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const isAssignment = material.type === 'assignment';
  const submissionStatus = resolveSubmissionStatus(material);
  const parentStatus =
    role === 'parent'
      ? resolveParentDisplayStatus(submissionStatus, material.dueDate ?? null)
      : submissionStatus;

  const detailPath =
    role === 'mentor'
      ? `${roleBase}/materials/${material.id}`
      : role === 'student'
        ? `${roleBase}/materials/${material.id}`
        : studentId
          ? `${roleBase}/materials/${studentId}/${material.id}`
          : `${roleBase}/materials`;

  const assignedCount = material.assignedStudentCount ?? 0;
  const submittedCount = material.submissionCount ?? 0;
  const missingCount = Math.max(assignedCount - submittedCount, 0);

  return (
    <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            isAssignment ? 'bg-orange-500/15' : 'bg-[var(--color-brand-primary)]/15'
          )}
        >
          {isAssignment ? (
            <FileText className="size-5 text-orange-400" />
          ) : (
            <BookOpen className="size-5 text-[var(--color-brand-primary)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => navigate(detailPath)}
              className="text-left font-semibold text-[var(--color-m-text)] hover:text-[var(--color-brand-primary)]"
            >
              {material.title}
            </button>
            <MaterialTypeBadge type={material.type} />
          </div>

          {role === 'parent' && material.childName ? (
            <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{material.childName}</p>
          ) : null}
          {material.teacherName ? (
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{material.teacherName}</p>
          ) : null}

          {material.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--color-m-text-secondary)]">
              {material.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-m-text-muted)]">
            {material.dueDate ? (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {tr.materialDue}: {format(new Date(material.dueDate), 'd MMM yyyy')}
              </span>
            ) : null}
            {material.createdAt && !material.dueDate ? (
              <span>
                {tr.materialCreated}: {format(new Date(material.createdAt), 'd MMM yyyy')}
              </span>
            ) : null}
            {role === 'mentor' && assignedCount > 0 ? (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {assignedCount} {tr.materialStudents}
              </span>
            ) : null}
            {role === 'mentor' && isAssignment ? (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="size-3.5" />
                {tr.materialSubmittedCount.replace('{{submitted}}', String(submittedCount)).replace('{{total}}', String(assignedCount))}
              </span>
            ) : null}
            {role === 'mentor' && isAssignment && missingCount > 0 ? (
              <span className="flex items-center gap-1 text-orange-400">
                <AlertCircle className="size-3.5" />
                {tr.materialMissingCount.replace('{{count}}', String(missingCount))}
              </span>
            ) : null}
            {role === 'mentor' && !isAssignment ? (
              <span>{tr.materialCourseResourceHint}</span>
            ) : null}
            {(role === 'student' || role === 'parent') && parentStatus ? (
              <SubmissionStatusBadge status={parentStatus} />
            ) : null}
            {material.submittedAt && role === 'parent' ? (
              <span>
                {tr.materialSubmittedAt}: {format(new Date(material.submittedAt), 'd MMM yyyy')}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PdfActions fileUrl={material.fileUrl} fileName={material.fileName} />
            {role === 'student' && isAssignment ? (
              <Button
                type="button"
                size="sm"
                onClick={() => (onSubmitClick ? onSubmitClick() : navigate(detailPath))}
              >
                {submissionStatus && submissionStatus !== 'not_submitted'
                  ? tr.reuploadSubmission
                  : tr.submitAssignment}
              </Button>
            ) : null}
            {role === 'mentor' ? (
              <>
                <Button type="button" size="sm" variant="secondary" onClick={() => navigate(detailPath)}>
                  {tr.materialViewDetails}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`${roleBase}/materials/${material.id}/edit`)}
                >
                  {tr.materialEdit}
                </Button>
              </>
            ) : null}
            {role === 'parent' ? (
              <Button type="button" size="sm" variant="secondary" onClick={() => navigate(detailPath)}>
                {tr.materialViewDetails}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
