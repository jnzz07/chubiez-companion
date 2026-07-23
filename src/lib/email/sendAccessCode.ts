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
  const creamBgUrl = `${appUrl}/brand/bg-cream.png`
  const darkBgUrl = `${appUrl}/brand/bg-charcoal.png`

  const html = await render(
    AccessCodeEmail({
      code,
      logoUrl,
      peekUrl,
      creamBgUrl,
      darkBgUrl,
      heading: fillPlaceholders(template.heading, vars),
      intro: fillPlaceholders(template.intro, vars),
      footer: fillPlaceholders(template.footer, vars),
    })
  )

  // Invisible uniqueness: a random run of zero-width spaces appended to
  // the subject. Nothing visible shows up (no code-looking token, no
  // extra characters a recipient can see), but the underlying string is
  // still byte-for-byte different every send — which is what keeps Gmail
  // from grouping repeated sends into one thread and auto-collapsing
  // content behind "...". Purely cosmetic-invisible, not a real code.
  const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b)
  const invisibleUniquePad = ZERO_WIDTH_SPACE.repeat(1 + (randomBytes(1)[0] % 20))

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${fillPlaceholders(template.subject, vars)}${invisibleUniquePad}`,
    html,
  })

  return error ? (error.message ?? 'Email send failed') : null
}
