'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ProfileForm({ initialData }: { initialData: { fullName: string, phone: string } }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    const result = await updateProfile(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Profil berhasil diperbarui.')
    }
    setLoading(false)
  }

  return (
    <Card>
      <form action={onSubmit}>
        <CardHeader>
          <CardTitle>Data Diri</CardTitle>
          <CardDescription>Perbarui informasi profil Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          {success && <div className="text-sm text-green-600 font-medium">{success}</div>}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" type="text" defaultValue={initialData.fullName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={initialData.phone} placeholder="08123456789" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
