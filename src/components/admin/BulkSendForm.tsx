'use client'

import { useActionState } from 'react'
import { bulkSendCodesAction, type BulkSendResult } from '@/actions/generateCode'

export function BulkSendForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: BulkSendResult | null, formData: FormData) => {
      return bulkSendCodesAction(formData)
    },
    null as BulkSendResult | null
  )

  return (
    <form action={formAction} className="bg-white rounded-xl border border-[#E8E0D5] p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-[#303030]">backfill past customers</h2>
        <p className="text-xs text-[#7a7a7a] mt-0.5">
          for orders placed before this tool existed. paste one email per line
          (export from Shopify Admin → Orders → Export → Email column). emails
          that already have a code are skipped automatically — safe to re-run.
        </p>
        <p className="text-xs text-[#7a7a7a] mt-1">
          ⚠ sends max <strong>60 per click</strong>, spaced out — bemellou.com is a brand-new
          sending domain, and blasting hundreds at once risks the whole domain
          landing in spam. paste in batches of 60, wait a bit between batches.
        </p>
      </div>

      <textarea
        name="rows"
        required
        rows={8}
        placeholder={'jane@example.com\njohn@example.com'}
        className="w-full rounded-lg border border-[#E8E0D5] bg-white px-4 py-3 text-[#303030] placeholder-[#a8a8a8] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] transition resize-y"
      />

      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state && state.success && (
        <div className="rounded-lg bg-[#b5ead7]/40 border border-[#b5ead7] px-4 py-3 text-sm text-[#0d7f6e]">
          sent {state.sent} · skipped {state.skipped} (already had a code)
          {state.failed > 0 && ` · ${state.failed} failed`}
          {state.poolRanOut && (
            <span className="block mt-1 text-[#303030]">
              ⚠ code pool ran out mid-batch — import more codes and paste the remaining emails again.
            </span>
          )}
          {state.capReached && (
            <span className="block mt-1 text-[#303030]">
              only the first 60 emails in your paste were sent — paste the rest as a new batch.
            </span>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#0d7f6e] text-white font-semibold py-3 text-sm transition hover:bg-[#0a6a5c] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'sending... this takes a minute, don\'t close the tab' : 'send codes to this list'}
      </button>
    </form>
  )
}
