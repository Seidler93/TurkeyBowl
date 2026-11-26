import { useEffect, useRef, useState } from "react";
import { stripePaymentLink } from "../utils/stripePaymentLink";
import { SHIRT_SIZES, SHIRT_SIZE_PAYMENT_LINKS, CART_CHECKOUT_ENDPOINT } from "../config/shop";
import { cartQuantity, cartTotal, cartItemKey, SHIRT_STYLES, MAX_PER_SIZE, MAX_CART_QUANTITY, SHIRT_PRICE_CENTS } from "../../functions/cart.js";
import { CART_STORAGE_KEY, readShopCart } from "../utils/shopCart";

const money = (cents) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const CHECKOUT_ENABLED = false;

export default function ShopPage() {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("green");
  const shirt = SHIRT_STYLES.find((style) => style.id === selectedStyle);
  const [cart, setCart] = useState(readShopCart);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const checkoutRequest = useRef(null);
  const quantity = cartQuantity(cart);
  const selectedQuantity = cart.find((item) => item.size === selectedSize && item.style === selectedStyle)?.quantity || 0;
  const singleCheckoutUrl = cart.length === 1 && quantity === 1 && cart[0].style === "green" ? stripePaymentLink(SHIRT_SIZE_PAYMENT_LINKS[cart[0].size]) : "";
  const checkoutReady = CHECKOUT_ENABLED && Boolean(CART_CHECKOUT_ENDPOINT || singleCheckoutUrl);

  useEffect(() => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
    catch { /* Private browsing can disable local storage; the in-memory cart still works. */ }
  }, [cart]);

  function updateCart(next) {
    setCart(next);
    checkoutRequest.current = null;
    setError("");
  }

  function addToCart() {
    if (!selectedSize || selectedQuantity >= MAX_PER_SIZE || quantity >= MAX_CART_QUANTITY || checkingOut) return;
    const key = cartItemKey({ style: selectedStyle, size: selectedSize });
    const existing = cart.find((item) => cartItemKey(item) === key);
    updateCart(existing ? cart.map((item) => cartItemKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { style: selectedStyle, size: selectedSize, quantity: 1 }]);
    setMessage(`${shirt.label}, size ${selectedSize} added to your cart.`);
  }

  function changeQuantity(key, change) {
    if (checkingOut) return;
    updateCart(cart.map((item) => cartItemKey(item) === key ? { ...item, quantity: item.quantity + change } : item));
    setMessage("");
  }

  async function checkout() {
    if (!cart.length || checkingOut || !checkoutReady) return;
    if (!CART_CHECKOUT_ENDPOINT && singleCheckoutUrl) { window.location.assign(singleCheckoutUrl); return; }
    setCheckingOut(true);
    setError("");
    checkoutRequest.current ||= crypto.randomUUID();
    try {
      const response = await fetch(CART_CHECKOUT_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, requestId: checkoutRequest.current }),
      });
      if (!response.ok) throw new Error("Checkout unavailable");
      const data = await response.json();
      const url = stripePaymentLink(data.url);
      if (!url) throw new Error("Invalid checkout URL");
      window.location.assign(url);
    } catch {
      setError("Checkout is temporarily unavailable. Your cart is saved; please try again.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="shop-page">
      <div className="page-header"><p className="eyebrow">Toilet Bowl</p><h1>Shop</h1></div>
      <div className="shop-product">
        <div className="shop-product-visual">
          <figure className="shop-product-photo">
            <img src={shirt.image} alt={`${shirt.label} 2027 Turkey Bowl T-shirt mockup`} width="1024" height="1280" />
            <figcaption>Design preview. Final shirt details to be confirmed.</figcaption>
          </figure>
          <fieldset className="shop-shirt-options">
            <legend>Shirt</legend>
            {SHIRT_STYLES.map((style) => (
              <label key={style.id}>
                <input type="radio" name="shirt-style" value={style.id} checked={selectedStyle === style.id} disabled={checkingOut} onChange={() => { setSelectedStyle(style.id); setMessage(""); }} />
                <span>{style.label}</span>
              </label>
            ))}
          </fieldset>
          <div className="shop-size-selector">
            <label htmlFor="shirt-size">Size</label>
            <select id="shirt-size" value={selectedSize} disabled={checkingOut} onChange={(event) => setSelectedSize(event.target.value)}>
              <option value="" disabled>Choose a size</option>
              {SHIRT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button type="button" className="shop-checkout" disabled={!selectedSize || selectedQuantity >= MAX_PER_SIZE || quantity >= MAX_CART_QUANTITY || checkingOut} onClick={addToCart}>Add to Cart</button>
            {message && <p className="shop-cart-message" role="status">{message}</p>}
          </div>
        </div>
        <div className="shop-product-info">
          <p className="eyebrow">Game-day gear</p><h2>2027 Turkey Bowl T-shirt</h2>
          <p className="shop-price">$25 <span>USD / shirt</span></p>
          <p>Pick up on game day.</p>
          <p className="shop-contact">Questions? Contact AJ at <a href="tel:+12246605288">224-660-5288</a>.</p>
        </div>
      </div>
      <section className="shop-cart" aria-labelledby="shop-cart-title">
        <div className="shop-cart-header"><h2 id="shop-cart-title">Your Cart <span>({quantity})</span></h2>
          {cart.length > 0 && <button type="button" className="shop-cart-clear" disabled={checkingOut} onClick={() => { updateCart([]); setMessage("Cart cleared."); }}>Clear cart</button>}
        </div>
        {!cart.length ? <p className="shop-cart-empty">Your cart is empty.</p> : (
          <>
            <ul className="shop-cart-items">
              {cart.map((item) => (
                <li key={cartItemKey(item)}>
                  <div className="shop-cart-item-name"><strong>{SHIRT_STYLES.find((style) => style.id === item.style).label} T-shirt</strong><span>Size {item.size} &middot; {money(SHIRT_PRICE_CENTS)} each</span></div>
                  <div className="shop-cart-quantity" role="group" aria-label={`Size ${item.size} quantity`}>
                    <button type="button" aria-label={`Decrease ${item.style} ${item.size} quantity`} disabled={checkingOut || item.quantity <= 1} onClick={() => changeQuantity(cartItemKey(item), -1)}>&minus;</button>
                    <span aria-label={`${item.size} quantity`}>{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.style} ${item.size} quantity`} disabled={checkingOut || item.quantity >= MAX_PER_SIZE || quantity >= MAX_CART_QUANTITY} onClick={() => changeQuantity(cartItemKey(item), 1)}>+</button>
                  </div>
                  <div className="shop-cart-line-total"><strong>{money(item.quantity * SHIRT_PRICE_CENTS)}</strong>
                    <button type="button" aria-label={`Remove ${item.style} size ${item.size}`} disabled={checkingOut} onClick={() => { updateCart(cart.filter((entry) => cartItemKey(entry) !== cartItemKey(item))); setMessage(`Size ${item.size} removed from cart.`); }}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shop-cart-summary"><span>Total</span><strong>{money(cartTotal(cart))} <small>USD</small></strong></div>
            <button type="button" className="shop-checkout" disabled={!checkoutReady || checkingOut} onClick={checkout}>{!CHECKOUT_ENABLED ? "Checkout coming closer to the 2027 game" : checkingOut ? "Opening checkout..." : "Checkout with Stripe"}</button>
            {CHECKOUT_ENABLED && !checkoutReady && <p className="shop-cart-note" role="status">Multi-shirt checkout is not available yet. Your cart is saved.</p>}
            {error && <p role="alert">{error}</p>}
          </>
        )}
      </section>
    </div>
  );
}
