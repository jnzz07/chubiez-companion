import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { GenerateCodeForm } from '@/components/admin/GenerateCodeForm'
import { ImportCodesForm } from '@/components/admin/ImportCodesForm'
import { EmailTemplateForm } from '@/components/admin/EmailTemplateForm'
import { CodesTable } from '@/components/admin/CodesTable'
import { getPoolStats } from '@/lib/codes/pool'
import { getEmailTemplate } from '@/lib/email/settings'
import { isAdmin } from '@/lib/adminAuth'
import { adminLogoutAction } from '@/actions/adminLogin'

export const metadata = { title: 'admin — bemellou' }

export default async function AdminPage() {
  // Show setup screen if env vars not configured yet
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="min-h-screen bg-[#fffcf4] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-2xl font-bold text-[#303030] mb-2">bemellou. admin</p>
          <p className="text-[#7a7a7a] text-sm">Add your environment variables in Railway to activate this panel.</p>
        </div>
      </main>
    )
  }

  // Auth check — shared team password (see /admin/login)
  if (!(await isAdmin())) redirect('/admin/login')

  // Data
  const db = createAdminClient()

  const [plushTypesRes, codesRes, statsRes, pool, template] = await Promise.all([
    db.from('plush_types').select('slug, name').order('name'),
    db.from('access_codes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
    db.from('access_codes').select('used, expires_at, sent_at'),
    getPoolStats(db),
    getEmailTemplate(db),
  ])

  const plushTypes = plushTypesRes.data ?? []
  const codes = codesRes.data ?? []
  const totalCount = codesRes.count ?? 0
  const allCodes = statsRes.data ?? []

  const now = new Date()
  const stats = {
    total: allCodes.length,
    used: allCodes.filter(c => c.used).length,
    pending: allCodes.filter(c => !c.used && new Date(c.expires_at) > now).length,
    expired: allCodes.filter(c => !c.used && new Date(c.expires_at) <= now).length,
  }

  return (
    <main className="min-h-screen bg-[#fffcf4] px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#303030] tracking-tight">bemellou. team panel</h1>
            <p className="text-sm text-[#7a7a7a] mt-1">codes, emails &amp; template</p>
          </div>
          <form action={adminLogoutAction}>
            <button type="submit" className="text-xs text-[#7a7a7a] hover:text-[#303030] transition underline">
              sign out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'codes left in pool', value: pool.available },
            { label: 'total generated', value: stats.total },
            { label: 'redeemed', value: stats.used },
            { label: 'pending', value: stats.pending },
            { label: 'expired unused', value: stats.expired },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E8E0D5] px-5 py-4">
              <p className="text-2xl font-bold text-[#303030]">{stat.value}</p>
              <p className="text-xs text-[#7a7a7a] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Low pool warning */}
        {pool.available < 20 && (
          <div className="mb-8 rounded-lg bg-[#fde8b8]/60 border border-[#fde8b8] px-5 py-4 text-sm text-[#303030]">
            ⚠ only <strong>{pool.available}</strong> code{pool.available === 1 ? '' : 's'} left in the pool —
            export a new batch from the Bemellou app and import it below before orders start failing.
          </div>
        )}

        {/* Import + generate + template forms */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3 sm:grid-cols-2 items-start">
          <ImportCodesForm />
          <GenerateCodeForm plushTypes={plushTypes} />
          <EmailTemplateForm template={template} />
        </div>

        {/* Codes table */}
        <CodesTable codes={codes} totalCount={totalCount} />

      </div>
    </main>
  )
}
