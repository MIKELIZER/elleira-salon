import { createSupabaseServerClient } from '@/app/actions/auth'
import { getOwnAvailability } from '@/app/actions/staff'
import { getAllBookings } from '@/app/actions/booking'
import { format, isToday } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { id as localeId } from 'date-fns/locale'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default async function StaffDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <div>Unauthorized</div>

  // Fetch staff profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, id')
    .eq('auth_user_id', user.id)
    .single()

  const staffName = profile?.full_name?.split(' ')[0] || 'Staf'

  // Fetch Working Hours
  const { data: availability } = await getOwnAvailability()
  
  // Fetch Bookings
  const { data: allBookings } = await getAllBookings(user.id)
  
  const TIMEZONE = 'Asia/Jakarta'
  const nowWib = toZonedTime(new Date(), TIMEZONE)
  const todayStr = format(nowWib, 'yyyy-MM-dd')

  // Filter for today (in WIB timezone)
  const todaysBookings = allBookings?.filter(b => {
    const bookingWib = toZonedTime(new Date(b.start_at), TIMEZONE)
    return format(bookingWib, 'yyyy-MM-dd') === todayStr
  }) || []
  
  // Urutkan berdasarkan waktu
  todaysBookings.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  return (
    <div className="space-y-10">
      
      {/* Greeting Banner */}
      <div className="bg-gradient-to-br from-[#ebd3d3]/30 to-white p-8 md:p-10 rounded-3xl border border-rose-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-[#b88e4f] uppercase tracking-widest text-xs font-bold mb-2">Dashboard Staf</p>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-2">Selamat Bekerja, {staffName}.</h1>
          <p className="text-slate-600 max-w-lg">
            Berikut adalah ringkasan jam kerja mingguan Anda dan daftar pesanan pelanggan yang harus dilayani khusus hari ini.
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-slate-700 min-w-[200px]">
          <CalendarIcon className="w-8 h-8 text-[#b88e4f] p-1.5 bg-rose-50 rounded-lg" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hari Ini</p>
            <p className="font-bold">{format(new Date(), 'dd MMMM yyyy', { locale: localeId })}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Jadwal Pesanan Hari Ini */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-serif text-slate-900 flex items-center gap-2">
            Pesanan Hari Ini <span className="bg-rose-100 text-rose-700 text-sm px-3 py-1 rounded-full ml-2 font-sans font-bold">{todaysBookings.length}</span>
          </h2>
          
          <div className="space-y-4">
            {todaysBookings.map((b: any) => {
              const startDate = new Date(b.start_at)
              const preferences = b.customer?.customer_preferences?.[0]
              
              return (
                <div key={b.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 bottom-0 left-0 w-2 bg-[#b88e4f]"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                          {format(startDate, 'HH:mm')}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900">{b.services?.name || '-'}</h3>
                      </div>
                      
                      <div className="text-slate-600 text-sm mb-4 sm:mb-0">
                        Pelanggan: <span className="font-semibold text-slate-800">{b.customer?.full_name || 'Pelanggan Rahasia'}</span> 
                        {b.customer?.phone && ` (${b.customer.phone})`}
                      </div>
                    </div>
                    
                    <div>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          b.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.status}
                        </span>
                    </div>
                  </div>
                  
                  {/* Preferences Section */}
                  {(preferences?.allergy_note || preferences?.general_note) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid gap-3">
                      {preferences.allergy_note && (
                        <div className="flex gap-2 text-sm bg-red-50 text-red-700 p-3 rounded-xl border border-red-100">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                          <div>
                            <span className="font-bold block text-xs uppercase tracking-widest mb-0.5">Peringatan Alergi</span>
                            {preferences.allergy_note}
                          </div>
                        </div>
                      )}
                      
                      {preferences.general_note && (
                        <div className="text-sm bg-[#FDF9F8] text-slate-700 p-3 rounded-xl border border-rose-100">
                          <span className="font-bold text-[#b88e4f] block text-xs uppercase tracking-widest mb-0.5">Request Khusus</span>
                          {preferences.general_note}
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              )
            })}

            {todaysBookings.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-slate-900 mb-1">Tidak Ada Jadwal</h3>
                <p className="text-slate-500 text-sm">Anda belum memiliki pesanan untuk hari ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Jam Kerja Mingguan */}
        <div>
          <h2 className="text-2xl font-serif text-slate-900 mb-6">Jam Kerja Anda</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50">
            {availability && availability.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {availability.map((av: any) => (
                  <div key={av.id} className="py-4 flex justify-between items-center group hover:bg-slate-50 px-2 rounded-lg transition-colors">
                    <span className="font-medium text-slate-700 group-hover:text-[#b88e4f] transition-colors">{DAY_NAMES[av.day_of_week]}</span>
                    <span className="text-sm bg-slate-100 px-3 py-1 rounded-md text-slate-600 font-mono">
                      {av.start_time.slice(0, 5)} - {av.end_time.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Jadwal kerja belum diatur oleh Admin.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
