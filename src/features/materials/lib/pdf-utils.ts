import { toast } from 'sonner';
import i18n from '@/i18n';

const PDF_MIME = 'application/pdf';
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export function isPdfFile(file: File | null | undefined): boolean {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return file.type === PDF_MIME || name.endsWith('.pdf');
}

export function openPdf(url: string | null | undefined): void {
  if (!url) {
    toast.error(i18n.t('materialPdfUnavailable'));
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function downloadPdf(url: string | null | undefined, fileName = 'document.pdf'): Promise<void> {
  if (!url) {
    toast.error(i18n.t('materialPdfUnavailable'));
    return;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
