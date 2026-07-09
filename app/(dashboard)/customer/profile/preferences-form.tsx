'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updatePreferences } from '@/app/actions/preferences'
import { Loader2 } from 'lucide-react'

export default function PreferencesForm({ initialData, staffList }: { initialData: any, staffList: any[] }) {
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')
    
    const allergyNote = formData.get('allergyNote') as string
    const generalNote = formData.get('generalNote') as string
    const preferredStaffId = formData.get('preferredStaffId') as string
    
    const res = await updatePreferences({
      allergyNote,
      generalNote,
      preferredStaffId: preferredStaffId === 'none' ? null : preferredStaffId
    })

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Preferensi berhasil disimpan.')
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Khusus</CardTitle>
      </CardHeader>
      <CardContent>
        {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{successMsg}</div>}
        {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{errorMsg}</div>}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Catatan Alergi / Kondisi Kulit</label>
            <Textarea 
              name="allergyNote" 
              defaultValue={initialData?.allergy_note || ''}
              placeholder="Contoh: Kulit kepala sensitif, alergi terhadap produk mengandung amonia..."
              className="resize-none h-24"
            />
            <p className="text-xs text-slate-500">Informasi ini akan diperhatikan oleh staf kami sebelum melayani Anda.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Staf Favorit (Opsional)</label>
            <select 
              name="preferredStaffId" 
              defaultValue={initialData?.preferred_staff_id || 'none'}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">Tidak ada preferensi</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Kami akan berusaha memprioritaskan staf ini (jika tersedia) saat Anda tidak memilih staf di menu booking.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Catatan Tambahan Umum</label>
            <Textarea 
              name="generalNote" 
              defaultValue={initialData?.general_note || ''}
              placeholder="Contoh: Suka potongan rambut yang mudah diatur, tidak suka diajak mengobrol saat perawatan..."
              className="resize-none h-24"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto mt-4">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan Perubahan
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
