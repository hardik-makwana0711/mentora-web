import type { SessionDetail } from '@/types/lessons';
import { useStrings } from '@/constants/strings';
import { AiSectionCard } from './AiSectionCard';
import { EmptyAiState } from './EmptyAiState';

function formatMetric(value: string | number | null | undefined, suffix = ''): string {
  if (value == null || value === '') return '—';
  return `${value}${suffix}`;
}

export function MentorEvaluationCard({ detail }: { detail: SessionDetail }) {
  const tr = useStrings();
  const hasMetrics =
    detail.participation_level != null ||
    detail.understanding_score != null ||
    detail.engagement_score != null ||
    detail.knowledge_gap != null;
  const hasNote = Boolean(detail.mentor_note?.note_content);
  const planned =
    detail.status === 'scheduled' ||
    detail.status === 'rescheduled' ||
    detail.status === 'in_progress';

  return (
    <AiSectionCard title={tr.mentorNote}>
      {hasMetrics ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: tr.participationLevel, value: formatMetric(detail.participation_level) },
            {
              label: tr.understandingScore,
              value: formatMetric(
                detail.understanding_score,
                detail.understanding_score != null ? '%' : ''
              ),
            },
            {
              label: tr.engagementScore,
              value: formatMetric(
                detail.engagement_score,
                detail.engagement_score != null ? '%' : ''
              ),
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-bg)] p-3 text-center"
            >
              <p className="text-xs text-[var(--color-m-text-muted)]">{m.label}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--color-m-text)]">{m.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {detail.knowledge_gap ? (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
            {tr.knowledgeGapLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
            {detail.knowledge_gap}
          </p>
        </div>
      ) : null}

      <div className={hasMetrics || detail.knowledge_gap ? 'mt-4 border-t border-[var(--color-m-card-border)] pt-4' : ''}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-m-text-muted)]">
          {tr.mentorNote}
        </p>
        {hasNote ? (
          <p className="text-sm leading-relaxed text-[var(--color-m-text-secondary)]">
            {detail.mentor_note!.note_content}
          </p>
        ) : (
          <EmptyAiState message={planned ? tr.mentorNoteEmpty : tr.mentorNoteNoneYet} />
        )}
      </div>
    </AiSectionCard>
  );
}
