import { getAuth, createClerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, admins } from "@workspace/db";
import { eq } from "drizzle-orm";

// Lazy singleton — created once, reused for every request.
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Middleware that allows only admin users to proceed.
 * Admin status is determined by checking the authenticated user's primary
 * email address against the `admins` table.
 *
 * To grant admin access:  INSERT INTO admins (email) VALUES ('user@example.com');
 * To revoke:              DELETE FROM admins WHERE email = 'user@example.com';
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await clerk.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (e: { id: string; emailAddress: string }) =>
        e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    if (!primaryEmail) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [adminRow] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, primaryEmail));

    if (!adminRow) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
