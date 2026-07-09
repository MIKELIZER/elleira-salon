import { createSupabaseServerClient } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import RescheduleWizard from './reschedule-wizard'

export default async function RescheduleBookingPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ambil detail booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, services(id, name, duration_minutes, price)')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single()

  if (error || !booking) {
    return <div className="p-8 text-center text-red-500">Booking tidak ditemukan atau Anda tidak berhak mengubahnya.</div>
  }

  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return <div className="p-8 text-center text-red-500">Booking yang sudah selesai atau dibatalkan tidak bisa diubah jadwalnya.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Ubah Jadwal Pesanan</h1>
        <p className="text-slate-500">Layanan: <span className="font-semibold text-slate-700">{booking.services?.name}</span></p>
      </div>

      <RescheduleWizard booking={booking} />
    </div>
  )
}
