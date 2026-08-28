function parseBrazilianCurrency(value: string | number) {
  if (typeof value === "number") return value;

  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function formatBrazilianCurrency(value: string | number) {
  const amount = parseBrazilianCurrency(value);
  return amount === null
    ? ""
    : new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency",
    }).format(amount);
}

export function formatBrazilianCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return (Number.parseInt(digits, 10) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function normalizeBrazilianCurrency(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? (Number.parseInt(digits, 10) / 100).toFixed(2) : "";
}
