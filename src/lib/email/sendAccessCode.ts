import { randomBytes } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { render } from '@react-email/render'
import { getResend, FROM_ADDRESS } from '@/lib/email/resend'
import { AccessCodeEmail } from '@/lib/email/templates/accessCode'
import { fillPlaceholders, getEmailTemplate } from '@/lib/email/settings'

interface SendArgs {
  email: string
  code: string
  plushName: string
}

/**
 * Renders and sends the access-code email using the team-editable template
 * from app_settings. Returns an error message, or null on success.
 */
export async function sendAccessCodeEmail(
  supabase: SupabaseClient,
  { email, code, plushName }: SendArgs
): Promise<string | null> {
  const template = await getEmailTemplate(supabase)
  const vars = { plushName, code }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bemellou-companion-production.up.railway.app'
  const logoUrl = `${appUrl}/brand/wordmark-sky.png`
  const peekUrl = `${appUrl}/brand/benny-vita-peek.png`

  const html = await render(
    AccessCodeEmail({
      code,
      logoUrl,
      peekUrl,
      heading: fillPlaceholders(template.heading, vars),
      intro: fillPlaceholders(template.intro, vars),
      footer: fillPlaceholders(template.footer, vars),
    })
  )

  // A random, meaningless reference token (never the real access code)
  // appended to every subject, so each send is guaranteed unique — this is
  // what keeps Gmail from grouping repeated sends into one thread and
  // auto-collapsing content. Never expose the actual code here: subject
  // lines show up in notifications and lock screens.
  const ref = randomBytes(3).toString('hex').toUpperCase()

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${fillPlaceholders(template.subject, vars)} · ${ref}`,
    html,
  })

  return error ? (error.message ?? 'Email send failed') : null
}
