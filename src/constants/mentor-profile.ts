import type { useStrings } from '@/constants/strings';

type LabelKey = keyof ReturnType<typeof useStrings>;

/** Matches backend `TEACHING_FORMATS` in mentor-profile.constants.ts exactly. */
export const TEACHING_FORMATS: { value: string; labelKey: LabelKey }[] = [
  { value: 'online', labelKey: 'teachingFormatOnline' },
  { value: 'in_person', labelKey: 'teachingFormatInPerson' },
  { value: 'hybrid', labelKey: 'teachingFormatHybrid' },
];

/** Matches backend `TEACHING_STYLE_TAGS` in mentor-profile.constants.ts exactly — values must stay in English (sent verbatim to the API). */
export const TEACHING_STYLE_TAGS: { value: string; labelKey: LabelKey }[] = [
  { value: 'Patient', labelKey: 'teachingStyleTagPatient' },
  { value: 'Motivating', labelKey: 'teachingStyleTagMotivating' },
  { value: 'Disciplined', labelKey: 'teachingStyleTagDisciplined' },
  { value: 'Friendly', labelKey: 'teachingStyleTagFriendly' },
  { value: 'Exam-Oriented', labelKey: 'teachingStyleTagExamOriented' },
  { value: 'Supportive', labelKey: 'teachingStyleTagSupportive' },
  { value: 'Structured', labelKey: 'teachingStyleTagStructured' },
  { value: 'Fun', labelKey: 'teachingStyleTagFun' },
  { value: 'Calm', labelKey: 'teachingStyleTagCalm' },
  { value: 'Energetic', labelKey: 'teachingStyleTagEnergetic' },
  { value: 'Goal-Oriented', labelKey: 'teachingStyleTagGoalOriented' },
];
