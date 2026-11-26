// Public checkout URL. No Stripe API keys are used in the browser.
export const SHIRT_PAYMENT_LINK = "https://buy.stripe.com/6oU4gy74G0WZaDyewt9ws01";
export { SHIRT_SIZES } from "../../functions/cart.js";
export const CART_CHECKOUT_ENDPOINT = import.meta.env.VITE_CART_CHECKOUT_ENDPOINT || "";
export const SHIRT_SIZE_PAYMENT_LINKS = {
  S: "https://buy.stripe.com/5kQ3cugFg357aDygEB9ws02",
  M: "https://buy.stripe.com/00wbJ0agS9tvh1W7419ws03",
  L: "https://buy.stripe.com/6oU5kC74GbBD3b68859ws04",
  XL: "https://buy.stripe.com/9B63cubkWdJLeTO9c99ws05",
  "2XL": "https://buy.stripe.com/5kQ14mex8fRT12Yagd9ws06",
  "3XL": "https://buy.stripe.com/aFabJ00GicFHh1Wdsp9ws07",
};
