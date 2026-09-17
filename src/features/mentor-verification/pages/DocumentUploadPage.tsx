import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Upload } from 'lucide-react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStrings } from '@/constants/strings';
import { getDateFnsLocale } from '@/lib/date-locale';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { mentorVerificationService } from '@/services/mentor-verification.service';
import { cn } from '@/lib/utils';
import type { VerificationDocumentStatus, VerificationDocumentType } from '@/types/profile';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const DOCUMENT_TYPES: {
  value: VerificationDocumentType;
  labelKey: keyof ReturnType<typeof useStrings>;
}[] = [
  { value: 'graduation_certificate', labelKey: 'documentTypeGraduationCertificate' },
  { value: 'diploma', labelKey: 'documentTypeDiploma' },
  { value: 'enrollment_letter', labelKey: 'documentTypeEnrollmentLetter' },
  { value: 'other', labelKey: 'documentTypeOther' },
];

function statusVariant(status: VerificationDocumentStatus): 'success' | 'warning' | 'danger' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

function statusLabelKey(
  status: VerificationDocumentStatus
): 'verificationStatusApproved' | 'verificationStatusRejected' | 'verificationStatusPending' {
  if (status === 'approved') return 'verificationStatusApproved';
  if (status === 'rejected') return 'verificationStatusRejected';
  return 'verificationStatusPending';
}

export default function DocumentUploadPage() {
  const tr = useStrings();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<VerificationDocumentType>('graduation_certificate');

  const query = useQuery({
    queryKey: ['mentor-verification', 'files'],
    queryFn: () => mentorVerificationService.getFiles(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mentorVerificationService.uploadDocument(file, docType),
    onSuccess: () => {
      toast.success(tr.documentUploadSuccess);
      void qc.invalidateQueries({ queryKey: ['mentor-verification', 'files'] });
      void qc.invalidateQueries({ queryKey: ['mentor-verification'] });
    },
    onError: () => toast.error(tr.documentUploadFailed),
  });

  function handleFileSelected(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(tr.documentFileTooLarge);
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(tr.documentFileTypeInvalid);
      return;
    }
    uploadMutation.mutate(file);
  }

  const documents = query.data ?? [];

  return (
    <PageContainer width="form">
      <BackLink to={`${roleBase}/verification`}>{tr.back}</BackLink>

      <h1 className="text-xl font-bold text-[var(--color-m-text)]">{tr.documentUploadTitle}</h1>
      <p className="mt-1 text-sm text-[var(--color-m-text-secondary)]">{tr.documentUploadBody}</p>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDocType(d.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                docType === d.value
                  ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)] text-white'
                  : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-secondary)]'
              )}
            >
              {tr[d.labelKey]}
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          className="hidden"
          onChange={(e) => handleFileSelected(e.target.files?.[0])}
        />

        <Button
          type="button"
          fullWidth
          className="mt-4"
          isLoading={uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" aria-hidden />
          {tr.documentUploadButton}
        </Button>
        <p className="mt-2 text-xs text-[var(--color-m-text-muted)]">{tr.documentUploadHint}</p>
      </Card>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.documentsListTitle}
      </h2>

      {query.isPending ? (
        <div className="flex min-h-[15vh] items-center justify-center">
          <Spinner className="size-8 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState title={tr.documentsEmpty} />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="flex items-start gap-3 p-4">
              <FileText
                className="mt-0.5 size-5 shrink-0 text-[var(--color-m-text-muted)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-[var(--color-m-text)]">
                    {doc.original_file_name}
                  </p>
                  <Badge variant={statusVariant(doc.status)}>
                    {tr[statusLabelKey(doc.status)]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
                  {format(new Date(doc.uploaded_at), 'PPp', { locale: getDateFnsLocale() })}
                </p>
                {doc.review_notes ? (
                  <p className="mt-1 text-xs text-[var(--color-m-error)]">{doc.review_notes}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
