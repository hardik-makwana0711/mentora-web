import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { useStrings } from '@/constants/strings';

export function EditAiSummaryModal({
  open,
  initialSummary,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  initialSummary: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (summary: string) => void;
}) {
  const tr = useStrings();
  const [draft, setDraft] = useState(initialSummary);

  useEffect(() => {
    if (open) setDraft(initialSummary);
  }, [open, initialSummary]);

  return (
    <Modal
      open={open}
      title={tr.editSummary}
      onClose={onClose}
      footer={
        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {tr.cancel}
          </Button>
          <Button
            isLoading={isSaving}
            disabled={!draft.trim()}
            onClick={() => onSave(draft.trim())}
          >
            {tr.saveListingChanges}
          </Button>
        </FormActions>
      }
    >
      <Textarea
        label={tr.aiLessonSummary}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="min-h-[220px]"
      />
    </Modal>
  );
}
