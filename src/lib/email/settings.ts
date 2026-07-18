import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Access-code email copy, editable from the admin panel.
 * Placeholders available in every field:
 *   {{plush_name}} — the plushie's name
 *   {{code}}       — the access code
 *   {{expiry}}     — human-readable expiry date
 */
export interface EmailTemplate {
  subject: string
  heading: string
  intro: string
  footer: string
}

export const DEFAULT_TEMPLATE: EmailTemplate = {
  subject: 'your {{plush_name}} is ready 🤍',
  heading: 'your {{plush_name}} is ready.',
  intro:
    'use this code to enter the companion app — your little corner of the internet where you and your chubi can exist unbothered.',
  footer:
    'you bought a {{plush_name}}. we think that was a good call.\nquestions? reply to this email or hit us at support@bemellou.com',
}

const SETTINGS_KEY = 'access_code_email'

export async function getEmailTemplate(supabase: SupabaseClient): Promise<EmailTemplate> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .single()

  return { ...DEFAULT_TEMPLATE, ...((data?.value as Partial<EmailTemplate>) ?? {}) }
}

export async function saveEmailTemplate(
  supabase: SupabaseClient,
  template: EmailTemplate
): Promise<string | null> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: SETTINGS_KEY, value: template, updated_at: new Date().toISOString() })
  return error?.message ?? null
}

export function fillPlaceholders(
  text: string,
  vars: { plushName: string; code: string; expiry: string }
): string {
  return text
    .replaceAll('{{plush_name}}', vars.plushName)
    .replaceAll('{{code}}', vars.code)
    .replaceAll('{{expiry}}', vars.expiry)
}
