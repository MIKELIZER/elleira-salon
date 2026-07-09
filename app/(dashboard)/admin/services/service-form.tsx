'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createService } from '@/app/actions/services'

export default function ServiceForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createService(formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        Tambah Layanan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Layanan Baru</DialogTitle>
          <DialogDescription>Masukkan detail layanan yang akan ditawarkan di salon.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Layanan</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Durasi (Menit)</Label>
            <Input id="duration_minutes" name="duration_minutes" type="number" min="1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga (IDR)</Label>
            <Input id="price" name="price" type="number" min="0" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Layanan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
