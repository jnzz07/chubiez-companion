'use client'

import { useActionState } from 'react'
import { importCodesAction, type ImportResult } from '@/actions/generateCode'

const initialState: ImportResult | null = null

export function ImportCodesForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ImportResult | null, formData: FormData) => {
      return importCodesAction(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="bg-white rounded-xl border border-[#E8E0D5] p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-[#303030]">import codes</h2>
        <p className="text-xs text-[#7a7a7a] mt-0.5">
          paste the sheet from the Bemellou app — one code per line (commas work too).
          duplicates and already-used codes are skipped automatically.
        </p>
      </div>

      <textarea
        name="codes"
        required
        rows={8}
        placeholder={'A3F9C21B\nB7E2D90A\nC1F8E45D'}
        className="w-full rounded-lg border border-[#E8E0D5] bg-white px-4 py-3 text-[#303030] placeholder-[#a8a8a8] font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] transition resize-y"
      />

      <input
        name="batch"
        type="text"
        placeholder="batch label (optional, e.g. july-2026)"
        className="w-full rounded-lg border border-[#E8E0D5] bg-white px-4 py-2.5 text-[#303030] placeholder-[#a8a8a8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] transition"
      />

      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state && state.success && (
        <div className="rounded-lg bg-[#b5ead7]/40 border border-[#b5ead7] px-4 py-3 text-sm text-[#0d7f6e]">
          imported {state.imported} new code{state.imported === 1 ? '' : 's'}
          {state.skipped > 0 && ` · ${state.skipped} already in the pool (skipped)`}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#0d7f6e] text-white font-semibold py-3 text-sm transition hover:bg-[#0a6a5c] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'importing...' : 'add to pool'}
      </button>
    </form>
  )
}
