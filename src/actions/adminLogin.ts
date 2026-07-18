'use server'

import { redirect } from 'next/navigation'
import { createAdminSession, destroyAdminSession, verifyPassword } from '@/lib/adminAuth'

export type LoginResult = { success: false; error: string }

export async function adminLoginAction(formData: FormData): Promise<LoginResult> {
  const password = String(formData.get('password') ?? '')

  if (!verifyPassword(password)) {
    return { success: false, error: 'Wrong password.' }
  }

  await createAdminSession()
  redirect('/admin')
}

export async function adminLogoutAction() {
  await destroyAdminSession()
  redirect('/admin/login')
}
