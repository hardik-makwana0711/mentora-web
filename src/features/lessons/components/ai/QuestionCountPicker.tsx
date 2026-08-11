import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { useStrings } from '@/constants/strings';
import { QUESTION_COUNT_OPTIONS } from '@/features/lessons/lib/ai-quiz-utils';

export function QuestionCountPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (count: number) => void;
}) {
  const tr = useStrings();
  const options = QUESTION_COUNT_OPTIONS.map((n) => ({
    value: String(n),
    label: String(n),
  }));

  return (
    <DropdownSelect
      label={tr.aiQuiz}
      value={String(value)}
      onChange={(v) => onChange(Number(v))}
      options={options}
    />
  );
}
