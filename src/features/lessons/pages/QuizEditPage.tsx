import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layouts/PageContainer';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { TimeLimitPicker } from '@/features/lessons/components/ai/TimeLimitPicker';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { normAxios } from '@/lib/norm-axios';
import { fetchAiQuizMentor, patchAiQuiz } from '@/services/lesson-ai.service';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { TIME_LIMIT_OPTIONS, choiceLabel, timeLimitMinutesFromValue } from '@/features/lessons/lib/ai-quiz-utils';
import type { AiQuizPatchQuestion } from '@/types/lesson-ai';
import type { Strings } from '@/locales/en';

type EditableQuestion = {
  id?: string;
  questionText: string;
  choices: [string, string, string, string];
  correctChoiceIndex: number;
  explanation: string;
};

function toEditable(q: {
  id: string;
  questionText: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation?: string | null;
}): EditableQuestion {
  const choices = [...q.choices, '', '', '', ''].slice(0, 4) as [string, string, string, string];
  return {
    id: q.id,
    questionText: q.questionText,
    choices,
    correctChoiceIndex: q.correctChoiceIndex,
    explanation: q.explanation ?? '',
  };
}

function validateQuestions(questions: EditableQuestion[], tr: Strings): string | null {
  if (questions.length < 1) return tr.quizNotAvailable;
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    if (!q.questionText.trim()) return i18n.t('questionLabel', { number: i + 1 });
    if (q.choices.some((c) => !c.trim())) return i18n.t('questionLabel', { number: i + 1 });
  }
  return null;
}

export default function QuizEditPage() {
  const tr = useStrings();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const qc = useQueryClient();
  const reportPath = `${roleBase}/lessons/session/${sessionId}/report`;

  const [timeLimitValue, setTimeLimitValue] = useState('none');
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);

  const quizQ = useQuery({
    queryKey: sessionId ? qk.aiQuizMentor(sessionId) : ['ai', 'quiz', 'mentor', 'none'],
    queryFn: () => fetchAiQuizMentor(sessionId!),
    enabled: Boolean(sessionId),
  });

  useEffect(() => {
    if (!quizQ.data) return;
    const minutes = quizQ.data.timeLimitMinutes;
    const match = TIME_LIMIT_OPTIONS.find((o) => o.minutes === minutes);
    setTimeLimitValue(match?.value ?? 'none');
    setQuestions((quizQ.data.questions ?? []).map(toEditable));
  }, [quizQ.data]);

  const saveM = useMutation({
    mutationFn: async () => {
      const err = validateQuestions(questions, tr);
      if (err) throw new Error(err);
      const quizId = quizQ.data?.quizId;
      if (!quizId) throw new Error(tr.quizNotAvailable);

      const payload: { timeLimitMinutes: number | null; questions: AiQuizPatchQuestion[] } = {
        timeLimitMinutes: timeLimitMinutesFromValue(timeLimitValue),
        questions: questions.map((q) => ({
          id: q.id,
          questionText: q.questionText.trim(),
          choices: q.choices.map((c) => c.trim()) as [string, string, string, string],
          correctChoiceIndex: q.correctChoiceIndex,
          explanation: q.explanation.trim() || null,
        })),
      };
      return patchAiQuiz(quizId, payload);
    },
    onSuccess: () => {
      toast.success(tr.listingUpdated);
      void qc.invalidateQueries({ queryKey: qk.aiQuizMentor(sessionId!) });
      navigate(reportPath);
    },
    onError: (e) => toast.error(normAxios(e, e instanceof Error ? e.message : tr.quizLoadError)),
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

  if (quizQ.isError || quizQ.data?.status === 'published') {
    return (
      <PageContainer>
        <BackLink to={reportPath}>{tr.back}</BackLink>
        <ErrorState title={tr.quizNotAvailable} onRetry={() => navigate(reportPath)} />
      </PageContainer>
    );
  }

  const updateQuestion = (idx: number, patch: Partial<EditableQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateChoice = (qIdx: number, cIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const choices = [...q.choices] as [string, string, string, string];
        choices[cIdx] = value;
        return { ...q, choices };
      })
    );
  };

  return (
    <PageContainer>
      <BackLink to={reportPath}>{tr.back}</BackLink>
      <PageHeader title={tr.quizEditTitle} />

      <section className="mb-6 rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
        <TimeLimitPicker value={timeLimitValue} onChange={setTimeLimitValue} />
      </section>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <section
            key={q.id ?? `new-${qIdx}`}
            className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">
              {i18n.t('questionLabel', { number: qIdx + 1 })}
            </h3>
            <Textarea
              value={q.questionText}
              onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
              rows={3}
            />
            {q.choices.map((choice, cIdx) => (
              <Input
                key={cIdx}
                label={choiceLabel(cIdx)}
                value={choice}
                onChange={(e) => updateChoice(qIdx, cIdx, e.target.value)}
              />
            ))}
            <DropdownSelect
              label={tr.correctLabel}
              value={String(q.correctChoiceIndex)}
              onChange={(v) => updateQuestion(qIdx, { correctChoiceIndex: Number(v) })}
              options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: choiceLabel(i) }))}
            />
            <Textarea
              value={q.explanation}
              onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
              rows={2}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={questions.length <= 1}
              onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
            >
              {tr.cancel}
            </Button>
          </section>
        ))}
      </div>

      <Button className="mt-6" fullWidth isLoading={saveM.isPending} onClick={() => saveM.mutate()}>
        {tr.saveListingChanges}
      </Button>
    </PageContainer>
  );
}
