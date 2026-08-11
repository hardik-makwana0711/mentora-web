/** Google Meet session fields from `GET /sessions/upcoming` and dashboard payloads. */

export type SessionMeetingStatus = 'PENDING' | 'READY' | 'FAILED';

export type SessionMeetingProvider = 'GOOGLE_MEET';

/** Minimal fields required for join button / meeting status UI. */
export type JoinableSession = {
  session_id: string;
  meeting_status?: SessionMeetingStatus | null;
  meeting_url?: string | null;
  can_join?: boolean;
  meeting_provider?: SessionMeetingProvider | string | null;
};

export type UpcomingSession = {
  id: string;
  subject: string;
  topic: string | null;
  mentor_name: string;
  student_name: string;
  start_time: string;
  end_time: string;
  meeting_provider: SessionMeetingProvider | string;
  meeting_status: SessionMeetingStatus;
  meeting_url: string | null;
  meeting_error?: string | null;
  can_join: boolean;
};

export type GenerateMeetingLinkResponse = {
  session_id: string;
  meeting_status: SessionMeetingStatus;
  meeting_url: string | null;
  meeting_error?: string | null;
};
