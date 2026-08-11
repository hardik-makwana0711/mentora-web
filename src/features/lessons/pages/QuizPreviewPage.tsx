import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { fetchAiQuizMentor } from '@/services/lesson-ai.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { choiceLabel } from '@/features/lessons/lib/ai-quiz-utils';

export default function QuizPreviewPage() {
  const tr = useStrings();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [index, setIndex] = useState(0);

  const reportPath = `${roleBase}/lessons/session/${sessionId}/report`;

  const quizQ = useQuery({
    queryKey: sessionId ? qk.aiQuizMentor(sessionId) : ['ai', 'quiz', 'mentor', 'none'],
    queryFn: () => fetchAiQuizMentor(sessionId!),
    enabled: Boolean(sessionId),
  });

  if (!sessionId) {
    return <ErrorState title={tr.invalidSession} onRetry={() => navigate(`${roleBase}/lessons`)} />;
  }

  if (quizQ.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-10 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (quizQ.isError || !quizQ.data?.questions?.length) {
    return (
      <PageContainer>
        <BackLink to={reportPath}>{tr.back}</BackLink>
        <ErrorState title={tr.quizNotAvailable} onRetry={() => void quizQ.refetch()} />
      </PageContainer>
    );
  }

  const questions = quizQ.data.questions;
  const q = questions[index];
  const total = questions.length;

  return (
    <PageContainer>
      <BackLink to={reportPath}>{tr.back}</BackLink>
      <PageHeader
        title={tr.quizPreviewTitle}
        description={i18n.t('questionProgress', { current: index + 1, total })}
      />

      <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
        <p className="text-base font-medium text-[var(--color-m-text)]">{q.questionText}</p>
        <ul className="mt-4 space-y-2">
          {q.choices.map((choice, i) => (
            <li key={i} className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
              {choiceLabel(i)}. {choice}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-emerald-400">
          {tr.correctLabel}: {choiceLabel(q.correctChoiceIndex)}. {q.choices[q.correctChoiceIndex]}
        </p>
        {q.explanation ? (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{q.explanation}</p>
        ) : null}
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          {tr.back}
        </Button>
        {index < total - 1 ? (
          <Button size="sm" onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
            {tr.loadMore}
          </Button>
        ) : null}
      </div>
    </PageContainer>
  );
}
