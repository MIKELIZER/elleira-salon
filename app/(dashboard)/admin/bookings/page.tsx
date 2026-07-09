import { getAllBookings, updateBookingStatus } from '@/app/actions/booking'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import CheckoutDialog from '@/app/components/checkout-dialog'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default async function AdminBookingsPage() {
  const { data: bookings, error } = await getAllBookings()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] uppercase tracking-widest font-bold">Pending</span>
      case 'confirmed': return <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] uppercase tracking-widest font-bold">Confirmed</span>
      case 'completed': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] uppercase tracking-widest font-bold">Completed</span>
      case 'cancelled': return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] uppercase tracking-widest font-bold">Cancelled</span>
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">Semua Pesanan</h1>
        <p className="text-slate-500 mt-1">Pantau seluruh jadwal reservasi dari semua pelanggan.</p>
      </div>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table className="border-0">
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>Staf</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ubah Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map((b) => {
              const startDate = new Date(b.start_at)
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{b.customer.full_name}</div>
                    <div className="text-xs text-slate-500">{b.customer.phone || '-'}</div>
                  </TableCell>
                  <TableCell>{b.services.name}</TableCell>
                  <TableCell>{b.staff.full_name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{format(startDate, 'dd MMM yyyy', { locale: localeId })}</div>
                    <div className="text-xs text-slate-500">{format(startDate, 'HH:mm')} WIB</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(b.status)}
                  </TableCell>
                  <TableCell>
                    <form action={async (formData) => {
                      'use server'
                      const newStatus = formData.get('status') as string
                      await updateBookingStatus(b.id, newStatus)
                    }}>
                      <div className="flex items-center gap-2">
                        <select 
                          name="status" 
                          defaultValue={b.status}
                          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button type="submit" className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors">
                          Simpan
                        </button>
                      </div>
                    </form>
                    {b.status === 'confirmed' && <CheckoutDialog bookingId={b.id} currentStatus={b.status} />}
                  </TableCell>
                </TableRow>
              )
            })}
            {bookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Belum ada data pesanan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
