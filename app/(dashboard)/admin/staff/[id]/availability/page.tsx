import { getStaffAvailability } from '@/app/actions/staff'
import ScheduleForm from './schedule-form'

export default async function StaffAvailabilityPage({ params }: { params: { id: string } }) {
  // Dalam Next.js App Router yang baru, params dapat di-await (atau diakses langsung jika synchronous)
  const staffId = params.id
  const { data: schedules, error } = await getStaffAvailability(staffId)

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Pengaturan Jadwal Staf</h1>
      <p className="text-slate-600 mb-6">Atur hari dan jam kerja operasional staf ini. Jadwal ini akan digunakan untuk menentukan ketersediaan slot booking.</p>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ScheduleForm staffId={staffId} initialSchedules={schedules || []} />
      )}
    </div>
  )
}
