// Menu prices are in Hong Kong dollars; users can pick a currency in their
// profile to see an approximate value too. Rates are the European Central
// Bank's reference rates via frankfurter.dev (free, no key). The ECB publishes
// new rates every working day; we load them once a day and show their date.

// The currencies frankfurter.dev offers (ECB reference rates), without HKD.
export const CURRENCIES = {
  AUD: "Australian dollar",
  BRL: "Brazilian real",
  CAD: "Canadian dollar",
  CHF: "Swiss franc",
  CNY: "Chinese yuan",
  CZK: "Czech koruna",
  DKK: "Danish krone",
  EUR: "Euro",
  GBP: "British pound",
  HUF: "Hungarian forint",
  IDR: "Indonesian rupiah",
  ILS: "Israeli shekel",
  INR: "Indian rupee",
  ISK: "Icelandic króna",
  JPY: "Japanese yen",
  KRW: "South Korean won",
  MXN: "Mexican peso",
  MYR: "Malaysian ringgit",
  NOK: "Norwegian krone",
  NZD: "New Zealand dollar",
  PHP: "Philippine peso",
  PLN: "Polish złoty",
  RON: "Romanian leu",
  SEK: "Swedish krona",
  SGD: "Singapore dollar",
  THB: "Thai baht",
  TRY: "Turkish lira",
  USD: "US dollar",
  ZAR: "South African rand",
} as const;
export type CurrencyCode = keyof typeof CURRENCIES;

export function isCurrency(code: unknown): code is CurrencyCode {
  return typeof code === "string" && code in CURRENCIES;
}

export type Rate = { code: CurrencyCode; rate: number; date: string };

// 1 HKD in the given currency and the date of that rate, or null if it can't be loaded.
export async function hkdRate(code: CurrencyCode): Promise<Rate | null> {
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=HKD&symbols=${code}`, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(15_000), // runs alongside the scan, which takes longer anyway
    });
    const data = await response.json();
    const rate = Number(data?.rates?.[code]);
    return rate > 0 && typeof data.date === "string" ? { code, rate, date: data.date } : null;
  } catch (error) {
    console.error("exchange rate unavailable", error);
    return null;
  }
}

// "$12", "HK$35.5", "28" → 12, 35.5, 28 (null if there is no number).
export function priceNumber(price: string | null): number | null {
  const match = price?.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

// "≈ €1.37", "≈ $1.54", "≈ ¥230"
export function formatConverted(hkd: number, code: CurrencyCode, rate: number) {
  const money = new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).format(hkd * rate);
  return `≈ ${money}`;
}
