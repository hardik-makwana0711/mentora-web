import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  loading,
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  loading?: boolean;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const tr = useStrings();

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {tr.cancel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? tr.loading : confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-[var(--color-text-secondary)]">{body}</p>
    </Modal>
  );
}
