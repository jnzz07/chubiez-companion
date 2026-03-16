'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAccessCode, getExpiryDate } from '@/lib/codes/generate'
import { resend, FROM_ADDRESS } from '@/lib/email/resend'
import { AccessCodeEmail } from '@/lib/email/templates/accessCode'
import { render } from '@react-email/render'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email(),
  plushSlug: z.string().min(1),
  plushName: z.string().min(1),
})

export type GenerateResult =
  | { success: true; code: string; email: string }
  | { success: false; error: string }

export async function generateCodeAction(formData: FormData): Promise<GenerateResult> {
  // Verify admin session
  const supabaseBrowser = await createClient()
  const { data: { user } } = await supabaseBrowser.auth.getUser()

  if (!user?.email) return { success: false, error: 'Unauthorized' }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = schema.safeParse({
    email: formData.get('email'),
    plushSlug: formData.get('plushSlug'),
    plushName: formData.get('plushName'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, plushSlug, plushName } = parsed.data
  const supabase = createAdminClient()
  const code = generateAccessCode()
  const expiresAt = getExpiryDate(30)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://companion.chubiez.com'

  // Insert code
  const { error: insertError } = await supabase.from('access_codes').insert({
    email: email.toLowerCase(),
    code,
    plush_type_slug: plushSlug,
    expires_at: expiresAt.toISOString(),
    generated_by: 'admin',
  })

  if (insertError) {
    return { success: false, error: 'Failed to save code. Try again.' }
  }

  // Send email
  try {
    const html = await render(
      AccessCodeEmail({ email, code, plushName, appUrl, expiresAt })
    )

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `your ${plushName} is ready 🤍`,
      html,
    })

    await supabase
      .from('access_codes')
      .update({ sent_at: new Date().toISOString() })
      .eq('code', code)
  } catch (err) {
    console.error('[generateCode] Email send failed:', err)
    // Code was saved — return success even if email failed (admin can resend)
  }

  return { success: true, code, email }
}

export async function getCodesAction(page = 1, pageSize = 20) {
  // Verify admin session
  const supabaseBrowser = await createClient()
  const { data: { user } } = await supabaseBrowser.auth.getUser()
  if (!user?.email) return { data: [], count: 0, error: 'Unauthorized' }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return { data: [], count: 0, error: 'Unauthorized' }
  }

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
  // Verify admin session
  const supabaseBrowser = await createClient()
  const { data: { user } } = await supabaseBrowser.auth.getUser()
  if (!user?.email) return { success: false, error: 'Unauthorized' }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = createAdminClient()
  const { data: record } = await supabase
    .from('access_codes')
    .select('*, plush_types(name)')
    .eq('id', codeId)
    .single()

  if (!record) return { success: false, error: 'Code not found' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://companion.chubiez.com'
  const plushName = (record.plush_types as { name: string } | null)?.name ?? 'Chubiez Plushie'

  const html = await render(
    AccessCodeEmail({
      email: record.email,
      code: record.code,
      plushName,
      appUrl,
      expiresAt: new Date(record.expires_at),
    })
  )

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: record.email,
    subject: `your ${plushName} is ready 🤍`,
    html,
  })

  await supabase
    .from('access_codes')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', codeId)

  return { success: true, code: record.code, email: record.email }
}
