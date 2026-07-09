import { getCustomerBookings, cancelBooking } from '@/app/actions/booking'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import Link from 'next/link'
import { CalendarIcon, Clock, Scissors, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function CustomerBookingsPage() {
  const { data: bookings, error } = await getCustomerBookings()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Menunggu Konfirmasi</span>
      case 'confirmed': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Terkonfirmasi</span>
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Selesai</span>
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Dibatalkan</span>
      default: return null
    }
  }

  const activeBookings = bookings?.filter(b => b.status === 'pending' || b.status === 'confirmed') || []
  const historyBookings = bookings?.filter(b => b.status === 'completed' || b.status === 'cancelled') || []

  const renderBookingCard = (booking: any, isHistory: boolean) => {
    const startDate = new Date(booking.start_at)
    const isCancelable = (booking.status === 'pending' || booking.status === 'confirmed') && startDate.getTime() > Date.now()
    
    return (
      <Card key={booking.id} className="overflow-hidden mb-6 rounded-3xl border-rose-50 shadow-sm hover:shadow-md transition-shadow">
        <div className="md:flex">
          <div className="bg-[#FDF9F8] p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-rose-100 flex flex-col justify-center items-center text-center">
            <div className="text-xs text-[#b88e4f] uppercase font-bold tracking-widest mb-1">
              {format(startDate, 'MMM yyyy', { locale: localeId })}
            </div>
            <div className="text-6xl font-serif text-slate-900 mb-1">
              {format(startDate, 'dd')}
            </div>
            <div className="text-sm text-slate-500 font-medium tracking-wide">
              {format(startDate, 'EEEE', { locale: localeId })}
            </div>
          </div>
          
          <div className="p-8 md:w-2/3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                    <Scissors className="w-5 h-5 text-[#b88e4f]" />
                    {booking.services.name}
                  </h3>
                  <div className="text-slate-500 mt-2 flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" /> Stylist: <span className="font-medium text-slate-700">{booking.profiles?.full_name || 'Menunggu Penugasan'}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-[#b88e4f]" />
                  <span className="font-semibold">{format(startDate, 'HH:mm')}</span> WIB
                </div>
                <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                <div className="text-slate-700">
                  Durasi <span className="font-semibold">{booking.services.duration_minutes}</span> Menit
                </div>
                <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                <div className="text-slate-900 font-bold">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.services.price)}
                </div>
              </div>
              
              {booking.notes && (
                <div className="text-sm text-slate-600 mb-6 bg-[#FDF9F8] p-4 rounded-xl border border-rose-100">
                  <span className="font-bold text-[#b88e4f]">Catatan Tambahan: </span> {booking.notes}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
              {isCancelable && (
                <>
                  <Link href={`/customer/booking/${booking.id}/reschedule`}>
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 h-10 px-6">Ubah Jadwal</Button>
                  </Link>
                  <form action={async () => {
                    'use server'
                    await cancelBooking(booking.id)
                  }}>
                    <Button variant="destructive" className="rounded-full h-10 px-6" type="submit">
                      Batalkan
                    </Button>
                  </form>
                </>
              )}
              {booking.status === 'completed' && (
                <Link href={`/customer/booking/${booking.id}/invoice`}>
                  <Button variant="outline" className="rounded-full border-[#b88e4f] text-[#b88e4f] hover:bg-[#FDF9F8] h-10 px-6">
                    Lihat Struk
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-serif text-slate-900 mb-2">Riwayat Reservasi</h1>
          <p className="text-slate-500">Kelola jadwal perawatan kecantikan Anda di sini.</p>
        </div>
        <Link href="/customer/booking/new">
          <Button className="bg-[#b88e4f] hover:bg-[#a67d40] text-white rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold shadow-lg shadow-[#b88e4f]/20">
            Reservasi Baru
          </Button>
        </Link>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-8 bg-[#FDF9F8] p-1 rounded-full border border-rose-100">
          <TabsTrigger value="active" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:text-[#b88e4f] data-[state=active]:shadow-sm">Aktif ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:text-[#b88e4f] data-[state=active]:shadow-sm">Selesai ({historyBookings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {activeBookings.map(b => renderBookingCard(b, false))}
          
          {activeBookings.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-rose-50 shadow-sm">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">Belum ada jadwal</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Anda belum memiliki jadwal reservasi aktif. Yuk rencanakan *me-time* Anda!</p>
              <Link href="/customer/booking/new">
                <Button className="bg-[#b88e4f] hover:bg-[#a67d40] rounded-full h-12 px-8 uppercase tracking-widest text-xs font-bold">Pesan Sekarang</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {historyBookings.map(b => renderBookingCard(b, true))}
          
          {historyBookings.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada riwayat kunjungan</h3>
              <p className="text-slate-500">Anda belum pernah menyelesaikan pemesanan layanan kami.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
