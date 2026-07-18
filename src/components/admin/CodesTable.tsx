'use client'

import { useState, useTransition } from 'react'
import { resendCodeAction } from '@/actions/generateCode'

interface AccessCode {
  id: string
  email: string
  code: string
  plush_type_slug: string | null
  used: boolean
  used_at: string | null
  expires_at: string
  created_at: string
  sent_at: string | null
  generated_by: string
  shopify_order_id: string | null
}

interface Props {
  codes: AccessCode[]
  totalCount: number
}

function getStatus(code: AccessCode): { label: string; color: string } {
  if (code.used) return { label: 'used', color: 'bg-green-100 text-green-700' }
  if (new Date(code.expires_at) < new Date()) return { label: 'expired', color: 'bg-gray-100 text-gray-500' }
  if (code.sent_at) return { label: 'sent', color: 'bg-blue-100 text-blue-700' }
  return { label: 'pending', color: 'bg-yellow-100 text-yellow-700' }
}

export function CodesTable({ codes, totalCount }: Props) {
  const [isPending, startTransition] = useTransition()
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; msg: string } | null>(null)

  function handleResend(id: string) {
    setResendingId(id)
    startTransition(async () => {
      const result = await resendCodeAction(id)
      setFeedback({ id, msg: result.success ? 'resent!' : (result as { error: string }).error })
      setResendingId(null)
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8E0D5] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between">
        <h2 className="font-semibold text-[#303030] text-lg">all codes</h2>
        <span className="text-sm text-[#7a7a7a]">{totalCount} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E0D5] bg-[#fffcf4]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">plush</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">created</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a7a7a] uppercase tracking-wider">actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EBE4]">
            {codes.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-[#7a7a7a] py-10 text-sm">
                  no codes yet. generate one above.
                </td>
              </tr>
            )}
            {codes.map(code => {
              const status = getStatus(code)
              return (
                <tr key={code.id} className="hover:bg-[#fffcf4] transition">
                  <td className="px-4 py-3 text-[#303030]">{code.email}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm tracking-wider bg-[#303030] text-[#fffcf4] px-2 py-0.5 rounded-md">
                      {code.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#565656]">{code.plush_type_slug ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#7a7a7a]">{code.generated_by}</td>
                  <td className="px-4 py-3 text-[#7a7a7a]">
                    {new Date(code.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!code.used && (
                      <button
                        onClick={() => handleResend(code.id)}
                        disabled={isPending && resendingId === code.id}
                        className="text-xs text-[#8ed1fc] hover:text-[#303030] transition disabled:opacity-50"
                      >
                        {resendingId === code.id ? 'sending...' :
                          feedback?.id === code.id ? feedback.msg : 'resend'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
