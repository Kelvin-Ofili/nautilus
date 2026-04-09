export function formatMoneyAmount(
  amount: string,
  currency: string,
  locale: string,
): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 8,
    }).format(n);
  } catch {
    return `${amount} ${currency}`;
  }
}
