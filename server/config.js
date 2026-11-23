/* Shared server configuration, read once from the environment. */

// Tokens are signed and verified with this secret. There is deliberately no
// fallback: a guessable default would let anyone forge a login token.
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set; refusing to start without it.");
}
