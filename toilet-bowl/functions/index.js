import { createHash } from "node:crypto";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Stripe from "stripe";
import { normalizeCart, SHIRT_PRICE_CENTS, SHIRT_STYLES } from "./cart.js";

const stripeKey = defineSecret("STRIPE_SECRET_KEY");
const webhookKey = defineSecret("STRIPE_WEBHOOK_SECRET");
const allowedOrigins = ["https://turkeybowl-743d7.web.app", "https://turkeybowl-743d7.firebaseapp.com", /^https:\/\/turkeybowl-743d7--[a-z0-9-]+\.web\.app$/, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/];

function validOrigin(origin) {
  return allowedOrigins.some((allowed) => typeof allowed === "string" ? allowed === origin : allowed.test(origin));
}

export const createShopCheckout = onRequest({ region: "us-central1", cors: allowedOrigins, secrets: [stripeKey], maxInstances: 3, timeoutSeconds: 30 }, async (request, response) => {
  if (request.method !== "POST") { response.set("Allow", "POST").status(405).json({ error: "Use POST." }); return; }
  const origin = request.get("origin") || "";
  if (!validOrigin(origin)) { response.status(403).json({ error: "Checkout is not available from this website." }); return; }
  let cart;
  try { cart = normalizeCart(request.body?.items); }
  catch (error) { response.status(400).json({ error: error.message }); return; }
  const requestId = request.body?.requestId;
  if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) {
    response.status(400).json({ error: "Invalid checkout request." }); return;
  }
  try {
    const stripe = new Stripe(stripeKey.value());
    const suffix = [...createHash("sha256").update(requestId).digest().subarray(0, 8)].map((value) => String.fromCharCode(97 + value % 26)).join("");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: SHIRT_PRICE_CENTS,
          product_data: { name: `2027 Turkey Bowl T-shirt - ${SHIRT_STYLES.find((style) => style.id === item.style).label} - ${item.size}`, description: "Pickup at Newton Park on November 25, 2027. No shipping.", metadata: { shirt_size: item.size, shirt_style: item.style } },
        },
      })),
      name_collection: { individual: { enabled: true, optional: false } },
      custom_text: { submit: { message: "Game-day pickup at Newton Park on November 25, 2027. No shipping." } },
      success_url: `${origin}/shop?checkout=complete`,
      cancel_url: `${origin}/shop?checkout=canceled`,
      metadata: { event: "turkey_bowl_2027", cart: cart.map((item) => `${item.style}:${item.size}:${item.quantity}`).join(","), request_id: requestId },
      integration_identifier: `turkey_bowl_cart_${suffix}`,
    }, { idempotencyKey: `turkey-bowl-cart-${requestId}` });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    response.set("Cache-Control", "no-store").json({ url: session.url });
  } catch (error) {
    console.error("Shop checkout failed", { type: error.type || "checkout_error", code: error.code || "unknown" });
    response.status(502).json({ error: "Checkout is temporarily unavailable. Your cart is saved; please try again." });
  }
});

export const shopStripeWebhook = onRequest({ region: "us-central1", secrets: [stripeKey, webhookKey], maxInstances: 3, timeoutSeconds: 30 }, async (request, response) => {
  if (request.method !== "POST") { response.status(405).send("Use POST."); return; }
  const stripe = new Stripe(stripeKey.value());
  let event;
  try { event = stripe.webhooks.constructEvent(request.rawBody, request.get("stripe-signature"), webhookKey.value()); }
  catch { response.status(400).send("Invalid signature."); return; }
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    const session = event.data.object;
    if (session.metadata?.event === "turkey_bowl_2027" && session.payment_status === "paid") {
      // Manual pickup fulfillment stays in Stripe Dashboard; log no buyer PII.
      console.info("Paid Turkey Bowl order", { eventId: event.id, checkoutSessionId: session.id, paymentStatus: session.payment_status });
    }
  }
  response.json({ received: true });
});
