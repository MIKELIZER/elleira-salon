import { createSupabaseServerClient } from '@/app/actions/auth'
import DashboardClient from './dashboard-client'

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  
  // Ambil daftar staf untuk dropdown filter
  const { data: staffList } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'staff')
    
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Laporan</h1>
        <p className="text-slate-500">Pantau performa operasional dan pendapatan salon secara real-time.</p>
      </div>

      <DashboardClient staffList={staffList || []} />
    </div>
  )
}
