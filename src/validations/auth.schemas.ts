import { z } from 'zod';
import i18n from '@/i18n';

export function createLoginSchema() {
  return z.object({
    login_identifier: z.string().min(1, i18n.t('validationEmailOrPhoneRequired')),
    password: z.string().min(1, i18n.t('validationPasswordRequired')),
  });
}

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;

export function createRegisterSchema() {
  return z
    .object({
      first_name: z.string().min(1, i18n.t('validationFirstNameRequired')),
      last_name: z.string().min(1, i18n.t('validationLastNameRequired')),
      email: z.string().email(i18n.t('validationEmailInvalid')),
      phone_number: z.string().min(6, i18n.t('validationPhoneRequired')),
      password: z.string().min(8, i18n.t('validationPasswordMinLength')),
      confirm_password: z.string().min(8, i18n.t('validationConfirmPasswordRequired')),
      role: z.enum(['parent', 'mentor']),
      terms_accepted: z
        .boolean()
        .refine((v) => v === true, { message: i18n.t('validationTermsRequired') }),
    })
    .refine((d) => d.password === d.confirm_password, {
      message: i18n.t('validationPasswordsMismatch'),
      path: ['confirm_password'],
    });
}

export type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;

export function createForgotSchema() {
  return z.object({
    recovery_identifier: z.string().min(3, i18n.t('validationEmailOrPhoneRequired')),
  });
}

export type ForgotForm = z.infer<ReturnType<typeof createForgotSchema>>;

export function createResetPasswordSchema() {
  return z
    .object({
      new_password: z.string().min(8, i18n.t('validationPasswordMinLength')),
      confirm_new_password: z.string().min(8, i18n.t('validationConfirmPasswordRequired')),
    })
    .refine((d) => d.new_password === d.confirm_new_password, {
      message: i18n.t('validationPasswordsMismatch'),
      path: ['confirm_new_password'],
    });
}

export type ResetPasswordForm = z.infer<ReturnType<typeof createResetPasswordSchema>>;

/** @deprecated Use createLoginSchema() for locale-aware validation messages */
export const loginSchema = createLoginSchema();
/** @deprecated Use createRegisterSchema() */
export const registerSchema = createRegisterSchema();
/** @deprecated Use createForgotSchema() */
export const forgotSchema = createForgotSchema();
/** @deprecated Use createResetPasswordSchema() */
export const resetPasswordSchema = createResetPasswordSchema();
