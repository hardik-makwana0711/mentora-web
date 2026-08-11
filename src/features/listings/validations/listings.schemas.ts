import { z } from 'zod';
import i18n from '@/i18n';

const subjectValues = [
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'english',
  'computer_science',
  'history',
  'economics',
] as const;

const gradeLevelValues = ['primary', 'middle_school', 'high_school'] as const;

const lessonFormatValues = ['one_to_one', 'group'] as const;

export function createListingFormSchema() {
  return z.object({
    subject: z.enum(subjectValues, { message: i18n.t('listingValidationSubjectRequired') }),
    grade_levels: z
      .array(z.enum(gradeLevelValues))
      .min(1, i18n.t('listingValidationGradeRequired'))
      .refine((items) => new Set(items).size === items.length, {
        message: i18n.t('listingValidationGradeDuplicate'),
      }),
    lesson_format: z.enum(lessonFormatValues, { message: i18n.t('listingValidationFormatRequired') }),
    description: z
      .string()
      .trim()
      .min(50, i18n.t('listingValidationDescriptionMin'))
      .max(1000, i18n.t('listingValidationDescriptionMax')),
  });
}

export type ListingFormValues = z.infer<ReturnType<typeof createListingFormSchema>>;

/** @deprecated Use createListingFormSchema() for locale-aware validation messages */
export const listingFormSchema = createListingFormSchema();
