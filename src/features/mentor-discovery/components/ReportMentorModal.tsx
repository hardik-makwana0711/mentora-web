import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { reportsService } from '@/services/reports.service';
import { useStrings } from '@/constants/strings';
import i18n from '@/i18n';
import type { ReportReasonCategory } from '@/types/reports';

function normAxios(e: unknown): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || i18n.t('reportFailed');
}

const REASONS: { value: ReportReasonCategory; label: string }[] = [
  { value: 'inappropriate_content', label: 'reportReasonInappropriate' },
  { value: 'false_information', label: 'reportReasonFalseInfo' },
  { value: 'safety_concern', label: 'reportReasonSafety' },
  { value: 'spam', label: 'reportReasonSpam' },
  { value: 'other', label: 'reportReasonOther' },
];

export function ReportMentorModal({
  open,
  mentorId,
  onClose,
}: {
  open: boolean;
  mentorId: string;
  onClose: () => void;
}) {
  const tr = useStrings();
  const [reason, setReason] = useState<ReportReasonCategory>('inappropriate_content');
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      reportsService.create({
        target_type: 'mentor_profile',
        target_id: mentorId,
        reason_category: reason,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      setDone(true);
      toast.success(tr.reportSubmitted);
    },
    onError: (e) => toast.error(normAxios(e)),
  });

  const handleClose = () => {
    setDone(false);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      open={open}
      title={tr.reportProfile}
      onClose={handleClose}
      footer={
        done ? (
          <Button type="button" variant="primary" size="sm" onClick={handleClose}>
            {tr.close}
          </Button>
        ) : (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              {tr.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {tr.submitReport}
            </Button>
          </div>
        )
      }
    >
      {done ? (
        <p className="text-sm text-[var(--color-text-muted)]">{tr.reportThankYou}</p>
      ) : (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--color-m-text)]">{tr.reportReason}</legend>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {tr[r.label as keyof typeof tr]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="mb-1 block text-sm text-[var(--color-m-text)]">{tr.additionalDetails}</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
