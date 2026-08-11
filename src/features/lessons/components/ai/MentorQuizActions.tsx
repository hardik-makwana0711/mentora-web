import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useRoleBase } from '@/features/profile/hooks/useRoleBase';
import { useStrings } from '@/constants/strings';
import { formatQuestionCount, formatTimeLimit } from '@/features/lessons/lib/ai-quiz-utils';
import type { AiQuizMentorResponse } from '@/types/lesson-ai';

export function MentorQuizActions({
  sessionId,
  quiz,
  isPublished,
  onPublish,
  isPublishing,
}: {
  sessionId: string;
  quiz: AiQuizMentorResponse;
  isPublished: boolean;
  onPublish: () => void;
  isPublishing: boolean;
}) {
  const tr = useStrings();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const base = `${roleBase}/lessons/session/${sessionId}/report`;

  if (!quiz.quizId || quiz.status === 'quiz_not_generated') return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[var(--color-m-text)]">{tr.quizGenerated}</p>
        {quiz.questionCount != null ? (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {formatQuestionCount(quiz.questionCount)}
          </p>
        ) : null}
        <p className="text-sm text-[var(--color-text-secondary)]">
          {formatTimeLimit(quiz.timeLimitMinutes)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate(`${base}/quiz/preview`)}>
          {tr.quizPreviewTitle}
        </Button>
        {!isPublished ? (
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate(`${base}/quiz/edit`)}>
              {tr.quizEditTitle}
            </Button>
            <Button size="sm" isLoading={isPublishing} onClick={onPublish}>
              {tr.publishQuiz}
            </Button>
          </>
        ) : (
          <p className="text-sm text-emerald-400">{tr.quizPublished}</p>
        )}
      </div>
    </div>
  );
}
