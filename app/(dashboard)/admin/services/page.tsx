import { getServices, toggleServiceStatus } from '@/app/actions/services'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ServiceForm from './service-form'

export default async function AdminServicesPage() {
  const { data: services, error } = await getServices(false)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">Manajemen Layanan</h1>
          <p className="text-slate-500 mt-1">Kelola daftar layanan salon dan harganya.</p>
        </div>
        <ServiceForm />
      </div>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table className="border-0">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Layanan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Durasi (Menit)</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.map((svc) => (
              <TableRow key={svc.id}>
                <TableCell className="font-medium">{svc.name}</TableCell>
                <TableCell>{svc.category || '-'}</TableCell>
                <TableCell>{svc.duration_minutes}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(svc.price)}
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${svc.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {svc.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell>
                  <form action={async () => {
                    'use server'
                    await toggleServiceStatus(svc.id, svc.is_active)
                  }}>
                    <Button variant="outline" size="sm" type="submit" className="rounded-xl text-xs font-medium shadow-none hover:bg-slate-50">
                      {svc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {services?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Belum ada data layanan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
