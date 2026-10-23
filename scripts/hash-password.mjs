#!/usr/bin/env node
/**
 * Generates a scrypt password hash for ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/hash-password.mjs "your-strong-password"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your-strong-password"');
  process.exit(1);
}

if (password.length < 10) {
  console.error("Choose a password with at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
// Colon-separated to stay safe in .env files: Next.js expands `$NAME`
// sequences, which would corrupt a `scrypt$salt$hash` value.
console.log(`scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`);
