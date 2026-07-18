'use client'

import { useActionState } from 'react'
import { adminLoginAction, type LoginResult } from '@/actions/adminLogin'

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: LoginResult | null, formData: FormData) => {
      return adminLoginAction(formData)
    },
    null as LoginResult | null
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[#565656]">
          password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-[#E8E0D5] bg-white px-4 py-3 text-[#303030] focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] transition"
        />
      </div>

      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#0d7f6e] text-white font-semibold py-3 text-base transition hover:bg-[#0a6a5c] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'checking...' : 'enter →'}
      </button>
    </form>
  )
}
