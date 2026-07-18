import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export const metadata = { title: 'team login — bemellou' }

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin')

  return (
    <main className="min-h-screen bg-[#fffcf4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#303030] tracking-tight">bemellou.</h1>
          <p className="mt-2 text-[#565656] text-sm">team panel — enter the shared password</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#E8E0D5] p-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  )
}
