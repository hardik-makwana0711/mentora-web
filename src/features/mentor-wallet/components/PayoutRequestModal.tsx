import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { useStrings } from '@/constants/strings';
import { formatWalletMoney, parseWalletAmount } from '@/features/mentor/lib/format-wallet';
import type { MentorPayoutMethod, MentorWalletSummary } from '@/types/mentor-wallet';
import { maskIban } from '@/features/mentor-wallet/lib/wallet-labels';

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-m-text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-base text-[var(--color-m-text)] outline-none focus:border-[color-mix(in_srgb,var(--color-m-text)_20%,transparent)]"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-[var(--color-m-bg)]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PayoutRequestModal({
  open,
  onClose,
  wallet,
  payoutMethods,
  onSubmit,
  busy,
  apiError,
}: {
  open: boolean;
  onClose: () => void;
  wallet: MentorWalletSummary;
  payoutMethods: MentorPayoutMethod[];
  onSubmit: (values: { amount: number; payoutMethodId?: string }) => void;
  busy: boolean;
  apiError?: string | null;
}) {
  const tr = useStrings();
  const currency = wallet.currency || 'TRY';
  const available = parseWalletAmount(wallet.availableBalance);
  const active = payoutMethods.filter((m) => m.status === 'ACTIVE');
  const defaultMethod = active.find((m) => m.isDefault) ?? active[0];

  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(defaultMethod?.id ?? '');
  const [touched, setTouched] = useState(false);

  const parsedAmount = useMemo(() => Number.parseFloat(amount || '0'), [amount]);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= available;
  const methodValid = Boolean(methodId);

  const selectOptions = active.map((m) => {
    const iban = m.ibanMasked?.trim()
      ? m.ibanMasked
      : m.iban?.trim()
        ? maskIban(m.iban)
        : '';
    const last4 = m.accountNumberLast4?.trim()
      ? m.accountNumberLast4
      : m.accountNumber?.trim()
        ? m.accountNumber.slice(-4)
        : '';
    const suffix = [iban, last4 ? `**** ${last4}` : ''].filter(Boolean).join(' • ');
    return {
      id: m.id,
      label: suffix ? `${m.bankName} • ${suffix}` : m.bankName,
    };
  });

  function submit() {
    setTouched(true);
    if (!amountValid || !methodValid) return;
    onSubmit({ amount: parsedAmount, payoutMethodId: methodId });
  }

  return (
    <Drawer open={open} onClose={() => !busy && onClose()} title={tr.mentorWalletRequestPayout}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
          <p className="text-xs text-[var(--color-m-text-muted)]">{tr.earningsAvailablePayout}</p>
          <p className="mt-1 text-lg font-bold text-[var(--color-m-text)]">{formatWalletMoney(available, currency)}</p>
        </div>

        {active.length > 1 ? (
          <Select label={tr.mentorWalletPayoutMethodLabel} value={methodId} onChange={setMethodId} options={selectOptions} />
        ) : defaultMethod ? (
          <div className="rounded-2xl border border-[var(--color-m-card-border)] bg-[var(--color-m-card)] p-4">
            <p className="text-sm font-semibold text-[var(--color-m-text)]">{tr.mentorWalletPayoutMethodLabel}</p>
            <p className="mt-2 text-sm text-[var(--color-m-text-muted)]">
              {defaultMethod.bankName}
              {defaultMethod.ibanMasked?.trim()
                ? ` • ${defaultMethod.ibanMasked}`
                : defaultMethod.iban?.trim()
                  ? ` • ${maskIban(defaultMethod.iban)}`
                  : ''}
              {defaultMethod.accountNumberLast4?.trim()
                ? ` • **** ${defaultMethod.accountNumberLast4}`
                : defaultMethod.accountNumber?.trim()
                  ? ` • **** ${defaultMethod.accountNumber.slice(-4)}`
                  : ''}
            </p>
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-[var(--color-m-text-secondary)]">{tr.mentorWalletAmountLabel}</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="mt-2 w-full rounded-xl border border-[var(--color-m-card-border)] bg-[var(--color-m-surface-light)] px-4 py-3 text-base text-[var(--color-m-text)] outline-none placeholder:text-[var(--color-m-text-muted)] focus:border-[color-mix(in_srgb,var(--color-m-text)_20%,transparent)]"
          />
        </label>
        {touched && !amountValid ? (
          <p className="text-sm text-[var(--color-m-error)]">{tr.mentorWalletInvalidPayoutAmount}</p>
        ) : null}
        {touched && !methodValid ? (
          <p className="text-sm text-[var(--color-m-error)]">{tr.mentorWalletNoActiveMethod}</p>
        ) : null}
        {apiError ? <p className="text-sm text-[var(--color-m-error)]">{apiError}</p> : null}

        <div className="pt-2">
          <Button type="button" fullWidth isLoading={busy} onClick={submit}>
            {tr.mentorWalletSubmitPayoutRequest}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

