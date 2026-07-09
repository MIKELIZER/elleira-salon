'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { setStaffAvailability } from '@/app/actions/staff'
import { useRouter } from 'next/navigation'

const DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 0, label: 'Minggu' },
]

export default function ScheduleForm({ staffId, initialSchedules }: { staffId: string, initialSchedules: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const router = useRouter()

  const [scheduleState, setScheduleState] = useState(() => {
    const state: Record<number, { active: boolean, start: string, end: string }> = {}
    DAYS.forEach(d => {
      const existing = initialSchedules.find(s => s.day_of_week === d.value)
      if (existing) {
        state[d.value] = { active: true, start: existing.start_time.substring(0, 5), end: existing.end_time.substring(0, 5) }
      } else {
        state[d.value] = { active: false, start: '09:00', end: '17:00' }
      }
    })
    return state
  })

  const toggleDay = (day: number, checked: boolean) => {
    setScheduleState(prev => ({ ...prev, [day]: { ...prev[day], active: checked } }))
  }

  const updateTime = (day: number, field: 'start' | 'end', val: string) => {
    setScheduleState(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }))
  }

  const onSubmit = async () => {
    setLoading(true)
    setError(null)
    
    const payload = DAYS.filter(d => scheduleState[d.value].active).map(d => ({
      day_of_week: d.value,
      start_time: scheduleState[d.value].start,
      end_time: scheduleState[d.value].end
    }))

    const result = await setStaffAvailability(staffId, payload)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/admin/staff')
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        {DAYS.map(day => {
          const slot = scheduleState[day.value]
          return (
            <div key={day.value} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center space-x-4 w-32">
                <Switch checked={slot.active} onCheckedChange={(c) => toggleDay(day.value, c)} />
                <Label className={slot.active ? 'font-medium' : 'text-slate-400'}>{day.label}</Label>
              </div>
              
              {slot.active ? (
                <div className="flex items-center space-x-2">
                  <Input type="time" value={slot.start} onChange={(e) => updateTime(day.value, 'start', e.target.value)} className="w-32" required />
                  <span className="text-slate-500">-</span>
                  <Input type="time" value={slot.end} onChange={(e) => updateTime(day.value, 'end', e.target.value)} className="w-32" required />
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic">Libur</div>
              )}
            </div>
          )
        })}

        <Button onClick={onSubmit} className="w-full" disabled={loading}>
          {loading ? 'Menyimpan Jadwal...' : 'Simpan Jadwal'}
        </Button>
      </CardContent>
    </Card>
  )
}
