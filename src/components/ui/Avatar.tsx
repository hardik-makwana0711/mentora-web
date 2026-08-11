import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [src]);

  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const showImg = Boolean(src) && !broken;

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-m-primary)]/30 text-[13px] font-semibold text-[var(--color-m-text)]',
        className
      )}
    >
      {showImg ? (
        <img
          src={src!}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}
