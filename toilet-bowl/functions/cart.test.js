import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCart, cartTotal } from "./cart.js";

test("mixed-size totals use the fixed server price and ignore supplied prices", () => {
  const cart = normalizeCart([{ size: "XL", quantity: 2, price: 1 }, { size: "M", quantity: 1, amount: 0 }]);
  assert.deepEqual(cart, [{ style: "green", size: "M", quantity: 1 }, { style: "green", size: "XL", quantity: 2 }]);
  assert.equal(cartTotal(cart), 6000);
});
test("keeps styles separate and rejects unknown styles", () => {
  const cart = normalizeCart([{ style: "green", size: "M", quantity: 1 }, { style: "black", size: "M", quantity: 2 }]);
  assert.equal(cart.length, 2);
  assert.equal(cartTotal(cart), 6000);
  assert.throws(() => normalizeCart([{ style: "red", size: "M", quantity: 1 }]));
});
test("rejects invalid carts and quantities", () => {
  for (const items of [null, [], [{ size: "other", quantity: 1 }], [{ size: "S", quantity: 0 }], [{ size: "S", quantity: -1 }], [{ size: "S", quantity: 1.5 }], [{ size: "S", quantity: "2" }], [{ size: "S", quantity: 11 }], [{ size: "S", quantity: 1 }, { size: "S", quantity: 2 }]]) {
    assert.throws(() => normalizeCart(items));
  }
  assert.deepEqual(normalizeCart([], true), []);
  assert.throws(() => normalizeCart(["S", "M", "L", "XL", "2XL", "3XL"].map((size) => ({ size, quantity: 10 }))));
});
