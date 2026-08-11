import { z } from 'zod';
import i18n from '@/i18n';

export function createParentProfileFormSchema() {
  return z.object({
    firstName: z.string().trim().min(1, i18n.t('validationFirstNameRequired')).max(50),
    lastName: z.string().trim().min(1, i18n.t('validationLastNameRequired')).max(50),
    phone: z
      .string()
      .trim()
      .max(20)
      .refine(
        (v) => {
          if (!v) return true;
          const digits = v.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 15;
        },
        { message: i18n.t('validationPhoneInvalid') },
      ),
  });
}

export function createMentorProfileFormSchema() {
  return z.object({
    firstName: z.string().trim().min(1, i18n.t('validationFirstNameRequired')).max(50),
    lastName: z.string().trim().min(1, i18n.t('validationLastNameRequired')).max(50),
    bio: z.string().trim().max(500, i18n.t('validationBioMaxLength')),
  });
}

export function createStudentProfileFormSchema() {
  return z.object({
    firstName: z.string().trim().min(1, i18n.t('validationFirstNameRequired')).max(50),
    lastName: z.string().trim().min(1, i18n.t('validationLastNameRequired')).max(50),
    dateOfBirth: z
      .string()
      .optional()
      .refine((s) => {
        if (!s?.trim()) return true;
        const d = new Date(s + 'T12:00:00');
        if (Number.isNaN(d.getTime())) return false;
        return d.getTime() < Date.now();
      }, i18n.t('validationDateOfBirthPast')),
    school_name: z.string().trim().max(150).optional(),
    grade_level: z.string().trim().max(50).optional(),
  });
}

/** @deprecated Use createParentProfileFormSchema() for locale-aware validation messages */
export const parentProfileFormSchema = createParentProfileFormSchema();
/** @deprecated Use createMentorProfileFormSchema() */
export const mentorProfileFormSchema = createMentorProfileFormSchema();
/** @deprecated Use createStudentProfileFormSchema() */
export const studentProfileFormSchema = createStudentProfileFormSchema();

export type ParentProfileForm = z.infer<ReturnType<typeof createParentProfileFormSchema>>;
export type MentorProfileForm = z.infer<ReturnType<typeof createMentorProfileFormSchema>>;
export type StudentProfileForm = z.infer<ReturnType<typeof createStudentProfileFormSchema>>;
