import { createHmac } from 'crypto'

export async function verifyShopifyWebhook(
  request: Request,
  rawBody: string
): Promise<boolean> {
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
  if (!hmacHeader) return false

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!
  const computed = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(hmacHeader, computed)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
