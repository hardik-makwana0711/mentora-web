import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function WalletBackButton({ to }: { to: string }) {
  const tr = useStrings();
  const navigate = useNavigate();
  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => navigate(to)}>
      {tr.back}
    </Button>
  );
}

