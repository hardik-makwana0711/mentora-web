import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  const tr = useStrings();
  return (
    <Modal
      open={open}
      title={tr.logoutConfirmTitle}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {tr.cancel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {tr.logoutConfirmAction}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-muted)]">{tr.logoutConfirmBody}</p>
    </Modal>
  );
}
