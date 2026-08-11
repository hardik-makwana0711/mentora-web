import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormActions } from '@/components/ui/FormActions';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { normAxios } from '@/lib/norm-axios';
import { fetchAiQuizStudent, submitAiQuizAttempt } from '@/services/lesson-ai.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { choiceLabel } from '@/features/lessons/lib/ai-quiz-utils';
import { cn } from '@/lib/utils';

export default function StudentQuizPage() {
  const tr = useStrings();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const reportPath = `${roleBase}/lessons/session/${sessionId}/report`;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitOpen, setSubmitOpen] = useState(false);

  const quizQ = useQuery({
    queryKey: sessionId ? qk.aiQuizStudent(sessionId) : ['ai', 'quiz', 'student', 'none'],
    queryFn: () => fetchAiQuizStudent(sessionId!),
    enabled: Boolean(sessionId),
  });

  const submitM = useMutation({
    mutationFn: () => {
      const quizId = quizQ.data?.quizId;
      const questions = quizQ.data?.questions ?? [];
      if (!quizId) throw new Error(tr.quizNotAvailable);
      const payload = questions.map((q) => {
        const selected = answers[q.id];
        if (selected == null) throw new Error(tr.quizNotAvailable);
        return { questionId: q.id, selectedChoiceIndex: selected };
      });
      return submitAiQuizAttempt(quizId, { answers: payload });
    },
    onSuccess: () => {
      toast.success(tr.quizCompleted);
      setSubmitOpen(false);
      void qc.invalidateQueries({ queryKey: qk.aiQuizStudent(sessionId!) });
      void qc.invalidateQueries({ queryKey: qk.aiQuizResult(quizQ.data!.quizId!) });
      navigate(`${reportPath}/quiz/result`);
    },
    onError: (e) => toast.error(normAxios(e, tr.quizLoadError)),
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

  if (quizQ.isError || quizQ.data?.status !== 'published' || !quizQ.data.questions?.length) {
    return (
      <PageContainer>
        <BackLink to={reportPath}>{tr.back}</BackLink>
        <ErrorState title={tr.quizNotAvailable} onRetry={() => navigate(reportPath)} />
      </PageContainer>
    );
  }

  const questions = quizQ.data.questions;
  const q = questions[index];
  const total = questions.length;
  const selected = answers[q.id];
  const allAnswered = questions.every((question) => answers[question.id] != null);
  const isLast = index === total - 1;

  return (
    <PageContainer>
      <BackLink to={reportPath}>{tr.back}</BackLink>
      <PageHeader
        title={tr.quizTakeTitle}
        description={i18n.t('questionProgress', { current: index + 1, total })}
      />

      <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-5">
        <p className="text-base font-medium text-[var(--color-m-text)]">{q.questionText}</p>
        <ul className="mt-4 space-y-2">
          {q.choices.map((choice, i) => {
            const active = selected === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    active
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 text-[var(--color-m-text)]'
                      : 'border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-primary)]/40'
                  )}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                >
                  <span className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-current" />
                  <span>
                    {choiceLabel(i)}. {choice}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
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
        {!isLast ? (
          <Button
            size="sm"
            disabled={selected == null}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            {tr.loadMore}
          </Button>
        ) : (
          <Button size="sm" disabled={!allAnswered || submitM.isPending} onClick={() => setSubmitOpen(true)}>
            {tr.submit}
          </Button>
        )}
      </div>

      <Modal
        open={submitOpen}
        title={tr.submitQuizTitle}
        onClose={() => setSubmitOpen(false)}
        footer={
          <FormActions>
            <Button variant="secondary" onClick={() => setSubmitOpen(false)}>
              {tr.cancel}
            </Button>
            <Button isLoading={submitM.isPending} disabled={submitM.isPending} onClick={() => submitM.mutate()}>
              {tr.submit}
            </Button>
          </FormActions>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">{tr.viewResult}</p>
      </Modal>
    </PageContainer>
  );
}
