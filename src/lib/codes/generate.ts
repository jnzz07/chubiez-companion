import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically secure 8-character access code.
 * e.g. "A3F9C21B" — 4 billion combinations, single-use, expires in 30 days.
 */
export function generateAccessCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export function getExpiryDate(days = 30): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
