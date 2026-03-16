import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GenerateCodeForm } from '@/components/admin/GenerateCodeForm'
import { CodesTable } from '@/components/admin/CodesTable'

export const metadata = { title: 'admin — chubiez' }

export default async function AdminPage() {
  // Show setup screen if env vars not configured yet
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-2xl font-bold text-[#1E1B2E] mb-2">chubiez. admin</p>
          <p className="text-[#8B84A8] text-sm">Add your environment variables in Railway to activate this panel.</p>
        </div>
      </main>
    )
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) redirect('/enter')

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email.toLowerCase())) redirect('/home')

  // Data
  const db = createAdminClient()

  const [plushTypesRes, codesRes, statsRes] = await Promise.all([
    db.from('plush_types').select('slug, name').order('name'),
    db.from('access_codes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
    db.from('access_codes').select('used, expires_at, sent_at'),
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
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E1B2E] tracking-tight">chubiez. admin</h1>
          <p className="text-sm text-[#8B84A8] mt-1">manage access codes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'total generated', value: stats.total },
            { label: 'redeemed', value: stats.used },
            { label: 'pending', value: stats.pending },
            { label: 'expired unused', value: stats.expired },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E8E0D5] px-5 py-4">
              <p className="text-2xl font-bold text-[#1E1B2E]">{stat.value}</p>
              <p className="text-xs text-[#8B84A8] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Generate form */}
        <div className="mb-8 max-w-sm">
          <GenerateCodeForm plushTypes={plushTypes} />
        </div>

        {/* Codes table */}
        <CodesTable codes={codes} totalCount={totalCount} />

      </div>
    </main>
  )
}
