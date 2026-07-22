'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { claimPoolCode, parseCodeSheet } from '@/lib/codes/pool'
import { sendAccessCodeEmail } from '@/lib/email/sendAccessCode'
import { saveEmailTemplate, resetEmailTemplate, type EmailTemplate } from '@/lib/email/settings'
import { isAdmin } from '@/lib/adminAuth'

const schema = z.object({
  email: z.string().email(),
  plushName: z.string().trim().optional(),
})

export type GenerateResult =
  | { success: true; code: string; email: string }
  | { success: false; error: string }

export async function generateCodeAction(formData: FormData): Promise<GenerateResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse({
    email: formData.get('email'),
    plushName: formData.get('plushName'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email } = parsed.data
  const plushName = parsed.data.plushName || 'your bemellou plushie'
  const supabase = createAdminClient()

  const code = await claimPoolCode(supabase)
  if (!code) {
    return { success: false, error: 'Code pool is empty — import a new batch of codes first.' }
  }

  // Insert code
  const { error: insertError } = await supabase.from('access_codes').insert({
    email: email.toLowerCase(),
    code,
    generated_by: 'admin',
  })

  if (insertError) {
    return { success: false, error: 'Failed to save code. Try again.' }
  }

  // Send email
  try {
    const sendError = await sendAccessCodeEmail(supabase, { email, code, plushName })

    if (!sendError) {
      await supabase
        .from('access_codes')
        .update({ sent_at: new Date().toISOString() })
        .eq('code', code)
    }
  } catch (err) {
    console.error('[generateCode] Email send failed:', err)
    // Code was saved — return success even if email failed (admin can resend)
  }

  return { success: true, code, email }
}

export async function getCodesAction(page = 1, pageSize = 20) {
  if (!(await isAdmin())) return { data: [], count: 0, error: 'Unauthorized' }

  const supabase = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('access_codes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  return { data: data ?? [], count: count ?? 0, error: error?.message }
}

export async function resendCodeAction(codeId: string): Promise<GenerateResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { data: record } = await supabase
    .from('access_codes')
    .select('*, plush_types(name)')
    .eq('id', codeId)
    .single()

  if (!record) return { success: false, error: 'Code not found' }

  const plushName = (record.plush_types as { name: string } | null)?.name ?? 'your bemellou plushie'

  const sendError = await sendAccessCodeEmail(supabase, {
    email: record.email,
    code: record.code,
    plushName,
  })

  if (sendError) return { success: false, error: sendError }

  await supabase
    .from('access_codes')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', codeId)

  return { success: true, code: record.code, email: record.email }
}

export type ImportResult =
  | { success: true; imported: number; skipped: number }
  | { success: false; error: string }

/** Imports a pasted sheet of codes from the Bemellou app into the pool. */
export async function importCodesAction(formData: FormData): Promise<ImportResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const raw = String(formData.get('codes') ?? '')
  const batch = String(formData.get('batch') ?? '').trim() || null
  const codes = parseCodeSheet(raw)

  if (codes.length === 0) {
    return { success: false, error: 'No valid codes found — paste one code per line.' }
  }

  const supabase = createAdminClient()

  // Upsert with ignoreDuplicates — a code already in the pool is never
  // re-imported or reset, so an assigned code can't become available again.
  const { data, error } = await supabase
    .from('code_pool')
    .upsert(
      codes.map(code => ({ code, batch })),
      { onConflict: 'code', ignoreDuplicates: true }
    )
    .select('code')

  if (error) {
    return { success: false, error: `Import failed: ${error.message}` }
  }

  const imported = data?.length ?? 0
  return { success: true, imported, skipped: codes.length - imported }
}

export type BulkSendResult =
  | {
      success: true
      sent: number
      skipped: number
      failed: number
      poolRanOut: boolean
      capReached: boolean
    }
  | { success: false; error: string }

// Backfilling to a freshly-verified sending domain is a deliverability risk:
// mail providers treat a sudden burst from a domain with zero sending
// history as spam-like. Cap + throttle per run so this reads as a trickle,
// not a blast — send a batch, check results, then paste the next chunk.
const MAX_PER_RUN = 60
const DELAY_BETWEEN_SENDS_MS = 1500

/** Parses pasted rows: one email per line. */
function parseBulkEmails(raw: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []

  for (const line of raw.split('\n')) {
    const email = line.trim().toLowerCase()
    if (!email || !email.includes('@')) continue
    if (seen.has(email)) continue
    seen.add(email)
    emails.push(email)
  }

  return emails
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Sends access codes to a pasted list of customers who ordered before this
 * tool existed (e.g. exported from Shopify Admin → Orders → Export).
 * Skips any email that already has a code on file, so re-running a list
 * (or a list with duplicates from multi-item orders) is always safe.
 * Capped and throttled per run — paste the list in chunks.
 */
export async function bulkSendCodesAction(formData: FormData): Promise<BulkSendResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const raw = String(formData.get('rows') ?? '')
  const allEmails = parseBulkEmails(raw)

  if (allEmails.length === 0) {
    return { success: false, error: 'No valid emails found — paste one per line.' }
  }

  const capReached = allEmails.length > MAX_PER_RUN
  const emails = allEmails.slice(0, MAX_PER_RUN)

  const supabase = createAdminClient()
  let sent = 0
  let skipped = 0
  let failed = 0
  let poolRanOut = false

  let attemptedSends = 0

  for (const email of emails) {
    const { data: existing } = await supabase
      .from('access_codes')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const code = await claimPoolCode(supabase)
    if (!code) {
      poolRanOut = true
      break
    }

    const { error: insertError } = await supabase.from('access_codes').insert({
      email,
      code,
      generated_by: 'backfill',
    })

    if (insertError) {
      failed++
      continue
    }

    // Throttle actual sends only — DB-only skips don't hit Resend, no need to pace those.
    if (attemptedSends > 0) await sleep(DELAY_BETWEEN_SENDS_MS)
    attemptedSends++

    const sendError = await sendAccessCodeEmail(supabase, { email, code, plushName: 'your bemellou plushie' })
    if (sendError) {
      failed++
      continue
    }

    await supabase.from('access_codes').update({ sent_at: new Date().toISOString() }).eq('code', code)
    sent++
  }

  return { success: true, sent, skipped, failed, poolRanOut, capReached }
}

export type TemplateResult = { success: true } | { success: false; error: string }

const templateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  heading: z.string().min(1, 'Heading is required'),
  intro: z.string().min(1, 'Intro is required'),
  footer: z.string().min(1, 'Footer is required'),
})

/** Saves the team-editable access-code email template. */
export async function saveTemplateAction(formData: FormData): Promise<TemplateResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const parsed = templateSchema.safeParse({
    subject: formData.get('subject'),
    heading: formData.get('heading'),
    intro: formData.get('intro'),
    footer: formData.get('footer'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = createAdminClient()
  const error = await saveEmailTemplate(supabase, parsed.data as EmailTemplate)

  if (error) return { success: false, error: `Save failed: ${error}` }
  return { success: true }
}

/** Deletes the saved template override, reverting to the code-level DEFAULT_TEMPLATE. */
export async function resetTemplateAction(): Promise<TemplateResult> {
  if (!(await isAdmin())) return { success: false, error: 'Unauthorized' }

  const supabase = createAdminClient()
  const error = await resetEmailTemplate(supabase)

  if (error) return { success: false, error: `Reset failed: ${error}` }
  return { success: true }
}
