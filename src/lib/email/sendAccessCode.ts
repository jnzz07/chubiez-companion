import type { SupabaseClient } from '@supabase/supabase-js'
import { render } from '@react-email/render'
import { getResend, FROM_ADDRESS } from '@/lib/email/resend'
import { AccessCodeEmail } from '@/lib/email/templates/accessCode'
import { fillPlaceholders, getEmailTemplate } from '@/lib/email/settings'

interface SendArgs {
  email: string
  code: string
  plushName: string
  expiresAt: Date
}

/**
 * Renders and sends the access-code email using the team-editable template
 * from app_settings. Returns an error message, or null on success.
 */
export async function sendAccessCodeEmail(
  supabase: SupabaseClient,
  { email, code, plushName, expiresAt }: SendArgs
): Promise<string | null> {
  const template = await getEmailTemplate(supabase)

  const expiry = expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const vars = { plushName, code, expiry }

  const html = await render(
    AccessCodeEmail({
      code,
      expiryStr: expiry,
      heading: fillPlaceholders(template.heading, vars),
      intro: fillPlaceholders(template.intro, vars),
      footer: fillPlaceholders(template.footer, vars),
    })
  )

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: fillPlaceholders(template.subject, vars),
    html,
  })

  return error ? (error.message ?? 'Email send failed') : null
}
