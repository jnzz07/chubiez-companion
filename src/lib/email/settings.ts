import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Access-code email copy, editable from the admin panel.
 * Placeholders available in every field:
 *   {{plush_name}} — the plushie's name
 *   {{code}}       — the access code
 */
export interface EmailTemplate {
  subject: string
  heading: string
  intro: string
  footer: string
}

export const DEFAULT_TEMPLATE: EmailTemplate = {
  // {{code}} at the end keeps every subject line unique per send. Gmail
  // groups same-subject emails to the same recipient into one thread and
  // auto-collapses parts it thinks repeat a previous message in that
  // thread — a real risk here since testing means sending near-identical
  // emails to the same inbox over and over. A unique subject prevents
  // Gmail from ever treating two of these as the same conversation.
  subject: 'welcome to the family, your community is waiting for you inside · {{code}}',
  heading: 'you took the first step.',
  intro:
    "that's not nothing. here's your code to get into the app, where you and your mellou can have a safe space to be yourselves.",
  footer:
    'you bought a {{plush_name}}. we think that was a good call.\nquestions? reply to this email or hit us at support@bemellou.com\nthis code never expires, no rush.',
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

/** Deletes the saved override so future sends fall back to DEFAULT_TEMPLATE. */
export async function resetEmailTemplate(supabase: SupabaseClient): Promise<string | null> {
  const { error } = await supabase.from('app_settings').delete().eq('key', SETTINGS_KEY)
  return error?.message ?? null
}

export function fillPlaceholders(
  text: string,
  vars: { plushName: string; code: string }
): string {
  return text
    .replaceAll('{{plush_name}}', vars.plushName)
    .replaceAll('{{code}}', vars.code)
}
