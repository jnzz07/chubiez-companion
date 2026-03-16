'use client'

import { useActionState, useEffect, useRef } from 'react'
import { redeemCode } from '@/actions/redeemCode'
import { useSearchParams } from 'next/navigation'

const initialState = { success: false as boolean, error: '' }

export function CodeEntryForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await redeemCode(formData)
      return result as typeof initialState
    },
    initialState
  )

  const searchParams = useSearchParams()
  const emailRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  // Pre-fill from magic link query params
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const codeParam = searchParams.get('code')
    if (emailRef.current && emailParam) emailRef.current.value = emailParam
    if (codeRef.current && codeParam) codeRef.current.value = codeParam
  }, [searchParams])

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[#4B4866]">
          email
        </label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#E8E0D5] bg-white px-4 py-3 text-[#1E1B2E] placeholder-[#B0A8C0] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm font-medium text-[#4B4866]">
          access code
        </label>
        <input
          ref={codeRef}
          id="code"
          name="code"
          type="text"
          required
          autoComplete="off"
          placeholder="A3F9C21B"
          maxLength={12}
          className="w-full rounded-xl border border-[#E8E0D5] bg-white px-4 py-3 text-[#1E1B2E] placeholder-[#B0A8C0] font-mono tracking-widest text-lg uppercase focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] transition"
          style={{ fontFamily: 'monospace' }}
        />
        <p className="text-xs text-[#8B84A8]">
          check your email — it was sent when your order shipped
        </p>
      </div>

      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[#FB7185] text-white font-semibold py-3.5 text-base transition hover:bg-[#f95f74] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'checking...' : 'enter →'}
      </button>
    </form>
  )
}
