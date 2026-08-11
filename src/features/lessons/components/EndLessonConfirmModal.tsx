import { Modal } from '@/components/ui/Modal';

import { Button } from '@/components/ui/Button';

import { FormActions } from '@/components/ui/FormActions';

import { useStrings } from '@/constants/strings';



export function EndLessonConfirmModal({

  open,

  isLoading,

  onConfirm,

  onClose,

}: {

  open: boolean;

  isLoading?: boolean;

  onConfirm: () => void;

  onClose: () => void;

}) {

  const tr = useStrings();



  return (

    <Modal

      open={open}

      title={tr.endLesson}

      onClose={onClose}

      footer={

        <FormActions align="end">

          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>

            {tr.cancel}

          </Button>

          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>

            {tr.endLesson}

          </Button>

        </FormActions>

      }

    >

      <p className="text-sm text-[var(--color-text-secondary)]">{tr.endLessonConfirm}</p>

    </Modal>

  );

}

