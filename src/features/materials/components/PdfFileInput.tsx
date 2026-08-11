import { useCallback, useRef, useState } from 'react';
import { FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { isPdfFile, MAX_PDF_SIZE_BYTES } from '@/features/materials/lib/pdf-utils';
import { cn } from '@/lib/utils';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfFileInput({
  file,
  onChange,
  error,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
}) {
  const tr = useStrings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const applyFile = useCallback(
    (next: File | null) => {
      if (!next) {
        setLocalError(null);
        onChange(null);
        return;
      }
      if (!isPdfFile(next)) {
        setLocalError(tr.materialValidationPdfOnly);
        onChange(null);
        return;
      }
      if (next.size > MAX_PDF_SIZE_BYTES) {
        setLocalError(tr.materialValidationFileTooLarge);
        onChange(null);
        return;
      }
      setLocalError(null);
      onChange(next);
    },
    [onChange, tr]
  );

  const displayError = error ?? localError;

  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.materialUploadPdf}
      </label>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-m-text)]">{file.name}</p>
            <p className="mt-0.5 text-xs text-[var(--color-m-text-muted)]">{formatFileSize(file.size)}</p>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => applyFile(null)}>
            <X className="mr-1 size-4" />
            {tr.materialRemoveFile}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            applyFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition',
            dragging
              ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10'
              : 'border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] hover:border-[var(--color-brand-primary)]/40'
          )}
        >
          <FileUp className="size-8 text-[var(--color-brand-primary)]" aria-hidden />
          <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.materialPdfDropHint}</p>
          <p className="text-xs text-[var(--color-m-text-muted)]">{tr.materialPdfConstraints}</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
      />

      {displayError ? <p className="mt-2 text-sm text-[var(--color-m-error)]">{displayError}</p> : null}
    </div>
  );
}
