import { useState } from 'react';
import { useStrings } from '@/constants/strings';
import { cn } from '@/lib/utils';

export function ExpandableText({
  text,
  previewLines = 4,
  className,
}: {
  text: string;
  previewLines?: number;
  className?: string;
}) {
  const tr = useStrings();
  const [expanded, setExpanded] = useState(false);
  // Rough heuristic (~70 chars/line) to avoid showing a toggle under text that never actually overflows.
  const mightOverflow = text.length > previewLines * 70 || text.split('\n').length > previewLines;

  return (
    <div>
      <p
        className={cn(
          'whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-m-text-secondary)]',
          className
        )}
        style={
          !expanded && mightOverflow
            ? {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: previewLines,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {text}
      </p>
      {mightOverflow ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-[#6C63FF] hover:underline"
        >
          {expanded ? tr.showLess : tr.readMore}
        </button>
      ) : null}
    </div>
  );
}
