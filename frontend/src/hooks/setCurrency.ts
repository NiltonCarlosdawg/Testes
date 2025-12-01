export const setCurrencyFormat = (
  amount: number | string | null | undefined,
  currency: string = "AOA",
  locale: string = "pt-BR",
  decimals: number = 2
): string => {
  if (amount === undefined || amount === null) {
    return "—"; 
  }

  let numericValue: number;
  if (typeof amount === "string") {
    const cleaned = amount.replace(",", ".").trim();
    numericValue = Number(cleaned);
  } else {
    numericValue = amount;
  }

  if (isNaN(numericValue)) {
    return `${amount} (Número inválido)`;
  }

  return numericValue.toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export default setCurrencyFormat;
