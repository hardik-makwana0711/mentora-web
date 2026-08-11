/** Shapes aligned with `apps/backend` lessons + sessions modules. */

import type { SessionMeetingStatus } from '@/types/sessions';

export type LessonRole = 'mentor' | 'student' | 'parent';



export type LessonCalendarSession = {

  session_id: string;

  lesson_id: string;

  subject_name: string;

  scheduled_at: string;

  duration_minutes?: number;

  status?: string;

  student_id?: string;

  student_name?: string;

  mentor_id?: string;

  mentor_name?: string;

  meeting_status?: SessionMeetingStatus | null;

  meeting_url?: string | null;

  can_join?: boolean;

  meeting_provider?: string | null;

  start_time?: string;

  end_time?: string;

};



export type LessonListItem = {

  lesson_id: string;

  subject_name: string;

  mentor_id?: string;

  mentor_name?: string;

  student_id?: string;

  student_name?: string;

  total_sessions: number;

  completed_sessions?: number;

  upcoming_sessions: number;

  next_session_date: string | null;

  created_at?: string;

};



export type LessonsListResponse = {

  pagination: { page: number; limit: number };

  lessons: LessonListItem[];

};



export type MentorLessonCard = {

  student_id: string;

  student_name: string;

  lesson_id: string;

  lesson_subject: string;

  total_hours: number;

  next_session_date: string | null;

  next_session_id: string | null;

  can_join?: boolean;

  upcoming_session_count?: number;

};



export type StudentSubjectCard = {

  lesson_id: string;

  subject_id?: string;

  subject_name: string;

  mentor_id: string;

  mentor_name: string;

  total_sessions: number;

  upcoming_session_count: number;

  next_session_date: string | null;

};



export type ParentSubjectCard = {

  lesson_id: string;

  student_id: string;

  student_name: string;

  subject_name: string;

  mentor_name: string;

  total_sessions: number;

  upcoming_session_count: number;

  next_session_date: string | null;

};



export type PastGroupCard = MentorLessonCard | StudentSubjectCard | ParentSubjectCard;



export type LessonsDashboardPayload =

  | {

      calendar: LessonCalendarSession[];

      student_cards: MentorLessonCard[];

      subject_cards?: never;

      linked_students?: never;

    }

  | {

      calendar: LessonCalendarSession[];

      subject_cards: StudentSubjectCard[];

      student_cards?: never;

      linked_students?: never;

    }

  | {

      calendar: LessonCalendarSession[];

      subject_cards: ParentSubjectCard[];

      linked_students?: { student_id: string; student_name: string }[];

      pagination?: { page: number; limit: number };

      student_cards?: never;

    };



export type LessonSessionListItem = {

  session_id: string;

  subject_name: string;

  session_date: string;

  lesson_number: number;

  topic: string | null;

  duration_minutes: number;

  badge: string;

};



export type LessonSessionsResponse = {

  lesson_id: string;

  subject_name: string;

  mentor_id: string;

  mentor_name: string;

  student_id: string;

  student_name: string;

  tab: 'upcoming' | 'past';

  pagination: { page: number; limit: number };

  sessions: LessonSessionListItem[];

};



export type MentorNote = {

  note_id: string;

  note_content: string;

  created_at: string;

  updated_at: string;

  created_by?: string;

};



export type SessionQuizSummary = {

  quiz_id: string;

  created_by: string;

  question_count: number;

  score: number | null;

  created_at: string;

};

export type QuizQuestionDetail = {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  selected_answer: string | null;
  is_correct: boolean | null;
};

export type QuizDetail = {
  quiz_id: string;
  session_id: string;
  created_by: string;
  question_count: number;
  score: number | null;
  created_at: string;
  questions: QuizQuestionDetail[];
};



export type TranscriptStatus =
  | 'NOT_SCHEDULED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'FAILED';

export type TranscriptStatusResponse = {
  sessionId: string;
  transcriptProvider: string | null;
  transcriptStatus: TranscriptStatus;
  transcriptConsentStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | null;
  recallBotStatus?: string | null;
  recallBotId?: string | null;
  transcriptReadyAt?: string | null;
};

export type TranscriptResponse = {
  sessionId: string;
  transcriptStatus: TranscriptStatus;
  transcriptText: string | null;
  createdAt: string | null;
  lessonTranscriptStatus?: string | null;
};

export type SessionDetail = {

  session_id: string;

  lesson_id: string;

  student_id: string;

  student_name: string;

  subject_name: string;

  mentor_id: string;

  mentor_name: string;

  lesson_number: number;

  topic: string | null;

  scheduled_at: string;

  duration_minutes: number;

  status: string;

  meeting_url: string | null;

  meeting_status?: SessionMeetingStatus | null;

  meeting_provider?: string | null;

  meeting_error?: string | null;

  can_join: boolean;

  mentor_note: MentorNote | null;

  quizzes: SessionQuizSummary[];

  ai_summary: string | null;

  ai_summary_status?: string | null;

  ai_quiz_id?: string | null;

  ai_quiz_status?: string | null;

  ai_quiz_question_count?: number | null;

  ai_quiz_time_limit_minutes?: number | null;

  knowledge_gap: string | null;

  engagement_score: number | null;

  understanding_score: number | null;

  participation_level: string | null;

};



export type JoinSessionResponse = {

  session_id: string;

  meeting_url: string | null;

  join_allowed: boolean;

  join_reason: string | null;

};


