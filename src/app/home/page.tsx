import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'home — chubiez' }

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/enter')
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/enter')

  const db = createAdminClient()
  const { data: profile } = await db
    .from('companion_users')
    .select('display_name, plush_type_slug, plush_types(name)')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plushTypesData = profile?.plush_types as any
  const plushName = (Array.isArray(plushTypesData) ? plushTypesData[0]?.name : plushTypesData?.name) ?? 'your chubi'
  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'you'

  return (
    <main className="min-h-screen bg-[#1E1B2E] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">

        {/* Logo */}
        <p className="text-[#C4B5FD] font-bold text-2xl tracking-tight mb-8">chubiez.</p>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFF8F0] tracking-tight leading-tight">
            hey, {displayName}.
          </h1>
          <p className="mt-3 text-[#8B84A8] text-base leading-relaxed">
            {plushName} is here for you.
            <br />
            no performance required.
          </p>
        </div>

        {/* Plush card */}
        <div className="bg-[#2A2640] rounded-2xl px-8 py-10 mb-8 border border-[#3D3860]">
          <div className="w-20 h-20 rounded-full bg-[#C4B5FD] mx-auto mb-4 flex items-center justify-center text-3xl">
            🤍
          </div>
          <p className="text-[#FFF8F0] font-semibold text-lg">{plushName}</p>
          <p className="text-[#8B84A8] text-sm mt-1">companion activated</p>
        </div>

        {/* Placeholder content hint */}
        <p className="text-[#4B4866] text-sm mb-8">
          more content coming here — moods, journal, community.
          <br />
          your chubi is just getting comfortable.
        </p>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-[#4B4866] hover:text-[#8B84A8] transition underline"
          >
            sign out
          </button>
        </form>

      </div>
    </main>
  )
}
