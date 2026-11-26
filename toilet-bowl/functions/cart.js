export const SHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
export const SHIRT_STYLES = [
  { id: "green", label: "Green / Pics", image: "/shop-pics-2027-v2.jpg" },
  { id: "black", label: "Black / Beets", image: "/shop-beets-2027-v2.png" },
];
export const cartItemKey = (item) => `${item.style || "green"}-${item.size}`;
export const SHIRT_PRICE_CENTS = 2000;
export const MAX_PER_SIZE = 10;
export const MAX_CART_QUANTITY = 50;

export function normalizeCart(items, allowEmpty = false) {
  if (!Array.isArray(items) || items.length > SHIRT_SIZES.length * SHIRT_STYLES.length || (!allowEmpty && !items.length)) {
    throw new Error("Choose at least one shirt.");
  }
  const bySize = new Map();
  for (const item of items) {
    const style = item?.style ?? "green";
    if (!item || !SHIRT_STYLES.some((option) => option.id === style) || !SHIRT_SIZES.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_PER_SIZE || bySize.has(cartItemKey(item))) {
      throw new Error("Check your shirt sizes and quantities.");
    }
    bySize.set(cartItemKey(item), { style, size: item.size, quantity: item.quantity });
  }
  const cart = SHIRT_STYLES.flatMap(({ id: style }) => SHIRT_SIZES.map((size) => bySize.get(`${style}-${size}`)).filter(Boolean));
  if (cart.reduce((total, item) => total + item.quantity, 0) > MAX_CART_QUANTITY) throw new Error("The cart can contain up to 50 shirts.");
  return cart;
}

export function cartQuantity(cart) { return cart.reduce((total, item) => total + item.quantity, 0); }
export function cartTotal(cart) { return cartQuantity(cart) * SHIRT_PRICE_CENTS; }
