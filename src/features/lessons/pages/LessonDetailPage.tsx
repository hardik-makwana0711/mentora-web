import { useNavigate, useParams } from 'react-router-dom';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MessageCircle } from 'lucide-react';

import { toast } from 'sonner';

import { PageContainer } from '@/components/layouts/PageContainer';

import { BackLink } from '@/components/ui/BackLink';

import { PageHeader } from '@/components/ui/PageHeader';

import { Spinner } from '@/components/ui/Spinner';

import { ErrorState } from '@/components/ui/ErrorState';

import { Badge } from '@/components/ui/Badge';

import { Button } from '@/components/ui/Button';

import { Textarea } from '@/components/ui/Textarea';

import { LessonJoinButton } from '@/features/lessons/components/LessonJoinButton';

import { MeetingStatusSection } from '@/features/lessons/components/MeetingStatusSection';

import {
  formatLessonDateTime,
  formatLessonServiceName,
  sessionStatusLabel,
  shouldShowReportCta,
} from '@/features/lessons/lib/lessons-utils';

import { isActiveSessionForMeet } from '@/features/lessons/lib/session-meet-utils';

import { useRoleBase } from '@/features/profile/hooks/useRoleBase';

import { useAuthStore } from '@/app/store/authStore';

import { useRefetchOnVisible } from '@/hooks/use-refetch-on-visible';

import { qk } from '@/constants/query-keys';

import { useStrings } from '@/constants/strings';

import {

  createMentorNote,

  fetchSessionDetail,

  updateMentorNote,

} from '@/services/lessons.service';

import type { JoinableSession } from '@/types/sessions';

import { useState } from 'react';

import { Mic } from 'lucide-react';

import { EndLessonConfirmModal } from '@/features/lessons/components/EndLessonConfirmModal';

import { generateAiSummary } from '@/services/lesson-ai.service';

import {

  completeSession,

  fetchTranscriptStatus,

} from '@/services/lessons.service';

import { normAxios } from '@/lib/norm-axios';



export default function LessonDetailPage() {

  const tr = useStrings();

  const { sessionId } = useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const roleBase = useRoleBase();

  const user = useAuthStore((s) => s.user);

  const isMentor = user?.role === 'mentor';

  const qc = useQueryClient();



  const detailQ = useQuery({

    queryKey: sessionId ? qk.sessionDetail(sessionId) : ['sessions', 'none'],

    queryFn: () => fetchSessionDetail(sessionId!),

    enabled: Boolean(sessionId),

    staleTime: 0,

  });



  useRefetchOnVisible(() => {

    if (sessionId) void detailQ.refetch();

  });



  const [noteDraft, setNoteDraft] = useState('');

  const [endLessonOpen, setEndLessonOpen] = useState(false);



  const endLesson = useMutation({

    mutationFn: async () => {

      if (!sessionId) throw new Error(tr.invalidSession);

      await completeSession(sessionId);

      try {

        const transcript = await fetchTranscriptStatus(sessionId);

        if (transcript.transcriptStatus === 'READY') {

          await generateAiSummary(sessionId);

          return 'summary';

        }

      } catch {

        // Completion succeeded even if auto-summary fails.

      }

      return 'completed';

    },

    onSuccess: (result) => {

      if (result === 'summary') {

        toast.success(tr.endLessonSummarySuccess);

      } else {

        toast.success(tr.endLessonSuccess);

      }

      setEndLessonOpen(false);

      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId!) });

      void qc.invalidateQueries({ queryKey: qk.aiSummary(sessionId!) });

      navigate(`${roleBase}/lessons`);

    },

    onError: (e) => toast.error(normAxios(e, tr.endLessonFailed)),

  });



  const saveNote = useMutation({

    mutationFn: async () => {

      if (!sessionId || !noteDraft.trim()) throw new Error(tr.noteSaveFailed);

      const existing = detailQ.data?.mentor_note;

      if (existing) return updateMentorNote(sessionId, noteDraft.trim());

      return createMentorNote(sessionId, noteDraft.trim());

    },

    onSuccess: () => {

      toast.success(tr.noteSaved);

      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId!) });

    },

    onError: () => toast.error(tr.noteSaveFailed),

  });



  if (!sessionId) {

    return <ErrorState title={tr.invalidSession} onRetry={() => navigate(`${roleBase}/lessons`)} />;

  }



  if (detailQ.isPending) {

    return (

      <div className="flex min-h-[40vh] items-center justify-center">

        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />

      </div>

    );

  }



  if (detailQ.isError || !detailQ.data) {

    return (

      <PageContainer>

        <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>

        <ErrorState title={tr.lessonDetailLoadError} onRetry={() => void detailQ.refetch()} />

      </PageContainer>

    );

  }



  const d = detailQ.data;

  const participant = isMentor ? d.student_name : d.mentor_name;



  const joinSession: JoinableSession = {

    session_id: d.session_id,

    meeting_status: d.meeting_status,

    meeting_url: d.meeting_url,

    can_join: d.can_join,

    meeting_provider: d.meeting_provider,

  };



  const showMeetUi = isActiveSessionForMeet(d.status);

  const showRecordingNotice = d.status === 'scheduled' || d.status === 'rescheduled' || d.status === 'in_progress';

  const canEndLesson = isMentor && d.status === 'in_progress';



  return (

    <PageContainer>

      <BackLink to={`${roleBase}/lessons`}>{tr.backToLessons}</BackLink>

      <PageHeader title={tr.lessonDetailTitle} description={formatLessonServiceName(d.subject_name)} />



      <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">

        <div className="flex flex-wrap items-start justify-between gap-3">

          <div>

            <p className="text-lg font-semibold text-[var(--color-m-text)]">{participant}</p>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{d.topic || tr.topicNotSpecified}</p>

          </div>

          <Badge variant={d.status === 'completed' ? 'success' : 'default'}>

            {sessionStatusLabel(d.status)}

          </Badge>

        </div>

        <p className="mt-4 text-sm text-[var(--color-text-muted)]">{formatLessonDateTime(d.scheduled_at)}</p>

        <p className="text-sm text-[var(--color-text-muted)]">

          {d.duration_minutes} {tr.minutesUnit}

        </p>



        {showMeetUi ? (

          <MeetingStatusSection session={joinSession} className="mt-4" allowRetry />

        ) : null}



        {showRecordingNotice ? (

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/10 p-3">

            <Mic className="mt-0.5 size-4 shrink-0 text-[var(--color-brand-primary)]" aria-hidden />

            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{tr.recordingNotice}</p>

          </div>

        ) : null}



        <div className="mt-6 flex flex-wrap gap-2">

          {showMeetUi ? <LessonJoinButton session={joinSession} size="sm" /> : null}

          <Button

            type="button"

            variant="secondary"

            onClick={() => {

              const params = new URLSearchParams();

              params.set('participantId', isMentor ? d.student_id : d.mentor_id);

              navigate(`${roleBase}/messages?${params}`);

            }}

          >

            <MessageCircle className="size-4" />

            {tr.messageButton}

          </Button>

          {canEndLesson ? (

            <Button type="button" variant="danger" size="sm" onClick={() => setEndLessonOpen(true)}>

              {tr.endLesson}

            </Button>

          ) : null}

          {shouldShowReportCta(d.status) !== 'hide' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate(`${roleBase}/lessons/session/${d.session_id}/report`)}
            >
              {shouldShowReportCta(d.status) === 'report' ? tr.viewReport : tr.viewReportStatus}
            </Button>
          ) : null}

          {!isMentor && d.status === 'completed' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate(`${roleBase}/search`)}
            >
              {tr.requestNewLesson}
            </Button>
          ) : null}

        </div>



        {d.mentor_note?.note_content ? (

          <div className="mt-6 rounded-xl bg-[var(--color-m-bg)] p-4">

            <p className="text-xs font-medium uppercase text-[var(--color-text-muted)]">{tr.mentorNote}</p>

            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{d.mentor_note.note_content}</p>

          </div>

        ) : null}



        {isMentor ? (

          <div className="mt-6 space-y-2">

            <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.mentorNote}</p>

            <Textarea

              rows={4}

              value={noteDraft || d.mentor_note?.note_content || ''}

              onChange={(e) => setNoteDraft(e.target.value)}

              placeholder={tr.mentorNotePlaceholder}

            />

            <Button

              type="button"

              size="sm"

              disabled={saveNote.isPending}

              onClick={() => saveNote.mutate()}

            >

              {d.mentor_note ? tr.updateNote : tr.saveNote}

            </Button>

          </div>

        ) : null}

      </div>



      <EndLessonConfirmModal

        open={endLessonOpen}

        isLoading={endLesson.isPending}

        onClose={() => setEndLessonOpen(false)}

        onConfirm={() => endLesson.mutate()}

      />

    </PageContainer>

  );

}

