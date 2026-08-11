import { AlertCircle, CheckCircle2, Circle, Clock, Hourglass } from 'lucide-react';

import { useStrings } from '@/constants/strings';

import type { Strings } from '@/locales/en';

import type { LessonRole, TranscriptStatus } from '@/types/lessons';

import { cn } from '@/lib/utils';



type StatusConfig = {

  colorClass: string;

  borderClass: string;

  bgClass: string;

  icon: typeof CheckCircle2;

  label: string | null;

};



function getStatusConfig(status: TranscriptStatus, isMentor: boolean, tr: Strings): StatusConfig {

  switch (status) {

    case 'READY':

      return {

        colorClass: 'text-emerald-400',

        borderClass: 'border-emerald-400/40',

        bgClass: 'bg-emerald-400/10',

        icon: CheckCircle2,

        label: isMentor ? tr.transcriptReadyAiAvailable : null,

      };

    case 'IN_PROGRESS':

      return {

        colorClass: 'text-amber-400',

        borderClass: 'border-amber-400/40',

        bgClass: 'bg-amber-400/10',

        icon: Hourglass,

        label: isMentor ? tr.transcriptInProgress : tr.aiContentBeingPrepared,

      };

    case 'SCHEDULED':

      return {

        colorClass: 'text-[var(--color-brand-primary)]',

        borderClass: 'border-[var(--color-brand-primary)]/40',

        bgClass: 'bg-[var(--color-brand-primary)]/10',

        icon: Clock,

        label: isMentor ? tr.transcriptScheduled : tr.aiContentBeingPrepared,

      };

    case 'FAILED':

      return {

        colorClass: 'text-red-400',

        borderClass: 'border-red-400/40',

        bgClass: 'bg-red-400/10',

        icon: AlertCircle,

        label: isMentor ? tr.transcriptFailedDetail : tr.transcriptFailed,

      };

    default:

      return {

        colorClass: 'text-[var(--color-text-muted)]',

        borderClass: 'border-[var(--color-m-card-border)]',

        bgClass: 'bg-[var(--color-m-bg)]',

        icon: Circle,

        label: isMentor ? tr.transcriptNotScheduled : null,

      };

  }

}



export function TranscriptStatusBadge({

  transcriptStatus,

  role,

}: {

  transcriptStatus?: TranscriptStatus | null;

  role: LessonRole;

}) {

  const tr = useStrings();



  if (!transcriptStatus) return null;



  const isMentor = role === 'mentor';

  const config = getStatusConfig(transcriptStatus, isMentor, tr);



  if (!isMentor && (transcriptStatus === 'READY' || transcriptStatus === 'NOT_SCHEDULED')) return null;

  if (!config.label) return null;



  const Icon = config.icon;



  return (

    <div

      className={cn(

        'mb-4 flex items-start gap-3 rounded-xl border p-3',

        config.borderClass,

        config.bgClass

      )}

    >

      <Icon className={cn('mt-0.5 size-4 shrink-0', config.colorClass)} aria-hidden />

      <div className="min-w-0">

        {isMentor ? (

          <p className={cn('text-[10px] font-extrabold uppercase tracking-wide', config.colorClass)}>

            {tr.transcriptStatusLabel}

          </p>

        ) : null}

        <p className={cn('text-xs leading-relaxed', isMentor ? 'text-[var(--color-text-secondary)]' : config.colorClass)}>

          {config.label}

        </p>

      </div>

    </div>

  );

}

