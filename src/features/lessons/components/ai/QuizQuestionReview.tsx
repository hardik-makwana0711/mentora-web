import { choiceLabel } from '@/features/lessons/lib/ai-quiz-utils';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import type { AiQuizResultQuestion } from '@/types/lesson-ai';

function answerText(choices: string[], index: number | null | undefined): string {
  if (index == null || index < 0 || index >= choices.length) return '—';
  return `${choiceLabel(index)}. ${choices[index]}`;
}

export function QuizQuestionReview({
  questions,
  title,
}: {
  questions: AiQuizResultQuestion[];
  title?: string;
}) {
  const tr = useStrings();
  const heading = title ?? tr.quizResultTitle;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-[var(--color-m-text)]">{heading}</h4>
      <ul className="space-y-3">
        {questions.map((q, index) => (
          <li
            key={q.questionId}
            className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3"
          >
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {i18n.t('questionLabel', { number: index + 1 })}
            </p>
            <p className="mt-1 text-sm text-[var(--color-m-text)]">{q.questionText}</p>
            <div className="mt-3 space-y-1 text-sm text-[var(--color-text-secondary)]">
              <p>
                {tr.answerLabel}:{' '}
                <span className="text-[var(--color-m-text)]">{answerText(q.choices, q.selectedChoiceIndex)}</span>
              </p>
              <p>
                {tr.correctLabel}:{' '}
                <span className="text-[var(--color-m-text)]">{answerText(q.choices, q.correctChoiceIndex)}</span>
              </p>
              {q.isCorrect != null ? (
                <p className={q.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {q.isCorrect ? tr.correctLabel : tr.incorrectLabel}
                </p>
              ) : null}
              {q.explanation ? (
                <p className="mt-2 text-[var(--color-text-muted)]">
                  <span className="font-medium text-[var(--color-text-secondary)]">{tr.answerLabel}: </span>
                  {q.explanation}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
