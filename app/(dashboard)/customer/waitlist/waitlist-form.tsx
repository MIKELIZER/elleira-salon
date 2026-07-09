'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { joinWaitlist } from '@/app/actions/waitlist'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Service = { id: string, name: string }
type Staff = { id: string, full_name: string }

export default function WaitlistForm({ 
  services, 
  staffList, 
  initialServiceId, 
  initialDate 
}: { 
  services: Service[], 
  staffList: Staff[], 
  initialServiceId?: string, 
  initialDate?: string 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setErrorMsg('')
    
    const serviceId = formData.get('serviceId') as string
    const desiredDate = formData.get('desiredDate') as string
    const preferredStaffId = formData.get('preferredStaffId') as string
    const desiredTimeRange = formData.get('desiredTimeRange') as string

    if (!serviceId || !desiredDate) {
      setErrorMsg('Layanan dan Tanggal wajib diisi.')
      setLoading(false)
      return
    }

    const res = await joinWaitlist({
      serviceId,
      desiredDate,
      preferredStaffId: preferredStaffId === 'none' ? null : preferredStaffId,
      desiredTimeRange
    })

    if (res.error) {
      setErrorMsg(res.error)
      setLoading(false)
    } else {
      router.push('/customer/waitlist')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Waitlist</CardTitle>
      </CardHeader>
      <CardContent>
        {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{errorMsg}</div>}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Layanan yang Diinginkan</Label>
            <select 
              name="serviceId" 
              defaultValue={initialServiceId || (services.length > 0 ? services[0].id : '')}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Harapan</Label>
            <Input 
              type="date" 
              name="desiredDate" 
              defaultValue={initialDate || ''}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rentang Waktu Harapan (Opsional)</Label>
            <Input 
              type="text" 
              name="desiredTimeRange" 
              placeholder="Contoh: Pagi hari (09:00 - 12:00) atau Jam Pulang Kerja"
            />
          </div>

          <div className="space-y-2">
            <Label>Staf Favorit (Opsional)</Label>
            <select 
              name="preferredStaffId" 
              defaultValue="none"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">Siapa saja boleh</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/customer/waitlist')}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan ke Daftar Tunggu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
