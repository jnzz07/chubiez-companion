import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import { claimPoolCode } from '@/lib/codes/pool'
import { variantToPlushSlug } from '@/lib/plushTypes'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAccessCodeEmail } from '@/lib/email/sendAccessCode'

interface ShopifyLineItem {
  variant_id: number
  title: string
  quantity: number
}

interface ShopifyOrder {
  id: number
  order_number: number
  email: string
  line_items: ShopifyLineItem[]
}

export async function POST(request: NextRequest) {
  // 1. Read raw body (required for HMAC verification)
  const rawBody = await request.text()

  // 2. Verify Shopify webhook signature
  const isValid = await verifyShopifyWebhook(request, rawBody)
  if (!isValid) {
    console.error('[shopify-webhook] Invalid HMAC signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let order: ShopifyOrder
  try {
    order = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id: orderId, email, line_items } = order

  if (!email) {
    console.warn(`[shopify-webhook] Order ${orderId} has no email — skipping`)
    return NextResponse.json({ ok: true })
  }

  const supabase = createAdminClient()

  // Only Vita and Benny (the actual plushies) get access codes. Pickpad is a
  // different product entirely — matched by name since that needs no Shopify
  // variant ID lookup and works immediately for any Pickpad variant/size.
  // Spaces/casing are stripped before matching so "Pick Pad", "PickPad", and
  // "pickpad" all match the same way regardless of how the product is named.
  const EXCLUDED_PRODUCT_KEYWORDS = ['pickpad']
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')

  // Process one code per UNIT purchased — a line item with quantity 3 means
  // three separate codes, not one. Each unit gets its own idempotency key
  // (orderId_variantId_unitIndex) so retries never double-send.
  for (const item of line_items) {
    if (EXCLUDED_PRODUCT_KEYWORDS.some(kw => normalize(item.title).includes(kw))) {
      console.log(`[shopify-webhook] Skipping excluded product "${item.title}" for order ${orderId}`)
      continue
    }

    for (let unit = 0; unit < item.quantity; unit++) {
      const shopifyOrderId = `${orderId}_${item.variant_id}_${unit}`

      // 3. Fast-path idempotency check — avoids claiming a pool code in the
      // common case (this same delivery already ran, or a genuine retry).
      // This alone is NOT the guarantee: two near-simultaneous deliveries
      // could both pass this check before either INSERT commits. The real
      // guarantee is the unique index on shopify_order_id (migration 008) —
      // see the insertError handling below, which treats a unique-violation
      // as an expected benign duplicate, not a failure.
      const { data: existing } = await supabase
        .from('access_codes')
        .select('id')
        .eq('shopify_order_id', shopifyOrderId)
        .single()

      if (existing) {
        console.log(`[shopify-webhook] Code already exists for order item ${shopifyOrderId} — skipping`)
        continue
      }

      // 4. Claim a pre-made code from the pool (codes come from the Bemellou app —
      // this service never invents its own). Empty pool → 500 so Shopify retries
      // over the next 48h, giving time to import a fresh batch.
      const code = await claimPoolCode(supabase)
      if (!code) {
        console.error(`[shopify-webhook] CODE POOL EMPTY — order ${shopifyOrderId} not fulfilled. Import more codes in /admin.`)
        return NextResponse.json({ error: 'Code pool empty' }, { status: 500 })
      }
      const plushSlug = variantToPlushSlug(String(item.variant_id))
      const plushName = item.title

      // 5. Store in Supabase
      const { error: insertError } = await supabase
        .from('access_codes')
        .insert({
          email: email.toLowerCase(),
          code,
          plush_type_slug: plushSlug,
          shopify_order_id: shopifyOrderId,
          generated_by: 'shopify',
        })

      if (insertError) {
        // 23505 = unique_violation — a concurrent delivery for the same unit
        // won the race and already inserted it. This is the real guarantee
        // against duplicates; treat it as an expected skip, not a failure.
        // The pool code claimed above for this losing attempt stays marked
        // used — a rare, acceptable cost for correctness under a genuine race.
        if (insertError.code === '23505') {
          console.log(`[shopify-webhook] Concurrent duplicate for ${shopifyOrderId} — skipping (unique constraint)`)
        } else {
          console.error(`[shopify-webhook] Failed to insert code for ${email}:`, insertError.message)
        }
        // Return 200 to prevent Shopify from retrying — log the failure instead
        continue
      }

      // 6. Send email — unless auto-sending is paused (test-trial mode).
      // Paused orders still get a code claimed + logged; send later via the
      // panel's resend button, or flip AUTO_EMAILS_ENABLED to true on Railway.
      if (process.env.AUTO_EMAILS_ENABLED === 'false') {
        console.log(`[shopify-webhook] AUTO_EMAILS_ENABLED=false — code ${code} logged for ${email} but NOT emailed`)
        continue
      }

      try {
        const emailError = await sendAccessCodeEmail(supabase, { email, code, plushName })

        if (emailError) {
          console.error(`[shopify-webhook] Email failed for ${email}:`, emailError)
        } else {
          // Mark as sent
          await supabase
            .from('access_codes')
            .update({ sent_at: new Date().toISOString() })
            .eq('email', email.toLowerCase())
            .eq('code', code)
        }
      } catch (err) {
        console.error(`[shopify-webhook] Unexpected email error for ${email}:`, err)
      }
    }
  }

  // Always return 200 — Shopify will retry on any other status
  return NextResponse.json({ ok: true })
}
