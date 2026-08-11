/** Shapes aligned with `apps/backend` lesson-ai module + OpenAPI schemas. */

export type AiSummaryStatus = 'generated' | 'not_generated' | 'failed' | 'pending';

export type AiSummaryResponse = {
  summaryId: string | null;
  sessionId: string;
  summary: string | null;
  status: AiSummaryStatus | string;
  message?: string | null;
  updatedAt?: string | null;
};

export type AiSummaryPatchResponse = {
  summaryId: string;
  summary: string;
  updatedAt: string;
};

export type AiQuizStatus =
  | 'quiz_not_generated'
  | 'quiz_not_published'
  | 'generated'
  | 'published'
  | 'submitted'
  | 'draft';

export type AiQuizQuestionMentor = {
  id: string;
  type: 'mcq' | string;
  questionText: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation?: string | null;
};

export type AiQuizQuestionStudent = {
  id: string;
  type: 'mcq' | string;
  questionText: string;
  choices: string[];
};

export type AiQuizMentorResponse = {
  status: AiQuizStatus | string;
  quizId?: string | null;
  title?: string | null;
  questionCount?: number | null;
  timeLimitMinutes?: number | null;
  generationCount?: number | null;
  questions?: AiQuizQuestionMentor[];
  quiz?: null;
};

export type AiQuizStudentResponse = {
  status: AiQuizStatus | string;
  quizId?: string | null;
  timeLimitMinutes?: number | null;
  attempt?: unknown | null;
  questions?: AiQuizQuestionStudent[];
  attemptId?: string | null;
  score?: number | null;
  totalQuestions?: number | null;
  percentage?: number | null;
  quiz?: null;
};

export type AiQuizGenerateRequest = {
  questionCount: number;
  timeLimitMinutes: number | null;
};

export type AiQuizGenerateResponse = {
  quizId: string;
  sessionId: string;
  status: string;
  questionCount: number;
  timeLimitMinutes: number | null;
};

export type AiQuizPatchQuestion = {
  id?: string;
  questionText: string;
  choices: [string, string, string, string];
  correctChoiceIndex: number;
  explanation?: string | null;
};

export type AiQuizPatchRequest = {
  timeLimitMinutes?: number | null;
  questions?: AiQuizPatchQuestion[];
};

export type AiQuizPublishResponse = {
  quizId: string;
  status: string;
  publishedAt: string | null;
};

export type AiQuizAttemptAnswer = {
  questionId: string;
  selectedChoiceIndex: number;
};

export type AiQuizAttemptSubmitRequest = {
  answers: AiQuizAttemptAnswer[];
};

export type AiQuizAttemptSubmitResponse = {
  attemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    selectedChoiceIndex: number;
    correctChoiceIndex: number;
    isCorrect: boolean;
    explanation?: string | null;
  }>;
};

export type AiQuizResultQuestion = {
  questionId: string;
  questionText: string;
  choices: string[];
  selectedChoiceIndex: number | null;
  correctChoiceIndex: number | null;
  isCorrect: boolean | null;
  explanation?: string | null;
};

export type AiQuizResultResponse = {
  quizId: string;
  studentId: string;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number;
  percentage: number | null;
  questions: AiQuizResultQuestion[];
};
