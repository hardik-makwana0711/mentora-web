import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function BookingRestrictedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tr = useStrings();
  return (
    <Modal
      open={open}
      title={tr.accessRestricted}
      onClose={onClose}
      footer={
        <Button type="button" fullWidth onClick={onClose}>
          {tr.ok}
        </Button>
      }
    >
      <p className="text-sm text-[var(--color-m-text-secondary)]">
        {tr.studentBookingRestrictedBody}
      </p>
    </Modal>
  );
}
