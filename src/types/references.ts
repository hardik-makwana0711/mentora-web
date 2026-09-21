export type ReferenceType = 'review' | 'success_story';
export type ReferenceStatus = 'pending' | 'approved' | 'hidden';
export type AchievementType =
  | 'school_admission'
  | 'exam_success'
  | 'grade_improvement'
  | 'general_progress'
  | 'other';
export type ReferenceDisplayNameOption = 'parent' | 'student' | 'anonymous' | 'custom';

export interface SubmitReferenceInput {
  teacher_id: string;
  type: ReferenceType;
  title?: string;
  content: string;
  rating?: number;
  achievement_type?: AchievementType;
  achievement_name?: string;
  achievement_year?: number;
  student_id?: string;
  is_anonymous: boolean;
  display_name?: string;
  consent_to_display: boolean;
}

export interface MyReferenceRow {
  id: string;
  teacher_id: string;
  teacher_name: string;
  type: ReferenceType;
  title: string | null;
  content: string;
  rating: number | null;
  status: ReferenceStatus;
  created_at: string;
}

export interface MentorReferenceRow {
  id: string;
  reviewer_role: string;
  type: ReferenceType;
  title: string | null;
  content: string;
  rating: number | null;
  achievement_type: AchievementType | null;
  achievement_name: string | null;
  achievement_year: number | null;
  display_name: string;
  is_anonymous: boolean;
  consent_to_display: boolean;
  status: ReferenceStatus;
  created_at: string;
}
