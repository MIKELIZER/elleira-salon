import { getServices } from '@/app/actions/services'
import BookingWizard from './booking-wizard'

export default async function NewBookingPage() {
  const { data: services } = await getServices(true) // Hanya ambil layanan yang aktif

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Buat Pemesanan (Booking)</h1>
      <p className="text-slate-600 mb-6">Pilih layanan, tanggal, dan slot waktu yang sesuai dengan jadwal Anda.</p>
      
      <BookingWizard services={services || []} />
    </div>
  )
}
