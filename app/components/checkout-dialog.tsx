'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTransaction } from '@/app/actions/transaction'

export default function CheckoutDialog({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (currentStatus !== 'confirmed') return null

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    const res = await createTransaction(bookingId, paymentMethod)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-7 px-3 ml-2">
        Bayar & Selesai
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proses Pembayaran Kasir</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-500">Harga layanan akan ditarik secara otomatis dari sistem dengan aman (Server-side).</p>
          
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">Metode Pembayaran</label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || 'cash')}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Metode Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai (Cash)</SelectItem>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                <SelectItem value="qris_manual">QRIS Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleCheckout} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
            {loading ? 'Memproses Transaksi...' : 'Konfirmasi Transaksi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
