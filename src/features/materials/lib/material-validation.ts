import { isPdfFile, MAX_PDF_SIZE_BYTES } from '@/features/materials/lib/pdf-utils';
import type { MaterialType } from '@/services/materials.service';

export type MaterialValidationKey =
  | 'materialValidationTitleRequired'
  | 'materialValidationTypeRequired'
  | 'materialValidationPdfRequired'
  | 'materialValidationPdfOnly'
  | 'materialValidationStudentsRequired'
  | 'materialValidationDueDateRequired'
  | 'materialValidationFileTooLarge';

export function validateMaterialForm({
  title,
  type,
  dueDate,
  assignedStudentIds,
  file,
  isEditing = false,
}: {
  title: string;
  type?: MaterialType;
  dueDate?: string;
  assignedStudentIds: string[];
  file?: File | null;
  isEditing?: boolean;
}): MaterialValidationKey | null {
  if (!title.trim()) return 'materialValidationTitleRequired';
  if (!type) return 'materialValidationTypeRequired';
  if (!isEditing && !file) return 'materialValidationPdfRequired';
  if (file && !isPdfFile(file)) return 'materialValidationPdfOnly';
  if (file && file.size > MAX_PDF_SIZE_BYTES) return 'materialValidationFileTooLarge';
  if (assignedStudentIds.length === 0) return 'materialValidationStudentsRequired';
  if (type === 'assignment' && !dueDate) return 'materialValidationDueDateRequired';
  return null;
}

export function toDueDateIso(dateValue: string): string {
  const parsed = new Date(`${dateValue}T23:59:59`);
  return parsed.toISOString();
}
