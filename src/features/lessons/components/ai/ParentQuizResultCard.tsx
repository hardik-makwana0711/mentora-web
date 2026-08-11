import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { fetchAiQuizResult } from '@/services/lesson-ai.service';
import { formatQuestionCount, formatTimeLimit } from '@/features/lessons/lib/ai-quiz-utils';
import i18n from '@/i18n';
import { AiSectionCard } from './AiSectionCard';
import { AiLoadingState } from './AiLoadingState';
import { QuizQuestionReview } from './QuizQuestionReview';

export function ParentQuizResultCard({
  quizId,
  aiQuizStatus,
  questionCount,
  timeLimitMinutes,
  sessionId,
}: {
  quizId: string | null;
  aiQuizStatus: string | null | undefined;
  questionCount?: number | null;
  timeLimitMinutes?: number | null;
  sessionId?: string;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const resultQ = useQuery({
    queryKey: quizId ? qk.aiQuizResult(quizId) : ['ai', 'quiz', 'result', 'none'],
    queryFn: () => fetchAiQuizResult(quizId!),
    enabled: Boolean(quizId),
    retry: false,
  });

  if (aiQuizStatus !== 'published' && aiQuizStatus !== 'submitted' && !resultQ.isSuccess) {
    return (
      <AiSectionCard title={tr.aiQuiz}>
        <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.quizNotAssignedTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{tr.quizNotAssignedDescription}</p>
      </AiSectionCard>
    );
  }

  if (
    (aiQuizStatus === 'published' || aiQuizStatus === 'generated') &&
    !resultQ.isSuccess &&
    !resultQ.isPending
  ) {
    return (
      <AiSectionCard title={tr.aiQuiz}>
        <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.quizAssignedTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
          {tr.quizAssignedWaitingDescription}
        </p>
        {questionCount != null ? (
          <p className="mt-3 text-sm text-[var(--color-m-text-muted)]">
            {formatQuestionCount(questionCount)} · {formatTimeLimit(timeLimitMinutes)}
          </p>
        ) : null}
      </AiSectionCard>
    );
  }

  if (quizId && resultQ.isPending) {
    return (
      <AiSectionCard title={tr.aiQuiz}>
        <AiLoadingState message={tr.loadingQuiz} />
      </AiSectionCard>
    );
  }

  if (quizId && resultQ.isError) {
    return (
      <AiSectionCard title={tr.aiQuiz}>
        <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.quizAssignedTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
          {tr.quizAssignedWaitingDescription}
        </p>
      </AiSectionCard>
    );
  }

  if (!resultQ.data) return null;

  const r = resultQ.data;

  return (
    <AiSectionCard title={tr.quizResultTitle}>
      <div className="mb-4 space-y-2 text-sm">
        <p className="font-medium text-[var(--color-m-text)]">
          {i18n.t('quizResultScore', { score: r.score ?? 0, total: r.totalQuestions })}
        </p>
        <p className="text-[var(--color-m-text-secondary)]">{tr.quizResultCompletionStatus}</p>
        {r.submittedAt ? (
          <p className="text-[var(--color-m-text-muted)]">
            {i18n.t('quizResultCompletedAt', { date: r.submittedAt })}
          </p>
        ) : null}
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
          <p className="text-xs text-[var(--color-m-text-muted)]">{tr.score}</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">
            {r.score ?? 0} / {r.totalQuestions}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3">
          <p className="text-xs text-[var(--color-m-text-muted)]">{tr.percentage}</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">{r.percentage ?? 0}%</p>
        </div>
      </div>
      <QuizQuestionReview questions={r.questions} title={tr.studentQuizResult} />
      {sessionId ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-4"
          onClick={() => navigate(`${roleBase}/lessons/session/${sessionId}/report/quiz/result`)}
        >
          {tr.viewQuizResults}
        </Button>
      ) : null}
    </AiSectionCard>
  );
}
