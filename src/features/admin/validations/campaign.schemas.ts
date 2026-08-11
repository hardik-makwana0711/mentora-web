import { z } from 'zod';
import type { SponsoredCampaignPlacement, SponsoredTargetRole } from '@/types/marketing';
import { PHASE1_PLACEMENTS, PRIORITY_PRESETS } from '@/features/admin/lib/marketing-labels';

const urlSchema = z.string().trim().url().max(2048);

/** Empty / null number inputs from optional age fields must not fail validation. */
const optionalAgeSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.coerce.number().int().min(5).max(100).optional()
);

export const campaignFormSchema = z
  .object({
    internalName: z.string().trim().min(1).max(200),
    title: z.string().trim().min(1).max(200),
    subtitle: z.string().trim().max(300).optional().or(z.literal('')),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    imageUrl: urlSchema,
    ctaText: z.string().trim().max(80).optional().or(z.literal('')),
    ctaUrl: urlSchema,
    sponsorLabel: z.string().trim().max(120).optional().or(z.literal('')),
    badgeText: z.string().trim().max(80).optional().or(z.literal('')),
    status: z.enum(['draft', 'active', 'paused']),
    language: z.enum(['en', 'tr']),
    platform: z.enum(['ios', 'android', 'web', 'all']).default('web'),
    priorityPreset: z.enum(['low', 'normal', 'high', 'custom']).default('normal'),
    priority: z.coerce.number().int().min(0).max(100).default(50),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    roles: z.array(z.enum(['parent', 'student', 'mentor'])).min(1),
    placements: z
      .array(z.enum(PHASE1_PLACEMENTS as [SponsoredCampaignPlacement, ...SponsoredCampaignPlacement[]]))
      .min(1),
    isGeneral: z.boolean().default(false),
    targetGrade: z.string().optional().or(z.literal('')),
    targetSubject: z.string().trim().max(120).optional().or(z.literal('')),
    targetExamType: z.string().trim().max(120).optional().or(z.literal('')),
    minAge: optionalAgeSchema,
    maxAge: optionalAgeSchema,
  })
  .superRefine((val, ctx) => {
    if (val.startDate && val.endDate && val.endDate < val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marketingValidationEndBeforeStart',
        path: ['endDate'],
      });
    }
    if (val.status === 'active' && val.placements.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marketingValidationActiveNoPlacement',
        path: ['placements'],
      });
    }
    if (val.status === 'active' && val.roles.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marketingValidationActiveNoRole',
        path: ['roles'],
      });
    }
    const minAge = val.minAge === ('' as unknown as number) || val.minAge == null ? undefined : val.minAge;
    const maxAge = val.maxAge === ('' as unknown as number) || val.maxAge == null ? undefined : val.maxAge;
    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marketingValidationAgeRange',
        path: ['minAge'],
      });
    }
    const hasTargeting =
      !!val.targetGrade ||
      !!val.targetSubject ||
      !!val.targetExamType ||
      minAge !== undefined ||
      maxAge !== undefined;
    if (val.isGeneral && hasTargeting) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'marketingValidationGeneralTargeting',
        path: ['isGeneral'],
      });
    }
  });

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export function formValuesToPayload(values: CampaignFormValues) {
  const minAge =
    values.minAge === ('' as unknown as number) || values.minAge == null ? undefined : values.minAge;
  const maxAge =
    values.maxAge === ('' as unknown as number) || values.maxAge == null ? undefined : values.maxAge;

  return {
    internalName: values.internalName.trim(),
    title: values.title.trim(),
    subtitle: values.subtitle?.trim() || undefined,
    description: values.description?.trim() || undefined,
    imageUrl: values.imageUrl.trim(),
    ctaText: values.ctaText?.trim() || undefined,
    ctaUrl: values.ctaUrl.trim(),
    sponsorLabel: values.sponsorLabel?.trim() || undefined,
    badgeText: values.badgeText?.trim() || undefined,
    status: values.status,
    language: values.language,
    platform: values.platform === 'all' ? null : values.platform,
    priority: values.priority,
    startDate: values.startDate,
    endDate: values.endDate,
    roles: values.roles as SponsoredTargetRole[],
    placements: values.placements,
    isGeneral: values.isGeneral,
    targetGrade: values.isGeneral ? undefined : values.targetGrade?.trim() || undefined,
    targetSubject: values.isGeneral ? undefined : values.targetSubject?.trim() || undefined,
    targetExamType: values.isGeneral ? undefined : values.targetExamType?.trim() || undefined,
    minAge: values.isGeneral ? undefined : minAge,
    maxAge: values.isGeneral ? undefined : maxAge,
  };
}

export function campaignToFormValues(campaign: {
  internalName: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaText?: string | null;
  ctaUrl: string;
  sponsorLabel?: string | null;
  badgeText?: string | null;
  status: string;
  language: 'en' | 'tr';
  platform?: string | null;
  priority: number;
  startDate: string;
  endDate: string;
  roles: SponsoredTargetRole[];
  placements: SponsoredCampaignPlacement[];
  isGeneral: boolean;
  targetGrade?: string | null;
  targetSubject?: string | null;
  targetExamType?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
}): CampaignFormValues {
  const status =
    campaign.status === 'active' || campaign.status === 'paused' || campaign.status === 'draft'
      ? campaign.status
      : 'draft';

  let priorityPreset: CampaignFormValues['priorityPreset'] = 'custom';
  if (campaign.priority === 25) priorityPreset = 'low';
  else if (campaign.priority === 50) priorityPreset = 'normal';
  else if (campaign.priority === 75) priorityPreset = 'high';

  const startDate = campaign.startDate.includes('T')
    ? campaign.startDate.slice(0, 10)
    : campaign.startDate;
  const endDate = campaign.endDate.includes('T') ? campaign.endDate.slice(0, 10) : campaign.endDate;

  return {
    internalName: campaign.internalName,
    title: campaign.title,
    subtitle: campaign.subtitle ?? '',
    description: campaign.description ?? '',
    imageUrl: campaign.imageUrl,
    ctaText: campaign.ctaText ?? '',
    ctaUrl: campaign.ctaUrl,
    sponsorLabel: campaign.sponsorLabel ?? '',
    badgeText: campaign.badgeText ?? '',
    status,
    language: campaign.language,
    platform: campaign.platform ? (campaign.platform as CampaignFormValues['platform']) : 'all',
    priorityPreset,
    priority: campaign.priority,
    startDate,
    endDate,
    roles: campaign.roles,
    placements: campaign.placements.filter((p) =>
      (PHASE1_PLACEMENTS as string[]).includes(p)
    ) as CampaignFormValues['placements'],
    isGeneral: campaign.isGeneral,
    targetGrade: campaign.targetGrade ?? '',
    targetSubject: campaign.targetSubject ?? '',
    targetExamType: campaign.targetExamType ?? '',
    minAge: campaign.minAge ?? undefined,
    maxAge: campaign.maxAge ?? undefined,
  };
}

export function priorityFromPreset(preset: CampaignFormValues['priorityPreset']): number {
  if (preset === 'low') return PRIORITY_PRESETS.low;
  if (preset === 'high') return PRIORITY_PRESETS.high;
  if (preset === 'normal') return PRIORITY_PRESETS.normal;
  return PRIORITY_PRESETS.normal;
}
