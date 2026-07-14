import { getAllBookings, updateBookingStatus } from '@/app/actions/booking'
import { createSupabaseServerClient } from '@/app/actions/auth'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import CheckoutDialog from '@/app/components/checkout-dialog'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default async function StaffBookingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: bookings, error } = await getAllBookings(user?.id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
      case 'confirmed': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Confirmed</span>
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-slate-900 mb-2">Riwayat Pesanan</h1>
        <p className="text-slate-500">Seluruh daftar pesanan pelanggan yang ditugaskan kepada Anda.</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="border border-rose-50 rounded-3xl bg-white shadow-sm overflow-hidden p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Layanan</TableHead>
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
                    <div className="font-medium">{b.customer?.full_name || 'Pelanggan Rahasia'}</div>
                    <div className="text-xs text-slate-500 mb-1">{b.customer?.phone || '-'}</div>
                    {b.customer?.customer_preferences?.[0]?.allergy_note && (
                      <div className="text-[10px] bg-red-50 text-red-700 p-1 border border-red-100 rounded inline-block mt-1">
                        ⚠️ Alergi: {b.customer.customer_preferences[0].allergy_note}
                      </div>
                    )}
                    {b.customer?.customer_preferences?.[0]?.general_note && (
                      <div className="text-[10px] bg-slate-100 text-slate-700 p-1 border border-slate-200 rounded block mt-1">
                        Catatan: {b.customer.customer_preferences[0].general_note}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{b.services?.name || '-'}</TableCell>
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
                          className="border rounded-md px-2 py-1 text-sm bg-slate-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button type="submit" className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
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
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Anda belum memiliki jadwal pesanan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
