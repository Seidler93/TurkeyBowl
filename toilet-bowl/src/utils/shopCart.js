import { normalizeCart } from "../../functions/cart.js";
export const CART_STORAGE_KEY = "turkey-bowl-cart-2027";

export function readShopCart() {
  try { return normalizeCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"), true); }
  catch { return []; }
}
