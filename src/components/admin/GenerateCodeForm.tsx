'use client'

import { useActionState, useState } from 'react'
import { generateCodeAction } from '@/actions/generateCode'

interface PlushType {
  slug: string
  name: string
}

interface Props {
  plushTypes: PlushType[]
}

const initialState = { success: false as boolean, error: '', code: '', email: '' }

export function GenerateCodeForm({ plushTypes }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const selectedSlug = formData.get('plushSlug') as string
      const selectedName = plushTypes.find(p => p.slug === selectedSlug)?.name ?? 'Chubiez Plushie'
      formData.set('plushName', selectedName)
      const result = await generateCodeAction(formData)
      return { ...initialState, ...result }
    },
    initialState
  )

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6">
      <h2 className="font-semibold text-[#1E1B2E] text-lg mb-4">generate & send code</h2>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#4B4866]">buyer email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="customer@example.com"
            className="rounded-xl border border-[#E8E0D5] px-4 py-2.5 text-[#1E1B2E] placeholder-[#B0A8C0] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#4B4866]">plush type</label>
          <select
            name="plushSlug"
            required
            className="rounded-xl border border-[#E8E0D5] px-4 py-2.5 text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] text-sm bg-white"
          >
            {plushTypes.map(p => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {state.error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        {state.success && state.code && (
          <div className="rounded-xl bg-[#1E1B2E] px-5 py-4 text-center">
            <p className="text-xs text-[#C4B5FD] uppercase tracking-widest mb-1">code sent to {state.email}</p>
            <p className="font-mono text-2xl tracking-[6px] text-[#FFF8F0] font-bold">{state.code}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#FB7185] text-white font-semibold py-3 text-sm transition hover:bg-[#f95f74] disabled:opacity-50"
        >
          {isPending ? 'generating...' : 'generate & send →'}
        </button>
      </form>
    </div>
  )
}
