// The app supports two currencies: USD and SLSH (Somali shillings). SLSH
// has no practical decimal subunit, so it's formatted as a whole number.
// Intl doesn't recognize "SLSH" as an ISO 4217 code, so that case always
// falls back to the plain "SLSH 1,234" string.
export function formatCurrency(amount: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "SLSH" ? 0 : 2,
      maximumFractionDigits: currency === "SLSH" ? 0 : 2,
    }).format(amount)
  } catch {
    return currency === "SLSH"
      ? `SLSH ${Math.round(amount).toLocaleString()}`
      : `${currency} ${amount.toFixed(2)}`
  }
}

// Sums amounts per currency instead of adding dollars to shillings.
export function sumByCurrency<T>(
  items: T[],
  getAmount: (item: T) => number,
  getCurrency: (item: T) => string
): Record<string, number> {
  return items.reduce<Record<string, number>>((totals, item) => {
    const currency = getCurrency(item)
    totals[currency] = (totals[currency] || 0) + getAmount(item)
    return totals
  }, {})
}

// Renders a per-currency totals map as "USD 1,234.00 · SLSH 5,000" — only
// currencies with a non-zero total are shown.
export function formatCurrencyTotals(totals: Record<string, number>) {
  return Object.entries(totals)
    .filter(([, amount]) => amount !== 0)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ")
}
