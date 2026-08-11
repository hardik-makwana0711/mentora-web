import { Mic } from 'lucide-react';

import { Modal } from '@/components/ui/Modal';

import { Button } from '@/components/ui/Button';

import { FormActions } from '@/components/ui/FormActions';

import { useStrings } from '@/constants/strings';



export function RecordingConsentModal({

  open,

  isLoading,

  onAccept,

  onDecline,

  onClose,

}: {

  open: boolean;

  isLoading?: boolean;

  onAccept: () => void;

  onDecline: () => void;

  onClose: () => void;

}) {

  const tr = useStrings();



  return (

    <Modal

      open={open}

      title={tr.recordingConsentTitle}

      onClose={onClose}

      footer={

        <FormActions align="end">

          <Button type="button" variant="secondary" onClick={onDecline} disabled={isLoading}>

            {tr.decline}

          </Button>

          <Button type="button" onClick={onAccept} isLoading={isLoading}>

            {tr.accept}

          </Button>

        </FormActions>

      }

    >

      <div className="flex flex-col items-center text-center">

        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/15">

          <Mic className="size-8 text-[var(--color-brand-primary)]" aria-hidden />

        </div>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{tr.recordingConsentBody}</p>

      </div>

    </Modal>

  );

}

