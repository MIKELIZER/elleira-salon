import { getStaffList, toggleStaffStatus } from '@/app/actions/staff'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminStaffPage() {
  const { data: staffs, error } = await getStaffList()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">Manajemen Staf</h1>
          <p className="text-slate-500 mt-1">Kelola data pegawai dan atur jadwal mereka.</p>
        </div>
        <Link href="/admin/staff/new">
          <Button className="rounded-xl font-bold shadow-sm">Tambah Staf Baru</Button>
        </Link>
      </div>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table className="border-0">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Staf</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs?.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.full_name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${staff.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {staff.is_active !== false ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell className="space-x-2">
                  <Link href={`/admin/staff/${staff.id}/availability`}>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-medium shadow-none hover:bg-slate-50">Jadwal</Button>
                  </Link>
                  <form action={async () => {
                    'use server'
                    await toggleStaffStatus(staff.id, staff.is_active !== false)
                  }} className="inline-block">
                    <Button variant={staff.is_active !== false ? 'outline' : 'default'} size="sm" type="submit" className={`rounded-xl text-xs font-medium shadow-none ${staff.is_active !== false ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                      {staff.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {staffs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">Belum ada akun staf.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
