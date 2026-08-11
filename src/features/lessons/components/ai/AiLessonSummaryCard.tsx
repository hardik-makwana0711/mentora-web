import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { qk } from '@/constants/query-keys';
import { useStrings } from '@/constants/strings';
import type { Strings } from '@/locales/en';
import { normAxios } from '@/lib/norm-axios';
import { fetchAiSummary, generateAiSummary, patchAiSummary } from '@/services/lesson-ai.service';
import type { TranscriptStatus } from '@/types/lessons';
import { AiSectionCard } from './AiSectionCard';
import { AiLoadingState } from './AiLoadingState';
import { AiErrorState } from './AiErrorState';
import { EditAiSummaryModal } from './EditAiSummaryModal';

function summaryEmptyCopy(
  sessionStatus: string | undefined,
  status: string | undefined,
  transcriptStatus: TranscriptStatus | null | undefined,
  tr: Strings
): { title: string; description: string } {
  const planned =
    sessionStatus === 'scheduled' ||
    sessionStatus === 'rescheduled' ||
    sessionStatus === 'in_progress';

  if (transcriptStatus === 'FAILED' || status === 'failed') {
    return {
      title: tr.aiSummaryFailedTitle,
      description: tr.aiSummaryFailedDescription,
    };
  }

  if (planned) {
    return {
      title: tr.aiSummaryNotReadyPlannedTitle,
      description: tr.aiSummaryNotReadyPlannedDescription,
    };
  }

  if (transcriptStatus && transcriptStatus !== 'READY') {
    return {
      title: tr.aiSummaryProcessingTitle,
      description: tr.aiSummaryProcessingDescription,
    };
  }

  if (status === 'pending') {
    return {
      title: tr.aiSummaryProcessingTitle,
      description: tr.aiSummaryGenerating,
    };
  }

  return {
    title: tr.aiSummaryProcessingTitle,
    description: tr.aiSummaryWaitingTranscript,
  };
}

export function AiLessonSummaryCard({
  sessionId,
  isMentor,
  transcriptStatus,
  sessionStatus,
}: {
  sessionId: string;
  isMentor: boolean;
  transcriptStatus?: TranscriptStatus | null;
  sessionStatus?: string;
}) {
  const tr = useStrings();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const summaryQ = useQuery({
    queryKey: qk.aiSummary(sessionId),
    queryFn: () => fetchAiSummary(sessionId),
  });

  const saveM = useMutation({
    mutationFn: (summary: string) => patchAiSummary(sessionId, summary),
    onSuccess: (data) => {
      qc.setQueryData(qk.aiSummary(sessionId), (prev: typeof summaryQ.data) => ({
        ...prev,
        summaryId: data.summaryId,
        summary: data.summary,
        status: 'generated',
        updatedAt: data.updatedAt,
      }));
      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId) });
      toast.success(tr.aiSummaryUpdated);
      setEditOpen(false);
    },
    onError: (e) => toast.error(normAxios(e, tr.aiSummarySaveError)),
  });

  const generateM = useMutation({
    mutationFn: () => generateAiSummary(sessionId),
    onSuccess: (data) => {
      qc.setQueryData(qk.aiSummary(sessionId), data);
      void qc.invalidateQueries({ queryKey: qk.sessionDetail(sessionId) });
      toast.success(tr.aiSummaryGenerated);
    },
    onError: (e) => toast.error(normAxios(e, tr.generateAiSummaryError)),
  });

  const summaryData = summaryQ.data;
  const isEmpty =
    !summaryData?.summary ||
    summaryData.status === 'not_generated' ||
    summaryData.status === 'pending';
  const canEdit = isMentor && summaryData?.status === 'generated' && Boolean(summaryData.summary);
  const canGenerate = isMentor && transcriptStatus === 'READY' && isEmpty;

  const emptyCopy = summaryEmptyCopy(
    sessionStatus?.toLowerCase(),
    summaryData?.status,
    transcriptStatus,
    tr
  );

  return (
    <AiSectionCard
      title={tr.aiLessonSummary}
      action={
        canEdit ? (
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            {tr.editSummary}
          </Button>
        ) : null
      }
    >
      {summaryQ.isPending ? <AiLoadingState message={tr.loadingAiSummary} /> : null}

      {summaryQ.isError ? (
        <AiErrorState message={tr.aiSummaryLoadError} onRetry={() => void summaryQ.refetch()} />
      ) : null}

      {summaryQ.isSuccess && isEmpty ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-m-text)]">{emptyCopy.title}</p>
            <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">{emptyCopy.description}</p>
          </div>
          {canGenerate ? (
            <>
              {generateM.isError ? (
                <AiErrorState
                  message={tr.generateAiSummaryError}
                  onRetry={() => generateM.mutate()}
                />
              ) : null}
              <Button
                fullWidth
                isLoading={generateM.isPending}
                disabled={generateM.isPending}
                onClick={() => generateM.mutate()}
              >
                {generateM.isPending ? tr.generatingSummary : tr.generateAiSummary}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {summaryQ.isSuccess && summaryData?.summary ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
            {tr.aiSummaryTopicsCovered}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-m-text-secondary)]">
            {summaryData.summary}
          </p>
        </div>
      ) : null}

      <EditAiSummaryModal
        open={editOpen}
        initialSummary={summaryData?.summary ?? ''}
        isSaving={saveM.isPending}
        onClose={() => setEditOpen(false)}
        onSave={(summary) => saveM.mutate(summary)}
      />
    </AiSectionCard>
  );
}
