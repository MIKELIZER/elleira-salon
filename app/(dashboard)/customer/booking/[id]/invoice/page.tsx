import { getInvoice } from '@/app/actions/transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import PrintButton from './print-button'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const { data, error } = await getInvoice(params.id)

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Struk Tidak Tersedia</h2>
        <p className="text-slate-500 mb-6">{error || 'Pesanan belum dibayar atau tidak ditemukan.'}</p>
        <Link href="/customer/booking">
          <Button>Kembali ke Riwayat</Button>
        </Link>
      </div>
    )
  }

  const transaction = data.transactions[0]
  const paidAt = transaction.paid_at ? new Date(transaction.paid_at) : new Date(transaction.created_at || Date.now())
  
  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href="/customer/booking">
          <Button variant="outline">Kembali</Button>
        </Link>
        <PrintButton />
      </div>

      <Card className="border border-slate-200 shadow-sm print:shadow-none print:border-none">
        <CardHeader className="text-center pb-8 border-b">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">LUNAS</CardTitle>
          <div className="text-sm text-slate-500 mt-2">Terima kasih atas kunjungan Anda!</div>
        </CardHeader>
        
        <CardContent className="pt-8">
          <div className="grid grid-cols-2 gap-y-6 text-sm mb-8">
            <div>
              <div className="text-slate-500 mb-1">ID Transaksi</div>
              <div className="font-mono text-xs text-slate-700">{transaction.id}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 mb-1">Tanggal Pembayaran</div>
              <div className="font-medium text-slate-900">{format(paidAt, 'dd MMM yyyy, HH:mm', { locale: localeId })} WIB</div>
            </div>
            
            <div>
              <div className="text-slate-500 mb-1">Pelanggan</div>
              <div className="font-medium text-slate-900">{data.customer.full_name}</div>
              <div className="text-slate-500 text-xs mt-1">{data.customer.email}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 mb-1">Metode Pembayaran</div>
              <div className="font-medium text-slate-900 uppercase">{transaction.payment_method.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-slate-50 mb-8">
            <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Detail Layanan</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{data.services.name}</div>
                <div className="text-xs text-slate-500 mt-1">Ditangani oleh: {data.staff.full_name}</div>
                <div className="text-xs text-slate-500">Waktu: {format(new Date(data.start_at), 'dd MMM yyyy, HH:mm')}</div>
              </div>
              <div className="font-bold text-lg text-slate-900">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.amount)}
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-slate-400 mt-12">
            Struk ini diterbitkan oleh sistem secara otomatis dan sah sebagai bukti pembayaran.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
