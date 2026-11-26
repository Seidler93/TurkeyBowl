# Shirt Shop

The `/shop` page advertises one Toilet Bowl T-shirt for $20 USD, for pickup at the game. The image and product details are temporary. Checkout is disabled until closer to the 2027 game.

## Stripe Connection

The inline cart supports both shirt styles in S, M, L, XL, 2XL, and 3XL, quantity adjustment, removal, and a $20-per-shirt total. It is saved on the buyer's device. The shared server price is also $20. Existing Stripe Payment Links below still use the old $25 price and must be replaced before checkout is enabled. Mixed-size and multi-shirt carts require the secure backend below. Never put a secret API key in a browser-facing environment variable.

Each link uses the same $25 USD one-time T-shirt price, buyer name and email collection, and a required shirt-size field. No shipping address or shipping charge is collected. Buyers pick up at Newton Park at the game. Check the order's paid status in Stripe before handing over a shirt.

The direct Stripe CLI login authorized Primitive Studios (`acct_1QoGZIBdM1yyoXdt`) in live mode. The product is `turkey_bowl_2027_shirt`, the one-time $25 USD price is `price_1Ug84PBdM1yyoXdtSt9pj8fZ`, and the Payment Link is `plink_1Ug88kBdM1yyoXdtibSncynx`. Checkout requires buyer name, email, and shirt size; it charges for one shirt and does not collect shipping. Credentials remain outside the repository. No payment was submitted during setup.

## Combined Cart Checkout Setup

The backend in `functions/index.js` validates sizes and quantities, calculates a fixed price on the server, and creates a single Stripe Checkout Session containing each selected size. `shopStripeWebhook` verifies signatures, handles both `checkout.session.completed` and `checkout.session.async_payment_succeeded`, and logs paid session IDs without buyer information. Pickup fulfillment remains manual in Stripe Dashboard. There is no order database or automated inventory update, and a return-page URL never confirms payment.

This backend has not been deployed. The project's Cloud Functions API is disabled, and `STRIPE_SECRET_KEY` does not exist in Secret Manager. Setup requires:

1. Enable Cloud Functions and confirm the project has the Firebase billing plan required for Functions.
2. Create a persistent restricted Stripe key with Checkout Session creation and associated product/price creation permissions. Store it as the Firebase Functions secret `STRIPE_SECRET_KEY`; never paste it in chat or commit it.
3. Configure a Stripe webhook for the function URL `https://us-central1-turkeybowl-743d7.cloudfunctions.net/shopStripeWebhook` with the two Checkout events above. Store its signing secret as `STRIPE_WEBHOOK_SECRET` in Firebase Secret Manager.
4. Deploy the `shop` Functions codebase after installing dependencies in `functions/`.
5. Set the public build variable `VITE_CART_CHECKOUT_ENDPOINT=https://us-central1-turkeybowl-743d7.cloudfunctions.net/createShopCheckout`, rebuild, and verify a sandbox checkout before publishing combined checkout.

Do not enable the existing $25 size-specific payment links for the $20 shirts. Replace them or use the combined checkout backend at the current shared price before enabling checkout. Do not assume the temporary Stripe CLI login is a persistent backend credential.

## Temporary Mockup

Current assets: `public/shop-pics-2027-v2.jpg` (the user's updated green Pics mockup) and `public/shop-beets-2027-v2.png` (black Beets mockup edited with the built-in image-generation tool to match the green print's scale and position). Both keep their light studio backgrounds. The page explicitly labels them as design previews.

Black mockup edit prompt:

> Use case: precise-object-edit. Produce ONE edited black T-shirt product mockup, portrait 1024x1280. Image 1 is the BLACK BEETS shirt EDIT TARGET; image 2 is a GREEN PICS shirt used ONLY as a reference for the printed logo's physical size and placement. Keep image 1 shirt framing, black fabric, collar, sleeves, folds, lighting, white studio background unchanged. Change ONLY the scale and vertical placement of its entire existing chest print, uniformly as one intact graphic, so it matches the logo bounding-box size and placement on image 2. At 1024x1280, target graphic spans approximately x330 to710 and y260 to705 (about380px wide,445px tall). Keep proportions natural, do not stretch. Preserve the black shirt's exact BEETS flag, yellow accents, turkey mascot, white toilet, number 27, text 2027 and TURKEY BOWL; do not substitute the green shirt's PICS design or recolor the shirt. No extra graphics, no labels outside shirt. Output only the full black shirt, NOT a side-by-side collage.

The earlier concept at `public/shop-tshirt.jpg` was generated with the built-in image-generation tool using `public/tb3.png` as the logo reference, and is no longer displayed.

Final generation prompt:

> Use case: product-mockup. Generate one square clean photorealistic ecommerce product mockup for a temporary event T-shirt shop. Input image is the exact Toilet Bowl turkey football mascot logo, reference for the printed chest artwork, not an edit target. One black short-sleeve crew-neck T-shirt laid flat front facing on a light neutral gray studio surface. Print the supplied mascot large and centered on chest, with simple gold text TOILET BOWL beneath the mascot. Keep the garment entire in frame, all sleeves and hem visible, neatly arranged realistic cotton folds, natural even studio lighting and crisp inspectable fabric and artwork. No people, no hangers, no props, no marketing captions, no price, no labels on backdrop, no watermark. This is a concept mockup, not an actual product photograph. Output one 1024px square product image.
