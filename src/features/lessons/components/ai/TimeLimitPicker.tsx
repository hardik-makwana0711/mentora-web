import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useStrings } from '@/constants/strings';
import { TIME_LIMIT_OPTIONS } from '@/features/lessons/lib/ai-quiz-utils';

export function TimeLimitPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const tr = useStrings();
  const options = TIME_LIMIT_OPTIONS.map((o) => ({ value: o.value, label: o.label }));

  return (
    <DropdownSelect
      label={tr.minutesUnit}
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}
