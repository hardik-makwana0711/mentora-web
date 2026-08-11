export type DashboardQuickAction = {
  action_id: string;
  action_name: string;
  icon: string;
  target_route: string;
};

import type { SessionMeetingStatus } from '@/types/sessions';

export type DashboardUpcomingLesson = {
  session_id: string;
  mentor_name: string;
  subject: string;
  lesson_topic?: string | null;
  start_time: string;
  end_time?: string;
  can_join?: boolean;
  meeting_url?: string | null;
  meeting_status?: SessionMeetingStatus | null;
  meeting_provider?: string | null;
};

export type StudentDashboardData = {
  account: {
    student_id: string;
    student_name: string;
    avatar_url: string | null;
    welcome_message: string;
  };
  upcoming_lesson: DashboardUpcomingLesson | null;
  quick_actions: DashboardQuickAction[];
};

export type ParentDashboardData = {
  account: {
    parent_id: string;
    parent_name: string;
    avatar_url: string | null;
    welcome_message: string;
  };
  student: {
    student_id: string;
    student_name: string;
    grade: string | null;
    avatar_url: string | null;
  } | null;
  upcoming_lesson: Omit<DashboardUpcomingLesson, 'lesson_topic'> | null;
  wallet: { credit_balance: number };
  quick_actions: DashboardQuickAction[];
};

export type MentorScheduleItem = {
  session_id: string;
  student_name: string;
  subject: string;
  start_time: string;
  end_time?: string;
  can_join?: boolean;
  meeting_url?: string | null;
  meeting_status?: SessionMeetingStatus | null;
  meeting_provider?: string | null;
};

export type MentorDashboardData = {
  account: {
    mentor_id: string;
    mentor_name: string;
    avatar_url: string | null;
    welcome_message: string;
  };
  today_schedule: MentorScheduleItem[];
  upcoming_lessons: MentorScheduleItem[];
  earnings: { today: number; week: number; month: number };
  availability: { open_slots: number; booked_slots: number };
  quick_actions: DashboardQuickAction[];
};
