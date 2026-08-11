import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function AiErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const tr = useStrings();

  return (
    <div className="space-y-3">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {tr.retry}
        </Button>
      ) : null}
    </div>
  );
}
