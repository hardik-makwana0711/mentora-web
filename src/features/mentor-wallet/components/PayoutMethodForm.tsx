import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useStrings } from '@/constants/strings';
import type { MentorPayoutMethod } from '@/types/mentor-wallet';

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-m-text-secondary)]">
        {label}
        {required ? <span className="ml-1 text-[var(--color-m-error)]">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-base text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)] focus:border-[color-mix(in_srgb,var(--color-m-text)_20%,transparent)]"
      />
    </label>
  );
}

export function PayoutMethodForm({
  initial,
  onSubmit,
  busy,
  apiError,
}: {
  initial?: Partial<MentorPayoutMethod>;
  onSubmit: (values: {
    accountHolderName: string;
    iban: string;
    bankName: string;
    branchName?: string;
    accountNumber?: string;
  }) => void;
  busy: boolean;
  apiError?: string | null;
}) {
  const tr = useStrings();
  const [accountHolderName, setAccountHolderName] = useState(initial?.accountHolderName ?? '');
  // Backend responses are masked, so never prefill IBAN/account number on edit.
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState(initial?.bankName ?? '');
  const [branchName, setBranchName] = useState(initial?.branchName ?? '');
  const [accountNumber, setAccountNumber] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!accountHolderName.trim()) e.accountHolderName = tr.mentorWalletFieldRequired;
    if (!iban.trim()) e.iban = tr.mentorWalletFieldRequired;
    if (!bankName.trim()) e.bankName = tr.mentorWalletFieldRequired;
    return e;
  }, [accountHolderName, iban, bankName]);

  const valid = Object.keys(errors).length === 0;

  function submit() {
    setTouched(true);
    if (!valid) return;
    onSubmit({
      accountHolderName: accountHolderName.trim(),
      iban: iban.trim(),
      bankName: bankName.trim(),
      branchName: branchName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
    });
  }

  return (
    <div className="space-y-4">
      <Input
        label={tr.mentorWalletAccountHolderName}
        value={accountHolderName}
        onChange={setAccountHolderName}
        required
      />
      {touched && errors.accountHolderName ? (
        <p className="text-sm text-[var(--color-m-error)]">{errors.accountHolderName}</p>
      ) : null}

      <Input label={tr.mentorWalletIban} value={iban} onChange={setIban} required placeholder={tr.mentorWalletIbanPlaceholder} />
      {touched && errors.iban ? <p className="text-sm text-[var(--color-m-error)]">{errors.iban}</p> : null}

      <Input label={tr.mentorWalletBankName} value={bankName} onChange={setBankName} required />
      {touched && errors.bankName ? <p className="text-sm text-[var(--color-m-error)]">{errors.bankName}</p> : null}

      <Input label={tr.mentorWalletBranchNameOptional} value={branchName} onChange={setBranchName} />
      <Input label={tr.mentorWalletAccountNumberOptional} value={accountNumber} onChange={setAccountNumber} />

      {apiError ? <p className="text-sm text-[var(--color-m-error)]">{apiError}</p> : null}

      <div className="pt-2">
        <Button type="button" fullWidth isLoading={busy} onClick={submit}>
          {tr.save}
        </Button>
      </div>
    </div>
  );
}

