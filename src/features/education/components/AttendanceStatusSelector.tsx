import { useStrings } from '@/constants/strings';
import { segmentOptionClass, segmentTrackClass } from '@/lib/button-styles';
import type { UniversityAttendanceStatus } from '@/types/education';

type AttendanceStatusSelectorProps = {
  value: UniversityAttendanceStatus | null;
  onChange: (status: UniversityAttendanceStatus) => void;
  disabled?: boolean;
  error?: string;
};

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
  error,
}: AttendanceStatusSelectorProps) {
  const tr = useStrings();
  const options: { value: UniversityAttendanceStatus; label: string }[] = [
    { value: 'attending', label: tr.currentlyAttending },
    { value: 'graduated', label: tr.graduated },
  ];

  return (
    <div className="mb-4 w-full">
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.3px] text-[var(--color-m-text-secondary)]">
        {tr.attendanceStatus}
      </p>
      <div className={segmentTrackClass()} role="group" aria-label={tr.attendanceStatus}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            className={segmentOptionClass(value === opt.value, disabled)}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error ? <p className="mt-1 pl-1 text-[11px] text-[var(--color-m-error)]">{error}</p> : null}
    </div>
  );
}
