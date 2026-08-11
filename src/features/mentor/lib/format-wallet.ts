export function parseWalletAmount(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function formatWalletMoney(value: string | number | undefined, currency = 'TRY'): string {
  const amount = parseWalletAmount(value);
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
