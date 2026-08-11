import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormActions } from '@/components/ui/FormActions';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { normAxios } from '@/lib/norm-axios';
import {
  fetchAiQuizMentor,
  fetchAiQuizResult,
  fetchAiQuizStudent,
  generateAiQuiz,
  publishAiQuiz,
} from '@/services/lesson-ai.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import {
  formatQuestionCount,
  formatTimeLimit,
  readAiQuizIdForSession,
  storeAiQuizIdForSession,
  timeLimitMinutesFromValue,
} from '@/features/lessons/lib/ai-quiz-utils';
import type { LessonRole } from '@/types/lessons';
import { AiSectionCard } from './AiSectionCard';
import { AiLoadingState } from './AiLoadingState';
import { AiErrorState } from './AiErrorState';
import { EmptyAiState } from './EmptyAiState';
import { QuestionCountPicker } from './QuestionCountPicker';
import { TimeLimitPicker } from './TimeLimitPicker';
import { MentorQuizActions } from './MentorQuizActions';
import { ParentQuizResultCard } from './ParentQuizResultCard';
import { QuizQuestionReview } from './QuizQuestionReview';

export function AiQuizStatusCard({
  sessionId,
  role,
  aiQuizStatus,
  aiQuizId,
  aiQuizQuestionCount,
  aiQuizTimeLimitMinutes,
}: {
  sessionId: string;
  role: LessonRole;
  aiQuizStatus?: string | null;
  aiQuizId?: string | null;
  aiQuizQuestionCount?: number | null;
  aiQuizTimeLimitMinutes?: number | null;
}) {
  const tr = useStrings();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimitValue, setTimeLimitValue] = useState('none');
  const [publishOpen, setPublishOpen] = useState(false);

  const isMentor = role === 'mentor';
  const isStudent = role === 'student';
  const isParent = role === 'parent';

  const mentorQ = useQuery({
    queryKey: qk.aiQuizMentor(sessionId),
    queryFn: () => fetchAiQuizMentor(sessionId),
    enabled: isMentor,
  });

  const studentQ = useQuery({
    queryKey: qk.aiQuizStudent(sessionId),
    queryFn: () => fetchAiQuizStudent(sessionId),
    enabled: isStudent,
  });

  const mentorQuizId = mentorQ.data?.quizId ?? null;
  const studentQuizId = studentQ.data?.quizId ?? null;

  if (aiQuizId) storeAiQuizIdForSession(sessionId, aiQuizId);
  if (mentorQuizId) storeAiQuizIdForSession(sessionId, mentorQuizId);
  if (studentQuizId) storeAiQuizIdForSession(sessionId, studentQuizId);

  const storedQuizId = readAiQuizIdForSession(sessionId);
  const resolvedQuizId = isMentor
    ? mentorQuizId ?? aiQuizId ?? storedQuizId
    : isStudent
      ? studentQuizId ?? aiQuizId ?? storedQuizId
      : aiQuizId ?? storedQuizId;

  const mentorResultQ = useQuery({
    queryKey: mentorQuizId ? qk.aiQuizResult(mentorQuizId) : ['ai', 'quiz', 'result', 'mentor-none'],
    queryFn: () => fetchAiQuizResult(mentorQuizId!),
    enabled: isMentor && Boolean(mentorQuizId) && mentorQ.data?.status === 'published',
    retry: false,
  });

  const generateM = useMutation({
    mutationFn: () =>
      generateAiQuiz(sessionId, {
        questionCount,
        timeLimitMinutes: timeLimitMinutesFromValue(timeLimitValue),
      }),
    onSuccess: (data) => {
      storeAiQuizIdForSession(sessionId, data.quizId);
      toast.success(tr.quizGenerated);
      void qc.invalidateQueries({ queryKey: qk.aiQuizMentor(sessionId) });
      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId) });
    },
    onError: (e) => toast.error(normAxios(e, tr.generateQuizError)),
  });

  const publishM = useMutation({
    mutationFn: () => publishAiQuiz(mentorQuizId!),
    onSuccess: () => {
      if (mentorQuizId) storeAiQuizIdForSession(sessionId, mentorQuizId);
      toast.success(tr.quizPublished);
      setPublishOpen(false);
      void qc.invalidateQueries({ queryKey: qk.aiQuizMentor(sessionId) });
      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId) });
    },
    onError: (e) => toast.error(normAxios(e, tr.publishQuizError)),
  });

  if (isParent) {
    return (
      <ParentQuizResultCard
        quizId={resolvedQuizId}
        aiQuizStatus={aiQuizStatus ?? null}
        questionCount={aiQuizQuestionCount ?? mentorQ.data?.questionCount}
        timeLimitMinutes={aiQuizTimeLimitMinutes ?? mentorQ.data?.timeLimitMinutes}
        sessionId={sessionId}
      />
    );
  }

  const reportBase = `${roleBase}/lessons/session/${sessionId}/report`;

  if (isMentor) {
    if (mentorQ.isPending) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <AiLoadingState message={tr.loadingQuiz} />
        </AiSectionCard>
      );
    }

    if (mentorQ.isError) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <AiErrorState message={tr.quizLoadError} onRetry={() => void mentorQ.refetch()} />
        </AiSectionCard>
      );
    }

    const mentorData = mentorQ.data;
    const notGenerated = mentorData?.status === 'quiz_not_generated' || !mentorData?.quizId;

    if (notGenerated) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <EmptyAiState message={tr.quizNotGenerated} />
          <div className="mt-4">
            <QuestionCountPicker value={questionCount} onChange={setQuestionCount} />
            <TimeLimitPicker value={timeLimitValue} onChange={setTimeLimitValue} />
            {generateM.isError ? (
              <div className="mb-4">
                <AiErrorState
                  message={tr.generateQuizError}
                  onRetry={() => generateM.mutate()}
                />
              </div>
            ) : null}
            <Button
              fullWidth
              isLoading={generateM.isPending}
              disabled={generateM.isPending}
              onClick={() => generateM.mutate()}
            >
              {generateM.isPending ? tr.generatingQuiz : tr.generateQuiz}
            </Button>
          </div>
        </AiSectionCard>
      );
    }

    const isPublished = mentorData.status === 'published';

    if (isPublished && mentorResultQ.isSuccess && mentorResultQ.data) {
      const r = mentorResultQ.data;
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <p className="mb-4 text-sm font-medium text-[var(--color-m-text)]">{tr.studentQuizResult}</p>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">{tr.score}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
                {r.score ?? 0} / {r.totalQuestions}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">{tr.percentage}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">{r.percentage ?? 0}%</p>
            </div>
          </div>
          <QuizQuestionReview questions={r.questions} />
        </AiSectionCard>
      );
    }

    return (
      <AiSectionCard title={tr.aiQuiz}>
        <MentorQuizActions
          sessionId={sessionId}
          quiz={mentorData}
          isPublished={isPublished}
          isPublishing={publishM.isPending}
          onPublish={() => setPublishOpen(true)}
        />
        <Modal
          open={publishOpen}
          title={tr.publishQuizTitle}
          onClose={() => setPublishOpen(false)}
          footer={
            <FormActions>
              <Button variant="secondary" onClick={() => setPublishOpen(false)}>
                {tr.cancel}
              </Button>
              <Button isLoading={publishM.isPending} onClick={() => publishM.mutate()}>
                {tr.publishQuiz}
              </Button>
            </FormActions>
          }
        >
          <p className="text-sm text-[var(--color-text-secondary)]">{tr.publishQuizBody}</p>
        </Modal>
      </AiSectionCard>
    );
  }

  if (isStudent) {
    if (studentQ.isPending) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <AiLoadingState message={tr.loadingQuiz} />
        </AiSectionCard>
      );
    }

    if (studentQ.isError) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <AiErrorState message={tr.quizLoadError} onRetry={() => void studentQ.refetch()} />
        </AiSectionCard>
      );
    }

    const studentData = studentQ.data;

    if (studentData?.status === 'quiz_not_published') {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <EmptyAiState message={tr.quizNotAssigned} />
        </AiSectionCard>
      );
    }

    if (studentData?.status === 'submitted' && studentData.quizId) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <p className="mb-3 text-sm text-[var(--color-text-secondary)]">{tr.quizCompleted}</p>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">{tr.score}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
                {studentData.score ?? 0} / {studentData.totalQuestions ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">{tr.percentage}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">{studentData.percentage ?? 0}%</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate(`${reportBase}/quiz/result`)}>
            {tr.viewResult}
          </Button>
        </AiSectionCard>
      );
    }

    if (studentData?.status === 'published' && studentData.questions?.length) {
      return (
        <AiSectionCard title={tr.aiQuiz}>
          <p className="text-sm text-[var(--color-text-secondary)]">{tr.quizAssignedDescription}</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {formatQuestionCount(studentData.questions.length)} ·{' '}
            {formatTimeLimit(studentData.timeLimitMinutes)}
          </p>
          <Button className="mt-4" onClick={() => navigate(`${reportBase}/quiz/take`)}>
            {tr.startQuiz}
          </Button>
        </AiSectionCard>
      );
    }

    return (
      <AiSectionCard title={tr.aiQuiz}>
        <EmptyAiState message={tr.quizNotAssigned} />
      </AiSectionCard>
    );
  }

  return null;
}
