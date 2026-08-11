import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useStrings } from '@/constants/strings';

export function ReasonModal({
  open,
  title,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
  required = true,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  required?: boolean;
}) {
  const tr = useStrings();
  const [reason, setReason] = useState('');

  function handleClose() {
    setReason('');
    onClose();
  }

  function handleConfirm() {
    const trimmed = reason.trim();
    if (required && !trimmed) return;
    onConfirm(trimmed);
    setReason('');
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            {tr.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || (required && !reason.trim())}
          >
            {loading ? tr.loading : confirmLabel}
          </Button>
        </div>
      }
    >
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={tr.adminReasonPlaceholder}
        rows={4}
      />
    </Modal>
  );
}
