import { createSupabaseServerClient } from '@/app/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarIcon, Clock, Scissors, MapPin, ArrowRight } from 'lucide-react'

export default async function CustomerDashboard() {
  const supabase = await createSupabaseServerClient()
  
  // Ambil data profil pelanggan (termasuk namanya)
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('auth_user_id', user?.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'Pelanggan'

  // Ambil 1 reservasi mendatang terdekat (jika ada)
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(`
      id, 
      booking_date, 
      start_time, 
      status,
      services ( name, duration_minutes ),
      profiles!bookings_staff_id_fkey ( full_name )
    `)
    .eq('customer_id', user?.id)
    .in('status', ['pending', 'confirmed'])
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(1)

  const nextBooking = upcomingBookings?.[0]

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-900/5 flex flex-col md:flex-row">
        <div className="p-10 md:p-12 flex-1 flex flex-col justify-center">
          <p className="text-[#b88e4f] uppercase tracking-widest text-xs font-bold mb-4">Portal Member</p>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">
            Halo, {firstName}.
          </h1>
          <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
            Siap untuk memanjakan diri hari ini? Segera atur jadwal kunjungan Anda dan nikmati pelayanan eksklusif kami.
          </p>
          <div>
            <Link 
              href="/customer/booking" 
              className="inline-flex items-center justify-center bg-[#b88e4f] hover:bg-[#a67d40] text-white px-8 h-12 uppercase tracking-widest text-xs font-bold transition-all hover:scale-105"
            >
              Buat Reservasi Baru <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
        <div className="relative w-full md:w-5/12 h-64 md:h-auto min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10 md:block hidden"></div>
          <Image 
            src="/hero_new_salon.png" 
            alt="Welcome to Elleira" 
            fill 
            className="object-cover"
          />
        </div>
      </div>

      {/* Quick Status Section */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Next Appointment Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          
          <h2 className="text-xl font-serif text-slate-900 mb-6 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-3 text-[#b88e4f]" /> Kunjungan Mendatang
          </h2>
          
          {nextBooking ? (
            <div className="bg-[#FDF9F8] p-6 rounded-2xl border border-rose-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{(nextBooking.services as any)?.name}</p>
                  <p className="text-sm text-slate-500">Stylist: {(nextBooking.profiles as any)?.full_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  nextBooking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {nextBooking.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-600 mt-4 pt-4 border-t border-rose-900/10">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#b88e4f]" />
                  {nextBooking.booking_date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#b88e4f]" />
                  {nextBooking.start_time.slice(0, 5)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500 text-sm mb-4">Belum ada reservasi dalam waktu dekat.</p>
              <Link href="/customer/booking" className="text-sm font-bold text-[#b88e4f] uppercase tracking-widest hover:underline">
                Booking Sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-50">
          <h2 className="text-xl font-serif text-slate-900 mb-6">Akses Cepat</h2>
          <div className="space-y-4">
            <Link href="/customer/waitlist" className="flex items-center p-4 rounded-2xl hover:bg-[#FDF9F8] border border-transparent hover:border-rose-100 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-slate-900">Daftar Tunggu</h4>
                <p className="text-xs text-slate-500">Antre untuk jadwal yang penuh</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#b88e4f] group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link href="/customer/profile" className="flex items-center p-4 rounded-2xl hover:bg-[#FDF9F8] border border-transparent hover:border-rose-100 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-slate-900">Preferensi Stylist</h4>
                <p className="text-xs text-slate-500">Atur stylist favorit Anda</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#b88e4f] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
