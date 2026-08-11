import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { SubjectSelector } from '@/features/listings/components/SubjectSelector';
import { GradeLevelMultiSelect } from '@/features/listings/components/GradeLevelMultiSelect';
import { LessonFormatSelector } from '@/features/listings/components/LessonFormatSelector';
import {
  createListingFormSchema,
  type ListingFormValues,
} from '@/features/listings/validations/listings.schemas';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import type { ListingFormPayload, ListingSubject } from '@/types/listings';

const defaultValues: ListingFormValues = {
  subject: '' as ListingFormValues['subject'],
  grade_levels: [],
  lesson_format: 'one_to_one',
  description: '',
};

export function ListingForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValues?: Partial<ListingFormValues>;
  submitLabel: string;
  onSubmit: (payload: ListingFormPayload) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const tr = useStrings();
  const { i18n: i18nInstance } = useTranslation();
  const locale = i18nInstance.resolvedLanguage ?? i18nInstance.language;
  const listingSchema = useMemo(() => createListingFormSchema(), [locale]);
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    mode: 'onChange',
    defaultValues: { ...defaultValues, ...initialValues },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({ ...defaultValues, ...initialValues });
      void form.trigger();
    }
  }, [initialValues, form]);

  const description = form.watch('description') ?? '';
  const canSubmit = form.formState.isValid && !isSubmitting;

  const handleSubmit = form.handleSubmit((vals) => {
    onSubmit({
      subject: vals.subject as ListingSubject,
      grade_levels: vals.grade_levels,
      lesson_format: vals.lesson_format,
      description: vals.description.trim(),
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-1" noValidate>
      <Controller
        name="subject"
        control={form.control}
        render={({ field, fieldState }) => (
          <SubjectSelector
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <Controller
        name="grade_levels"
        control={form.control}
        render={({ field, fieldState }) => (
          <GradeLevelMultiSelect
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <Controller
        name="lesson_format"
        control={form.control}
        render={({ field, fieldState }) => (
          <LessonFormatSelector
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Textarea
            label={i18n.t('listingDescriptionLabel', { count: description.length })}
            rows={6}
            maxLength={1000}
            placeholder={tr.listingDescriptionPlaceholder}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={isSubmitting}
          />
        )}
      />

      <FormActions>
        <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {tr.cancel}
        </Button>
      </FormActions>
    </form>
  );
}
