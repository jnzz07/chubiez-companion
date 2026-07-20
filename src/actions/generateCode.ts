'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { claimPoolCode, parseCodeSheet } from '@/lib/codes/pool'
import { sendAccessCodeEmail } from '@/lib/email/sendAccessCode'
import { saveEmailTemplate, type EmailTemplate } from '@/lib/email/settings'
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
