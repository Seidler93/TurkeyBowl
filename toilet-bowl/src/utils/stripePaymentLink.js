export function stripePaymentLink(value) {
  if (!value) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !["buy.stripe.com", "checkout.stripe.com"].includes(url.hostname)) return "";
    if (url.username || url.password || url.pathname === "/") return "";
    return url.href;
  } catch {
    return "";
  }
}
