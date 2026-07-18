import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { verifyShopifyWebhook } from '@/lib/shopify/verifyWebhook'
import { getExpiryDate } from '@/lib/codes/generate'
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

  // Process one code per line item (one plushie = one code)
  for (const item of line_items) {
    const shopifyOrderId = `${orderId}_${item.variant_id}`

    // 3. Idempotency check — don't generate duplicates on webhook retries
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
    const expiresAt = getExpiryDate(30)
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
        expires_at: expiresAt.toISOString(),
        generated_by: 'shopify',
      })

    if (insertError) {
      console.error(`[shopify-webhook] Failed to insert code for ${email}:`, insertError.message)
      // Return 200 to prevent Shopify from retrying — log the failure instead
      continue
    }

    // 6. Send email
    try {
      const emailError = await sendAccessCodeEmail(supabase, { email, code, plushName, expiresAt })

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

  // Always return 200 — Shopify will retry on any other status
  return NextResponse.json({ ok: true })
}
