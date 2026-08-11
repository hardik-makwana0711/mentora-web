export type UniversityAttendanceStatus = 'attending' | 'graduated';

export type EducationLevel = 'primary' | 'middle' | 'high';

export type ExamTrack = 'LGS' | 'TYT' | 'AYT';

export interface UniversitySummary {
  id: string;
  name: string;
  city: string | null;
  institution_type: string;
}

export interface UniversitiesResponse {
  items: UniversitySummary[];
  pagination: { page: number; limit: number; total: number };
}

export interface GradeInfo {
  grade_level_id: string;
  grade_number: number;
  display_name: string;
  education_level: string;
}

export interface SubjectByGradeItem {
  id: string;
  subject_key: string;
  display_name: string;
  category: string;
  availability: 'required' | 'elective' | 'combined_choice';
}

export interface SubjectsByGradeResponse {
  grade: GradeInfo;
  items: SubjectByGradeItem[];
}

export interface ExamSubjectItem {
  id: string;
  subject_key: string;
  display_name: string;
  base_subject_id: string | null;
}

export interface ExamSubjectsResponse {
  exam_track: ExamTrack;
  items: ExamSubjectItem[];
}

export interface SubjectProficiencyGrade {
  grade_level_id: string;
  grade_number: number;
  display_name: string;
}

export interface SubjectProficiency {
  subject_id: string;
  display_name: string;
  grades: SubjectProficiencyGrade[];
}

export interface ExamProficiency {
  id: string;
  exam_track: string;
  display_name: string;
}

export interface PrimaryUniversity {
  id: string;
  name: string;
  city: string | null;
  institution_type?: string;
  attendance_status: UniversityAttendanceStatus | null;
}

export interface SubjectProficiencyPatchItem {
  subject_id: string;
  grade_level_ids: string[];
}

export interface ExamProficiencyPatchItem {
  exam_track_subject_id: string;
}

export interface StructuredSubjectSummary {
  id: string;
  name: string;
  grades: number[];
}

export interface StructuredExamSubjectSummary {
  id: string;
  name: string;
}

export interface ListingStructuredInfo {
  subject_id: string | null;
  subject_display_name: string | null;
  exam_track_subject_id: string | null;
  exam_display_name: string | null;
  grade_levels: SubjectProficiencyGrade[];
}
