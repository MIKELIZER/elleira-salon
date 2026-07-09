'use client'

import { useState } from 'react'
import { createStaffAccount } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function NewStaffPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createStaffAccount(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/dashboard') // Kembali ke dashboard setelah sukses
    }
  }

  return (
    <div className="max-w-md">
      <Card>
        <form action={onSubmit}>
          <CardHeader>
            <CardTitle>Tambah Akun Staf</CardTitle>
            <CardDescription>Buat akun baru untuk staf salon. Akun ini memiliki akses ke portal staf.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" type="text" placeholder="Nama Staf" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="staf@salon.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Buat Akun Staf'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
