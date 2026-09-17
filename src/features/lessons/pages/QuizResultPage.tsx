import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import { fetchAiQuizResult } from '@/services/lesson-ai.service';
import { fetchSessionDetail } from '@/services/lessons.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { QuizQuestionReview } from '@/features/lessons/components/ai/QuizQuestionReview';

export default function QuizResultPage() {
  const tr = useStrings();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const reportPath = `${roleBase}/lessons/session/${sessionId}/report`;

  // Session detail is reachable by student, parent, and mentor alike (unlike the
  // student-only /ai-quiz/student endpoint), so it's the reliable source for the quiz id.
  const detailQ = useQuery({
    queryKey: sessionId ? qk.sessionDetail(sessionId) : ['sessions', 'none'],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: Boolean(sessionId),
  });

  const quizId = detailQ.data?.ai_quiz_id ?? null;

  const resultQ = useQuery({
    queryKey: quizId ? qk.aiQuizResult(quizId) : ['ai', 'quiz', 'result', 'none'],
    queryFn: () => fetchAiQuizResult(quizId!),
    enabled: Boolean(quizId),
  });

  if (!sessionId) {
    return <ErrorState title={tr.invalidSession} onRetry={() => navigate(`${roleBase}/lessons`)} />;
  }

  if (detailQ.isPending || (Boolean(quizId) && resultQ.isPending)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!quizId || detailQ.isError || resultQ.isError || !resultQ.data) {
    const onRetry = quizId ? () => void resultQ.refetch() : () => void detailQ.refetch();
    return (
      <PageContainer>
        <BackLink to={reportPath}>{tr.back}</BackLink>
        <ErrorState title={tr.resultNotAvailable} onRetry={onRetry} />
      </PageContainer>
    );
  }

  const r = resultQ.data;

  return (
    <PageContainer>
      <BackLink to={reportPath}>{tr.back}</BackLink>
      <PageHeader title={tr.quizResultTitle} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">{tr.score}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-m-text)]">
            {r.score ?? 0} / {r.totalQuestions}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">{tr.percentage}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-m-text)]">
            {r.percentage ?? 0}%
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
        <QuizQuestionReview questions={r.questions} />
      </section>
    </PageContainer>
  );
}
