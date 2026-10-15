/**
 * Format currency in Indian Rupee format with tabular numeral support.
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  // Indian currency numbering system (lakhs/thousands)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `₹${formatted}`;
}
