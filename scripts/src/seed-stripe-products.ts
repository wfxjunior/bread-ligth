// Idempotently creates the "BreadLight Premium" product and its two recurring
// prices (monthly + annual) in Stripe. Safe to re-run: if a product tagged
// `app=breadlight-premium` already exists, it's reused and only missing
// prices are created.
//
// Run with: pnpm --filter @workspace/scripts exec tsx src/seed-stripe-products.ts
import { getUncachableStripeClient } from "./stripeClient";

const PRODUCT_METADATA_TAG = "breadlight-premium";
const MONTHLY_AMOUNT_CENTS = 499;
const ANNUAL_AMOUNT_CENTS = 3999;

async function main() {
  const stripe = await getUncachableStripeClient();

  const existingProducts = await stripe.products.search({
    query: `metadata['app']:'${PRODUCT_METADATA_TAG}' AND active:'true'`,
  });

  let product = existingProducts.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: "BreadLight Premium",
      description:
        "Premium voices, AI pronunciation feedback, unlimited vocabulary review, advanced progress, premium reading atmospheres & accent colors, offline reading & audio, and early access to new AI features.",
      metadata: { app: PRODUCT_METADATA_TAG },
    });
    console.log(`Created product ${product.id}`);
  } else {
    console.log(`Reusing existing product ${product.id}`);
  }

  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const hasMonthly = existingPrices.data.some(
    (p) => p.recurring?.interval === "month" && p.unit_amount === MONTHLY_AMOUNT_CENTS,
  );
  const hasAnnual = existingPrices.data.some(
    (p) => p.recurring?.interval === "year" && p.unit_amount === ANNUAL_AMOUNT_CENTS,
  );

  if (!hasMonthly) {
    const monthly = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: MONTHLY_AMOUNT_CENTS,
      recurring: { interval: "month" },
      metadata: { app: PRODUCT_METADATA_TAG },
    });
    console.log(`Created monthly price ${monthly.id} ($4.99/mo)`);
  } else {
    console.log("Monthly price already exists, skipping");
  }

  if (!hasAnnual) {
    const annual = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: ANNUAL_AMOUNT_CENTS,
      recurring: { interval: "year" },
      metadata: { app: PRODUCT_METADATA_TAG },
    });
    console.log(`Created annual price ${annual.id} ($39.99/yr)`);
  } else {
    console.log("Annual price already exists, skipping");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
