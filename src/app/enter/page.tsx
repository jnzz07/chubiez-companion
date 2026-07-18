import { Suspense } from 'react'
import { CodeEntryForm } from '@/components/enter/CodeEntryForm'

export const metadata = {
  title: 'enter — bemellou',
  description: 'Use your access code to enter the Bemellou companion app.',
}

export default function EnterPage() {
  return (
    <main className="min-h-screen bg-[#fffcf4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#303030] tracking-tight">
            bemellou.
          </h1>
          <p className="mt-2 text-[#565656] text-sm leading-relaxed">
            enter your access code to meet your chubi
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E8E0D5] p-8">
          <Suspense fallback={<div className="text-sm text-[#7a7a7a]">loading...</div>}>
            <CodeEntryForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#7a7a7a]">
          bought a plushie but didn&apos;t get a code?{' '}
          <a href="mailto:hello@bemellou.com" className="underline hover:text-[#565656]">
            email us
          </a>
        </p>

      </div>
    </main>
  )
}
