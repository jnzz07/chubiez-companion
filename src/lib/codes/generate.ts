import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically secure 8-character access code.
 * e.g. "A3F9C21B" — 4 billion combinations, single-use, never expires.
 */
export function generateAccessCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}
