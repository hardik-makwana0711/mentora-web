import { toast } from 'sonner';
import i18n from '@/i18n';
import { joinSession } from '@/services/lessons.service';

import type { JoinableSession, SessionMeetingStatus } from '@/types/sessions';

export type JoinButtonState = {
  disabled: boolean;
  label: string;
  hint?: string;
};

export function getJoinButtonState(
  session: Pick<JoinableSession, 'meeting_status' | 'can_join' | 'meeting_url'>,
): JoinButtonState {
  const status: SessionMeetingStatus = session.meeting_status ?? 'PENDING';

  if (status === 'PENDING') {
    return {
      disabled: true,
      label: i18n.t('meetJoinPending'),
      hint: i18n.t('meetJoinPendingHint'),
    };
  }
  if (status === 'FAILED') {
    return {
      disabled: true,
      label: i18n.t('meetJoinFailed'),
      hint: i18n.t('meetJoinFailedHint'),
    };
  }
  if (status === 'READY' && !session.can_join) {
    return { disabled: true, label: i18n.t('meetJoinNotYet') };
  }
  if (status === 'READY' && session.can_join && session.meeting_url?.trim()) {
    return { disabled: false, label: i18n.t('meetJoinActive') };
  }
  return { disabled: true, label: i18n.t('meetJoinNoLink') };
}

/** Opens Google Meet when join is allowed; validates again via `POST /sessions/:id/join`. */
export async function openLessonMeet(sessionId: string, session: JoinableSession): Promise<void> {
  const state = getJoinButtonState(session);
  if (state.disabled) return;

  try {
    const result = await joinSession(sessionId);
    if (result.join_allowed && result.meeting_url) {
      window.open(result.meeting_url, '_blank', 'noopener,noreferrer');
      return;
    }
    toast.info(result.join_reason ?? i18n.t('lessonsJoinNotAllowed'));
  } catch {
    const fallback = session.meeting_url?.trim();
    if (session.can_join && fallback) {
      window.open(fallback, '_blank', 'noopener,noreferrer');
      return;
    }
    toast.error(i18n.t('lessonsJoinFailed'));
  }
}

export function upcomingToJoinable(row: {
  id: string;
  meeting_status: SessionMeetingStatus;
  meeting_url: string | null;
  can_join: boolean;
  meeting_provider?: string | null;
}): JoinableSession {
  return {
    session_id: row.id,
    meeting_status: row.meeting_status,
    meeting_url: row.meeting_url,
    can_join: row.can_join,
    meeting_provider: row.meeting_provider ?? 'GOOGLE_MEET',
  };
}
