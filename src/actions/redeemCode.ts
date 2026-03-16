'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  code: z.string().min(6, 'Code is too short').max(12, 'Code is too long').toUpperCase(),
})

export type RedeemResult =
  | { success: true }
  | { success: false; error: string }

export async function redeemCode(formData: FormData): Promise<RedeemResult> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, code } = parsed.data
  const supabase = createAdminClient()

  // 1. Look up the code — server-only, never exposed to browser
  const { data: record, error: lookupError } = await supabase
    .from('access_codes')
    .select('id, plush_type_slug, used, expires_at')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .single()

  if (lookupError || !record) {
    return { success: false, error: 'Invalid code or email. Check and try again.' }
  }

  if (record.used) {
    return { success: false, error: 'This code has already been used.' }
  }

  if (new Date(record.expires_at) < new Date()) {
    return { success: false, error: 'This code has expired. Contact support.' }
  }

  // 2. Atomic mark-as-used (guards against double-submit race conditions)
  const { data: updatedRows } = await supabase
    .from('access_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', record.id)
    .eq('used', false) // Only update if still unused
    .select('id')

  if (!updatedRows || updatedRows.length === 0) {
    return { success: false, error: 'This code has already been used.' }
  }

  // 3. Get or create Supabase auth user by listing users and filtering
  const { data: usersPage } = await supabase.auth.admin.listUsers()
  const existingUser = usersPage?.users?.find(
    u => u.email?.toLowerCase() === email.toLowerCase()
  )

  let userId: string

  if (!existingUser) {
    const { data: created, error: createError } = await supabase.auth.admin
      .createUser({
        email: email.toLowerCase(),
        email_confirm: true,
      })

    if (createError || !created?.user) {
      return { success: false, error: 'Something went wrong. Please try again.' }
    }

    userId = created.user.id
  } else {
    userId = existingUser.id
  }

  // 4. Upsert companion profile
  await supabase.from('companion_users').upsert({
    id: userId,
    email: email.toLowerCase(),
    plush_type_slug: record.plush_type_slug,
  })

  // 5. Create a session via magic link token exchange
  const { data: linkData, error: linkError } = await supabase.auth.admin
    .generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    })

  if (linkError || !linkData?.properties?.hashed_token) {
    return { success: false, error: 'Could not create session. Please try again.' }
  }

  // 6. Exchange hashed token for a session
  const browserSupabase = await createClient()
  const { error: sessionError } = await browserSupabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (sessionError) {
    return { success: false, error: 'Could not create session. Please try again.' }
  }

  redirect('/home')
}
