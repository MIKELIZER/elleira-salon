import { getServices } from '@/app/actions/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PublicServicesPage() {
  const { data: services, error } = await getServices(true)

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Katalog Layanan</h1>
          <p className="text-slate-600 mt-2">Pilih layanan perawatan terbaik dari staf profesional kami.</p>
        </div>
        <Link href="/login">
          <Button variant="outline">Masuk / Daftar</Button>
        </Link>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((svc) => (
          <Card key={svc.id}>
            <CardHeader>
              <CardTitle>{svc.name}</CardTitle>
              <CardDescription>{svc.category || 'Umum'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>{svc.duration_minutes} Menit</span>
                <span>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(svc.price)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {services?.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-12">Belum ada layanan yang tersedia saat ini.</div>
        )}
      </div>
    </div>
  )
}
