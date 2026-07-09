'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getAvailableSlots, rescheduleBooking } from '@/app/actions/booking'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

type Slot = { staffId: string, staffName: string, time: string, startAt: string, endAt: string }

export default function RescheduleWizard({ booking }: { booking: any }) {
  const router = useRouter()
  
  // Ambil tanggal dari booking lama untuk default kalender
  const initialDate = new Date(booking.start_at)
  
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [notes, setNotes] = useState(booking.notes || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (date) {
      const fetchSlots = async () => {
        setLoadingSlots(true)
        setSelectedSlot(null)
        const dateStr = format(date, 'yyyy-MM-dd')
        const result = await getAvailableSlots(dateStr, booking.service_id)
        if (result.data) {
          setSlots(result.data)
        }
        setLoadingSlots(false)
      }
      fetchSlots()
    }
  }, [date, booking.service_id])

  const handleSubmit = async () => {
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)

    const res = await rescheduleBooking(booking.id, {
      staffId: selectedSlot.staffId,
      startAt: selectedSlot.startAt,
      endAt: selectedSlot.endAt,
      notes
    })

    if (res.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      router.push('/customer/booking?rescheduled=1')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pilih Tanggal & Waktu Baru</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <Label>Pilih Tanggal Baru</Label>
            <div className="border rounded-md inline-block">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <Label>Slot Tersedia</Label>
            {!date ? (
              <div className="text-slate-500 text-sm p-4 bg-slate-50 rounded-md">Silakan pilih tanggal terlebih dahulu di kalender.</div>
            ) : loadingSlots ? (
              <div className="text-slate-500 text-sm p-4 bg-slate-50 rounded-md">Mencari jadwal yang kosong...</div>
            ) : slots.length === 0 ? (
              <div className="text-slate-500 text-sm p-4 bg-slate-50 rounded-md border border-dashed">
                Maaf, tidak ada staf yang tersedia atau semua slot telah penuh di tanggal ini.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {slots.map((slot) => {
                  const slotKey = `${slot.staffId}-${slot.startAt}`
                  const isSelected = selectedSlot?.staffId === slot.staffId && selectedSlot?.startAt === slot.startAt
                  
                  return (
                    <div 
                      key={slotKey}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 border rounded-md cursor-pointer text-center transition-all ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'}`}
                    >
                      <div className="font-bold text-lg">{slot.time}</div>
                      <div className={`text-xs mt-1 truncate ${isSelected ? 'text-primary-foreground/80' : 'text-slate-500'}`}>
                        {slot.staffName}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {selectedSlot && (
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Misal: Alergi pada produk tertentu, atau permintaan khusus."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={() => router.push('/customer/booking')} disabled={submitting}>
          Batal
        </Button>
        
        <Button onClick={handleSubmit} disabled={!selectedSlot || submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan Jadwal'}
        </Button>
      </CardFooter>
    </Card>
  )
}
