import { getPreferences } from '@/app/actions/preferences'
import { createSupabaseServerClient } from '@/app/actions/auth'
import PreferencesForm from './preferences-form'

export default async function CustomerProfilePage() {
  const { data: preferences, error } = await getPreferences()
  
  // Ambil daftar staff untuk dropdown preferred staff
  const supabase = await createSupabaseServerClient()
  const { data: staffList } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'staff')
    .eq('is_active', true)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-serif text-slate-900 mb-3">Profil & Preferensi</h1>
        <p className="text-slate-500">Sesuaikan preferensi Anda agar kami dapat memberikan pelayanan terbaik dan personalisasi pengalaman kunjungan Anda.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl">Error: {error}</div>
      ) : (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-rose-50 shadow-sm">
          <PreferencesForm initialData={preferences} staffList={staffList || []} />
        </div>
      )}
    </div>
  )
}
