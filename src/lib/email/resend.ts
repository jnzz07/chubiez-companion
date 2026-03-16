import { Resend } from 'resend'

// Lazy — only instantiated at runtime when actually called, not at build time
export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'hello@chubiez.com'
