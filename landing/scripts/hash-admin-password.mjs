#!/usr/bin/env node
// Generates the scrypt hash for ADMIN_PASSWORD_HASH.
//   node scripts/hash-admin-password.mjs "your strong password"
// Never commit the output of this script together with the password itself.

import { scrypt, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error("Usage: node scripts/hash-admin-password.mjs \"password (min 10 chars)\"");
  process.exit(1);
}

const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
scrypt(password, salt, 32, { N, r, p }, (err, key) => {
  if (err) throw err;
  console.log(`scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${key.toString("base64")}`);
});
