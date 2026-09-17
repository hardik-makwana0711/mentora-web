import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { referencesService } from '@/services/references.service';
import { useStrings } from '@/constants/strings';
import { useAuthStore } from '@/app/store/authStore';
import { cn } from '@/lib/utils';
import type { ReferenceDisplayNameOption, ReferenceType } from '@/types/references';

function normAxios(e: unknown, fallback: string): string {
  const ax = e as AxiosError & { normalizedMessage?: string };
  return ax.normalizedMessage || ax.message || fallback;
}

export function SubmitReferenceModal({
  open,
  mentorId,
  onClose,
}: {
  open: boolean;
  mentorId: string;
  onClose: () => void;
}) {
  const tr = useStrings();
  const role = useAuthStore((s) => s.role);

  const [type, setType] = useState<ReferenceType>('review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [achievementName, setAchievementName] = useState('');
  const [achievementYear, setAchievementYear] = useState('');
  const [displayOption, setDisplayOption] = useState<ReferenceDisplayNameOption>(
    role === 'student' ? 'student' : 'parent'
  );
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);

  function resolveDisplayName(): string | undefined {
    if (displayOption === 'parent') return tr.referenceDisplayAsParent;
    if (displayOption === 'student') return tr.referenceDisplayAsStudent;
    if (displayOption === 'anonymous') return tr.referenceDisplayAsAnonymous;
    return customDisplayName.trim() || undefined;
  }

  const mutation = useMutation({
    mutationFn: () => {
      const trimmedContent = content.trim();
      if (trimmedContent.length < 10) {
        throw new Error(tr.referenceContentTooShort);
      }
      if (!consent) {
        throw new Error(tr.referenceConsentRequired);
      }
      return referencesService.submit({
        teacher_id: mentorId,
        type,
        title: title.trim() || undefined,
        content: trimmedContent,
        rating: rating > 0 ? rating : undefined,
        achievement_name:
          type === 'success_story' ? achievementName.trim() || undefined : undefined,
        achievement_year:
          type === 'success_story' && achievementYear ? Number(achievementYear) : undefined,
        is_anonymous: displayOption === 'anonymous',
        display_name: resolveDisplayName(),
        consent_to_display: consent,
      });
    },
    onSuccess: () => setDone(true),
    onError: (e) => toast.error(normAxios(e, tr.referenceSubmitFailed)),
  });

  function handleClose() {
    setType('review');
    setTitle('');
    setContent('');
    setRating(0);
    setAchievementName('');
    setAchievementYear('');
    setDisplayOption(role === 'student' ? 'student' : 'parent');
    setCustomDisplayName('');
    setConsent(false);
    setDone(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      title={tr.referenceModalTitle}
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
              {tr.referenceSubmit}
            </Button>
          </div>
        )
      }
    >
      {done ? (
        <div>
          <p className="font-medium text-[var(--color-m-text)]">{tr.referenceSubmitSuccessTitle}</p>
          <p className="mt-1 text-sm text-[var(--color-m-text-muted)]">
            {tr.referenceSubmitSuccessBody}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['review', 'success_story'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  type === t
                    ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)] text-white'
                    : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-secondary)]'
                )}
              >
                {t === 'review' ? tr.referenceTypeReview : tr.referenceTypeSuccessStory}
              </button>
            ))}
          </div>

          <Input
            label={tr.referenceTitleLabel}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <div>
            <label className="mb-1 block text-sm text-[var(--color-m-text)]">
              {tr.referenceContentLabel}
            </label>
            <Textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
            />
            <p className="mt-1 text-xs text-[var(--color-m-text-muted)]">
              {tr.referenceContentHint}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--color-m-text)]">
              {tr.referenceRatingLabel}
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={String(value)}
                    onClick={() => setRating((r) => (r === value ? 0 : value))}
                  >
                    <Star
                      className={
                        value <= rating
                          ? 'size-6 fill-yellow-400 text-yellow-400'
                          : 'size-6 text-[var(--color-m-card-border)]'
                      }
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'success_story' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={tr.referenceAchievementNameLabel}
                placeholder={tr.referenceAchievementNamePlaceholder}
                value={achievementName}
                onChange={(e) => setAchievementName(e.target.value)}
                maxLength={200}
              />
              <Input
                label={tr.referenceAchievementYearLabel}
                type="number"
                value={achievementYear}
                onChange={(e) => setAchievementYear(e.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm text-[var(--color-m-text)]">
              {tr.referenceDisplayNameLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['parent', 'student', 'anonymous', 'custom'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDisplayOption(opt)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    displayOption === opt
                      ? 'border-[var(--color-m-primary)] bg-[var(--color-m-primary)] text-white'
                      : 'border-[var(--color-m-card-border)] text-[var(--color-m-text-secondary)]'
                  )}
                >
                  {opt === 'parent'
                    ? tr.referenceDisplayAsParent
                    : opt === 'student'
                      ? tr.referenceDisplayAsStudent
                      : opt === 'anonymous'
                        ? tr.referenceDisplayAsAnonymous
                        : tr.referenceDisplayCustomOption}
                </button>
              ))}
            </div>
            {displayOption === 'custom' ? (
              <Input
                className="mt-3"
                placeholder={tr.referenceDisplayCustomPlaceholder}
                value={customDisplayName}
                onChange={(e) => setCustomDisplayName(e.target.value)}
                maxLength={120}
              />
            ) : null}
          </div>

          <Checkbox
            label={tr.referenceConsentLabel}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
        </div>
      )}
    </Modal>
  );
}
