// utils/currency.js
export function formatCurrency(amount, currencyCode = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch (err) {
    console.error("Error formatting currency:", err);
    return amount;
  }
}
