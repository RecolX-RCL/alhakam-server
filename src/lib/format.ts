/**
 * Currency formatting & display helpers
 */

export type Currency = "USD" | "SYP";

const currencyMeta: Record<
  Currency,
  { label: string; symbol: string; name: string }
> = {
  USD: { label: "دولار", symbol: "$", name: "USD" },
  SYP: { label: "ل.س", symbol: "ل.س", name: "SYP" },
};

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return currency === "USD"
    ? `${formatted} $`
    : `${formatted} ل.س`;
}

export function currencyLabel(currency: Currency): string {
  return currencyMeta[currency].label;
}

export function currencySymbol(currency: Currency): string {
  return currencyMeta[currency].symbol;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
