import { Suspense } from 'react'
import { CodeEntryForm } from '@/components/enter/CodeEntryForm'

export const metadata = {
  title: 'enter — chubiez',
  description: 'Use your access code to enter the Chubiez companion app.',
}

export default function EnterPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1E1B2E] tracking-tight">
            chubiez.
          </h1>
          <p className="mt-2 text-[#4B4866] text-sm leading-relaxed">
            enter your access code to meet your chubi
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E0D5] p-8">
          <Suspense fallback={<div className="text-sm text-[#8B84A8]">loading...</div>}>
            <CodeEntryForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#8B84A8]">
          bought a plushie but didn&apos;t get a code?{' '}
          <a href="mailto:hello@chubiez.com" className="underline hover:text-[#4B4866]">
            email us
          </a>
        </p>

      </div>
    </main>
  )
}
