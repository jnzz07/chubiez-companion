'use client'

import { useActionState } from 'react'
import { saveTemplateAction, type TemplateResult } from '@/actions/generateCode'
import type { EmailTemplate } from '@/lib/email/settings'

const inputClass =
  'w-full rounded-lg border border-[#E8E0D5] bg-white px-4 py-2.5 text-[#303030] placeholder-[#a8a8a8] text-sm focus:outline-none focus:ring-2 focus:ring-[#8ed1fc] transition'

export function EmailTemplateForm({ template }: { template: EmailTemplate }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: TemplateResult | null, formData: FormData) => {
      return saveTemplateAction(formData)
    },
    null as TemplateResult | null
  )

  return (
    <form action={formAction} className="bg-white rounded-xl border border-[#E8E0D5] p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-[#303030]">email template</h2>
        <p className="text-xs text-[#7a7a7a] mt-0.5">
          the email customers get with their code. you can use{' '}
          <code className="bg-[#fde8b8]/60 px-1 rounded">{'{{plush_name}}'}</code>,{' '}
          <code className="bg-[#fde8b8]/60 px-1 rounded">{'{{code}}'}</code> and{' '}
          <code className="bg-[#fde8b8]/60 px-1 rounded">{'{{expiry}}'}</code> anywhere.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-[#565656]">subject line</label>
        <input id="subject" name="subject" required defaultValue={template.subject} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="heading" className="text-sm font-medium text-[#565656]">heading</label>
        <input id="heading" name="heading" required defaultValue={template.heading} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="intro" className="text-sm font-medium text-[#565656]">intro paragraph</label>
        <textarea id="intro" name="intro" required rows={3} defaultValue={template.intro} className={`${inputClass} resize-y`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="footer" className="text-sm font-medium text-[#565656]">footer note</label>
        <textarea id="footer" name="footer" required rows={3} defaultValue={template.footer} className={`${inputClass} resize-y`} />
        <p className="text-xs text-[#7a7a7a]">line breaks become separate lines in the email</p>
      </div>

      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state && state.success && (
        <div className="rounded-lg bg-[#b5ead7]/40 border border-[#b5ead7] px-4 py-3 text-sm text-[#0d7f6e]">
          template saved — every email from now on uses this copy
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#0d7f6e] text-white font-semibold py-3 text-sm transition hover:bg-[#0a6a5c] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'saving...' : 'save template'}
      </button>
    </form>
  )
}
