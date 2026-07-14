import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync } from "./stripeClient";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Creates the `stripe` schema (idempotent), registers the managed webhook,
 * and backfills existing Stripe data into Postgres so billing status reads
 * never need to call the Stripe API directly.
 */
async function initStripe(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is required for Stripe billing.",
    );
  }

  logger.info("Initializing Stripe schema...");
  await runMigrations({ databaseUrl });

  const stripeSync = await getStripeSync();

  const domain = process.env["REPLIT_DEV_DOMAIN"];
  if (domain) {
    logger.info("Setting up managed Stripe webhook...");
    await stripeSync.findOrCreateManagedWebhook(
      `https://${domain}/api/stripe/webhook`,
    );
  } else {
    logger.warn(
      "No REPLIT_DEV_DOMAIN found; skipping managed Stripe webhook registration.",
    );
  }

  logger.info("Syncing Stripe data...");
  await stripeSync.syncBackfill();
  logger.info("Stripe data synced");
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
