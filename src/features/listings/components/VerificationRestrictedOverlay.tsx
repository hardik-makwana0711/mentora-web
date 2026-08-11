import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStrings } from '@/constants/strings';

export function VerificationRestrictedOverlay({
  onBack,
}: {
  onBack: () => void;
}) {
  const tr = useStrings();
  return (
    <Card className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
      <Lock className="size-14 text-[var(--color-m-warning)]" aria-hidden />
      <h2 className="text-xl font-bold text-[var(--color-m-text)]">
        {tr.listingsVerificationRequiredTitle}
      </h2>
      <p className="max-w-md text-sm text-[var(--color-m-text-secondary)]">
        {tr.listingsVerificationRequiredBody}
      </p>
      <Button type="button" variant="secondary" onClick={onBack}>
        {tr.back}
      </Button>
    </Card>
  );
}
