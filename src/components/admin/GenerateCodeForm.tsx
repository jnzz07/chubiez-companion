'use client'

import { useActionState } from 'react'
import { generateCodeAction } from '@/actions/generateCode'

const initialState = { success: false as boolean, error: '', code: '', email: '' }

export function GenerateCodeForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await generateCodeAction(formData)
      return { ...initialState, ...result }
    },
    initialState
  )

  return (
    <div className="bg-white rounded-xl border border-[#E8E0D5] p-6">
      <h2 className="font-semibold text-[#303030] text-lg mb-4">generate &amp; send code</h2>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#565656]">buyer email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="customer@example.com"
            className="rounded-xl border border-[#E8E0D5] px-4 py-2.5 text-[#303030] placeholder-[#a8a8a8] focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#565656]">plush name (optional)</label>
          <input
            name="plushName"
            type="text"
            placeholder="your bemellou plushie"
            className="rounded-xl border border-[#E8E0D5] px-4 py-2.5 text-[#303030] placeholder-[#a8a8a8] focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] text-sm"
          />
        </div>

        {state.error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        {state.success && state.code && (
          <div className="rounded-xl bg-[#303030] px-5 py-4 text-center">
            <p className="text-xs text-[#8ed1fc] uppercase tracking-widest mb-1">code sent to {state.email}</p>
            <p className="font-mono text-2xl tracking-[6px] text-[#fffcf4] font-bold">{state.code}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0d7f6e] text-white font-semibold py-3 text-sm transition hover:bg-[#0a6a5c] disabled:opacity-50"
        >
          {isPending ? 'generating...' : 'generate & send →'}
        </button>
      </form>
    </div>
  )
}
