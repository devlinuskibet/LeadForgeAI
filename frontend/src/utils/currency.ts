/**
 * Helper utility to format currency figures (defaults to Kenyan Shillings - KES / KSh).
 */
export function formatCurrency(amount: number | null | undefined, currencyCode: string = "KES"): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencyCode} 0`;
  }

  // Format as KES XX,XXX
  const formatted = Math.round(amount).toLocaleString("en-KE");
  return `${currencyCode} ${formatted}`;
}
