import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Eye, FileText } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';

import { qk } from '@/constants/query-keys';

import { useStrings } from '@/constants/strings';

import type { Strings } from '@/locales/en';

import { fetchTranscript } from '@/services/lessons.service';

import type { TranscriptStatus } from '@/types/lessons';

import { AiSectionCard } from './AiSectionCard';

import { AiLoadingState } from './AiLoadingState';

import { AiErrorState } from './AiErrorState';

import { EmptyAiState } from './EmptyAiState';



function statusLabel(status: TranscriptStatus, tr: Strings): string {

  switch (status) {

    case 'READY':

      return tr.sessionStatusCompleted;

    case 'IN_PROGRESS':

      return tr.sessionStatusInProgress;

    case 'SCHEDULED':

      return tr.sessionStatusScheduled;

    case 'FAILED':

      return tr.transcriptFailed;

    default:

      return tr.transcriptNotScheduled;

  }

}



export function AiTranscriptCard({

  sessionId,

  transcriptStatus,

}: {

  sessionId: string;

  transcriptStatus?: TranscriptStatus | null;

}) {

  const tr = useStrings();

  const [viewOpen, setViewOpen] = useState(false);

  const status = transcriptStatus ?? 'NOT_SCHEDULED';

  const canLoadText = status === 'READY';



  const transcriptQ = useQuery({

    queryKey: qk.sessionTranscript(sessionId),

    queryFn: () => fetchTranscript(sessionId),

    enabled: canLoadText,

  });



  const text = transcriptQ.data?.transcriptText?.trim() ?? '';



  return (

    <>

      <AiSectionCard title={tr.lessonTranscript}>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-m-bg)] px-2.5 py-1">

          <span className="size-1.5 rounded-full bg-[var(--color-brand-primary)]" />

          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{statusLabel(status, tr)}</span>

        </div>



        {canLoadText && transcriptQ.isPending ? <AiLoadingState message={tr.transcriptLoading} /> : null}

        {canLoadText && transcriptQ.isError ? (

          <AiErrorState message={tr.transcriptTextUnavailable} onRetry={() => void transcriptQ.refetch()} />

        ) : null}



        {!canLoadText ? (

          <EmptyAiState

            message={

              status === 'FAILED'

                ? tr.transcriptFailedDetail

                : status === 'NOT_SCHEDULED'

                  ? tr.transcriptNotScheduled

                  : tr.transcriptNotReady

            }

          />

        ) : null}



        {canLoadText && transcriptQ.isSuccess && !text ? (

          <EmptyAiState message={tr.transcriptTextUnavailable} />

        ) : null}



        {canLoadText && text ? (

          <div className="space-y-3">

            <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{text}</p>

            <Button type="button" size="sm" variant="secondary" onClick={() => setViewOpen(true)}>

              <Eye className="size-4" />

              {tr.viewFullTranscript}

            </Button>

          </div>

        ) : null}

      </AiSectionCard>



      <Modal open={viewOpen} title={tr.lessonTranscript} onClose={() => setViewOpen(false)}>

        <div className="flex items-center gap-2 pb-3 text-[var(--color-text-muted)]">

          <FileText className="size-4" aria-hidden />

          <span className="text-xs">{tr.fullSessionTranscript}</span>

        </div>

        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">

          {text}

        </div>

      </Modal>

    </>

  );

}

