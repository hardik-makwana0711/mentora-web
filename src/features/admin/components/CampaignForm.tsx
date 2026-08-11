import { useEffect, useMemo } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { SponsoredCardPreview } from '@/features/admin/components/SponsoredCardPreview';
import {
  EXAM_TYPE_OPTIONS,
  formatGradeLabel,
  gradeToTargetString,
  PHASE1_PLACEMENTS,
  PLACEMENT_LABEL_KEYS,
  PRIORITY_PRESETS,
  ROLE_LABEL_KEYS,
} from '@/features/admin/lib/marketing-labels';
import {
  campaignFormSchema,
  formValuesToPayload,
  priorityFromPreset,
  type CampaignFormValues,
} from '@/features/admin/validations/campaign.schemas';
import { useStrings } from '@/constants/strings';
import type { CreateSponsoredCampaignPayload } from '@/types/marketing';

const defaultValues: CampaignFormValues = {
  internalName: '',
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  ctaText: '',
  ctaUrl: '',
  sponsorLabel: '',
  badgeText: '',
  status: 'draft',
  language: 'tr',
  platform: 'web',
  priorityPreset: 'normal',
  priority: PRIORITY_PRESETS.normal,
  startDate: '',
  endDate: '',
  roles: [],
  placements: [],
  isGeneral: false,
  targetGrade: '',
  targetSubject: '',
  targetExamType: '',
  minAge: undefined,
  maxAge: undefined,
};

function CheckboxRow({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-m-card-border)] px-3 py-2 text-sm text-[var(--color-m-text)] hover:bg-[var(--color-m-hover-overlay)]">
      <input
        type="checkbox"
        className="size-4 rounded border-[var(--color-m-card-border)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function CampaignForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValues?: Partial<CampaignFormValues>;
  submitLabel: string;
  onSubmit: (payload: CreateSponsoredCampaignPayload) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const tr = useStrings();
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema) as Resolver<CampaignFormValues>,
    mode: 'onChange',
    defaultValues: { ...defaultValues, ...initialValues },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({ ...defaultValues, ...initialValues });
      void form.trigger();
    }
  }, [initialValues, form]);

  const values = form.watch();
  const isGeneral = values.isGeneral;
  const priorityPreset = values.priorityPreset;

  useEffect(() => {
    if (priorityPreset !== 'custom') {
      form.setValue('priority', priorityFromPreset(priorityPreset), { shouldValidate: true });
    }
  }, [priorityPreset, form]);

  const validationMessage = (key?: string) => {
    if (!key) return undefined;
    const msg = tr[key as keyof typeof tr];
    return typeof msg === 'string' ? msg : key;
  };

  const previewCard = useMemo(
    () => ({
      id: 'preview',
      title: values.title || tr.marketingPreviewTitlePlaceholder,
      subtitle: values.subtitle || null,
      description: values.description || null,
      imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1509228468518-180dd4862104?w=400',
      ctaText: values.ctaText || tr.marketingDefaultCta,
      ctaUrl: values.ctaUrl || '#',
      sponsorLabel: values.sponsorLabel || null,
      badgeText: values.badgeText || tr.marketingSponsoredLabel,
    }),
    [values, tr]
  );

  const warnings: string[] = [];
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    warnings.push(tr.marketingValidationEndBeforeStart);
  }
  if (values.status === 'active' && values.placements.length === 0) {
    warnings.push(tr.marketingValidationActiveNoPlacement);
  }
  if (values.status === 'active' && values.roles.length === 0) {
    warnings.push(tr.marketingValidationActiveNoRole);
  }

  const gradeOptions = Array.from({ length: 12 }, (_, i) => {
    const grade = i + 1;
    return { value: gradeToTargetString(grade), label: formatGradeLabel(grade, tr) };
  });

  const handleSubmit = form.handleSubmit((vals) => {
    onSubmit(formValuesToPayload(vals));
  });

  const toggleArray = <T extends string>(field: 'roles' | 'placements', value: T) => {
    const current = form.getValues(field) as T[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    form.setValue(field, next as CampaignFormValues[typeof field], { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.marketingSectionBasicInfo}
          </h2>
          <Input
            label={tr.marketingFieldInternalName}
            {...form.register('internalName')}
            error={form.formState.errors.internalName?.message}
            disabled={isSubmitting}
          />
          <Input
            label={tr.marketingFieldTitle}
            {...form.register('title')}
            error={form.formState.errors.title?.message}
            disabled={isSubmitting}
          />
          <Input
            label={tr.marketingFieldSubtitle}
            {...form.register('subtitle')}
            disabled={isSubmitting}
          />
          <Textarea
            label={tr.marketingFieldDescription}
            {...form.register('description')}
            rows={4}
            disabled={isSubmitting}
          />
          <p className="-mt-2 text-xs text-[var(--color-m-text-muted)]">{tr.marketingFieldDescriptionHint}</p>
          <Input
            label={tr.marketingFieldImageUrl}
            {...form.register('imageUrl')}
            error={form.formState.errors.imageUrl?.message}
            disabled={isSubmitting}
            placeholder={tr.urlPlaceholder}
          />
          <Input
            label={tr.marketingFieldSponsorLabel}
            {...form.register('sponsorLabel')}
            disabled={isSubmitting}
          />
          <Input
            label={tr.marketingFieldBadgeText}
            {...form.register('badgeText')}
            placeholder={tr.marketingSponsoredLabel}
            disabled={isSubmitting}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tr.marketingFieldCtaText}
              {...form.register('ctaText')}
              disabled={isSubmitting}
            />
            <Input
              label={tr.marketingFieldCtaUrl}
              {...form.register('ctaUrl')}
              error={form.formState.errors.ctaUrl?.message}
              disabled={isSubmitting}
            />
          </div>
          <Controller
            name="language"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-1">
                <DropdownSelect
                  label={tr.marketingFieldLanguage}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'tr', label: tr.marketingLanguageTr },
                    { value: 'en', label: tr.marketingLanguageEn },
                  ]}
                />
                <p className="text-xs text-[var(--color-m-text-muted)]">{tr.marketingFieldLanguageHint}</p>
              </div>
            )}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.marketingSectionPlacements}
          </h2>
          <p className="text-sm text-[var(--color-m-text-muted)]">{tr.marketingPlacementsHint}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PHASE1_PLACEMENTS.map((placement) => (
              <CheckboxRow
                key={placement}
                checked={values.placements.includes(placement)}
                label={tr[PLACEMENT_LABEL_KEYS[placement] as keyof typeof tr] as string}
                onChange={() => toggleArray('placements', placement)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          {form.formState.errors.placements ? (
            <p className="text-sm text-[var(--color-m-error)]">
              {validationMessage(form.formState.errors.placements.message)}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.marketingSectionTargeting}
          </h2>
          <CheckboxRow
            checked={isGeneral}
            label={tr.marketingFieldGeneralCampaign}
            onChange={(v) => {
              form.setValue('isGeneral', v, { shouldValidate: true });
              if (v) {
                form.setValue('targetGrade', '');
                form.setValue('targetSubject', '');
                form.setValue('targetExamType', '');
                form.setValue('minAge', undefined);
                form.setValue('maxAge', undefined);
                void form.trigger([
                  'isGeneral',
                  'targetGrade',
                  'targetSubject',
                  'targetExamType',
                  'minAge',
                  'maxAge',
                ]);
              }
            }}
            disabled={isSubmitting}
          />
          <div className="grid gap-2 sm:grid-cols-3">
            {(['parent', 'student', 'mentor'] as const).map((role) => (
              <CheckboxRow
                key={role}
                checked={values.roles.includes(role)}
                label={tr[ROLE_LABEL_KEYS[role] as keyof typeof tr] as string}
                onChange={() => toggleArray('roles', role)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          {!isGeneral ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="targetGrade"
                control={form.control}
                render={({ field }) => (
                  <DropdownSelect
                    label={tr.marketingFieldTargetGrade}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    options={[{ value: '', label: tr.marketingAnyGrade }, ...gradeOptions]}
                  />
                )}
              />
              <Input
                label={tr.marketingFieldTargetSubject}
                {...form.register('targetSubject')}
                disabled={isSubmitting}
              />
              <Controller
                name="targetExamType"
                control={form.control}
                render={({ field }) => (
                  <DropdownSelect
                    label={tr.marketingFieldTargetExam}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    options={[
                      { value: '', label: tr.marketingAnyExam },
                      ...EXAM_TYPE_OPTIONS.map((e) => ({ value: e, label: e })),
                    ]}
                  />
                )}
              />
              <Input
                label={tr.marketingFieldMinAge}
                type="number"
                {...form.register('minAge')}
                disabled={isSubmitting}
              />
              <Input
                label={tr.marketingFieldMaxAge}
                type="number"
                {...form.register('maxAge')}
                disabled={isSubmitting}
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.marketingSectionSchedule}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tr.marketingFieldStartDate}
              type="date"
              {...form.register('startDate')}
              error={validationMessage(form.formState.errors.startDate?.message)}
              disabled={isSubmitting}
            />
            <Input
              label={tr.marketingFieldEndDate}
              type="date"
              {...form.register('endDate')}
              error={validationMessage(form.formState.errors.endDate?.message)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <DropdownSelect
                  label={tr.marketingFieldStatus}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'draft', label: tr.marketingStatusDraft },
                    { value: 'active', label: tr.marketingStatusActive },
                    { value: 'paused', label: tr.marketingStatusPaused },
                  ]}
                />
              )}
            />
            <Controller
              name="platform"
              control={form.control}
              render={({ field }) => (
                <DropdownSelect
                  label={tr.marketingFieldPlatform}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'web', label: tr.marketingPlatformWeb },
                    { value: 'ios', label: tr.marketingPlatformIos },
                    { value: 'android', label: tr.marketingPlatformAndroid },
                    { value: 'all', label: tr.marketingPlatformAll },
                  ]}
                />
              )}
            />
            <Controller
              name="priorityPreset"
              control={form.control}
              render={({ field }) => (
                <DropdownSelect
                  label={tr.marketingFieldPriority}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'low', label: tr.marketingPriorityLow },
                    { value: 'normal', label: tr.marketingPriorityNormal },
                    { value: 'high', label: tr.marketingPriorityHigh },
                    { value: 'custom', label: tr.marketingPriorityCustom },
                  ]}
                />
              )}
            />
          </div>
          {priorityPreset === 'custom' ? (
            <Input
              label={tr.marketingFieldPriorityValue}
              type="number"
              min={0}
              max={100}
              {...form.register('priority')}
              disabled={isSubmitting}
            />
          ) : null}
        </section>

        {warnings.length > 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex gap-2 text-amber-200">
              <AlertTriangle className="size-5 shrink-0" aria-hidden />
              <ul className="space-y-1 text-sm">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <FormActions>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            {tr.cancel}
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isSubmitting} isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </FormActions>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
          {tr.marketingPreviewTitle}
        </h2>
        <SponsoredCardPreview card={previewCard} />
      </aside>
    </form>
  );
}
