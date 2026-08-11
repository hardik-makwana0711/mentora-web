import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/Spinner';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import { fetchQuizDetail } from '@/services/lessons.service';
import type { LessonRole, SessionDetail, TranscriptStatus } from '@/types/lessons';
import { AiLessonSummaryCard } from '@/features/lessons/components/ai/AiLessonSummaryCard';
import { AiTranscriptCard } from '@/features/lessons/components/ai/AiTranscriptCard';
import { AiQuizStatusCard } from '@/features/lessons/components/ai/AiQuizStatusCard';
import { ReviewRatingCard } from '@/features/lessons/components/ai/ReviewRatingCard';
import { MentorEvaluationCard } from '@/features/lessons/components/ai/MentorEvaluationCard';

export function LessonReportSections({
  detail,
  role,
  aiQuizIdOverride,
  transcriptStatus,
}: {
  detail: SessionDetail;
  role: LessonRole;
  aiQuizIdOverride?: string | null;
  transcriptStatus?: TranscriptStatus | null;
}) {
  const tr = useStrings();
  const primaryQuizId = detail.quizzes[0]?.quiz_id;

  const legacyQuizQ = useQuery({
    queryKey: primaryQuizId ? qk.quizDetail(primaryQuizId) : ['quizzes', 'none'],
    queryFn: () => fetchQuizDetail(primaryQuizId!),
    enabled: Boolean(primaryQuizId),
  });

  const legacyAnsweredQuestions =
    legacyQuizQ.data?.questions.filter((q) => q.selected_answer != null && q.selected_answer !== '') ??
    [];

  const resolvedAiQuizId = aiQuizIdOverride ?? detail.ai_quiz_id ?? null;
  const isMentor = role === 'mentor';

  return (
    <div className="space-y-4">
      {isMentor ? (
        <AiTranscriptCard sessionId={detail.session_id} transcriptStatus={transcriptStatus} />
      ) : null}

      <AiLessonSummaryCard
        sessionId={detail.session_id}
        isMentor={role === 'mentor'}
        transcriptStatus={transcriptStatus}
        sessionStatus={detail.status}
      />

      <AiQuizStatusCard
        sessionId={detail.session_id}
        role={role}
        aiQuizStatus={detail.ai_quiz_status}
        aiQuizId={resolvedAiQuizId}
        aiQuizQuestionCount={detail.ai_quiz_question_count}
        aiQuizTimeLimitMinutes={detail.ai_quiz_time_limit_minutes}
      />

      <ReviewRatingCard sessionStatus={detail.status} />

      <MentorEvaluationCard detail={detail} />

      {primaryQuizId ? (
        <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.legacyQuizAnswers}</h3>
          {legacyQuizQ.isPending ? (
            <div className="flex justify-center py-4">
              <Spinner className="size-6 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)]" />
            </div>
          ) : legacyAnsweredQuestions.length > 0 ? (
            <ul className="space-y-3">
              {legacyAnsweredQuestions.map((q, index) => (
                <li
                  key={q.question_id}
                  className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3"
                >
                  <p className="text-xs font-medium text-[var(--color-m-text-muted)]">
                    {i18n.t('questionLabel', { number: index + 1 })}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-m-text)]">{q.question_text}</p>
                  <p className="mt-2 text-sm text-[var(--color-m-text-secondary)]">
                    {tr.answerLabel}: <span className="text-[var(--color-m-text)]">{q.selected_answer}</span>
                    {q.is_correct != null ? (
                      <span className={q.is_correct ? ' text-emerald-400' : ' text-red-400'}>
                        {' '}
                        ({q.is_correct ? tr.correctLabel : tr.incorrectLabel})
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : legacyQuizQ.data && legacyQuizQ.data.questions.length > 0 ? (
            <p className="text-sm italic text-[var(--color-m-text-muted)]">{tr.legacyQuizAnswersPending}</p>
          ) : (
            <p className="text-sm italic text-[var(--color-m-text-muted)]">{tr.noLegacyQuizAnswers}</p>
          )}
        </section>
      ) : null}

      {detail.quizzes.length > 0 ? (
        <section className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-m-text)]">{tr.legacyQuizzes}</h3>
          <ul className="space-y-2">
            {detail.quizzes.map((q) => (
              <li key={q.quiz_id} className="text-sm text-[var(--color-m-text-secondary)]">
                {q.question_count} · {q.score != null ? `${tr.score}: ${q.score}` : tr.noScore}
                {q.created_by ? ` · ${q.created_by}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
