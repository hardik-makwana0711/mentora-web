import { ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import { downloadPdf, openPdf } from '@/features/materials/lib/pdf-utils';

export type PdfActionsVariant = 'default' | 'teacher' | 'submitted';

function resolveLabels(
  tr: ReturnType<typeof useStrings>,
  variant: PdfActionsVariant
): { open: string; download: string } {
  if (variant === 'teacher') {
    return { open: tr.openTeacherPdf, download: tr.downloadTeacherPdf };
  }
  if (variant === 'submitted') {
    return { open: tr.openSubmittedPdf, download: tr.downloadSubmittedPdf };
  }
  return { open: tr.openPdf, download: tr.downloadPdf };
}

export function PdfActions({
  fileUrl,
  fileName,
  size = 'sm',
  variant = 'default',
  compact = false,
}: {
  fileUrl?: string | null;
  fileName?: string | null;
  size?: 'sm' | 'md';
  variant?: PdfActionsVariant;
  /** Icon-only buttons (for table cells). Labels are applied via aria-label. */
  compact?: boolean;
}) {
  const tr = useStrings();
  if (!fileUrl) return null;

  const labels = resolveLabels(tr, variant);
  const fallbackName =
    variant === 'submitted' ? 'submission.pdf' : variant === 'teacher' ? 'assignment.pdf' : 'document.pdf';

  if (compact) {
    return (
      <div className="flex gap-1">
        <Button
          type="button"
          size={size}
          variant="secondary"
          aria-label={labels.open}
          title={labels.open}
          onClick={() => openPdf(fileUrl)}
        >
          <ExternalLink className="size-4" />
        </Button>
        <Button
          type="button"
          size={size}
          variant="secondary"
          aria-label={labels.download}
          title={labels.download}
          onClick={() => void downloadPdf(fileUrl, fileName ?? fallbackName)}
        >
          <Download className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size={size} variant="secondary" onClick={() => openPdf(fileUrl)}>
        <ExternalLink className="mr-2 size-4" />
        {labels.open}
      </Button>
      <Button
        type="button"
        size={size}
        variant="secondary"
        onClick={() => void downloadPdf(fileUrl, fileName ?? fallbackName)}
      >
        <Download className="mr-2 size-4" />
        {labels.download}
      </Button>
    </div>
  );
}
