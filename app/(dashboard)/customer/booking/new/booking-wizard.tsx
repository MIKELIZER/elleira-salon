'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { CalendarIcon, Clock, User, CheckCircle2 } from 'lucide-react'
import { getAvailableSlots, createBooking } from '@/app/actions/booking'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Service = { id: string, name: string, duration_minutes: number, price: number }
type Slot = { staffId: string, staffName: string, time: string, startAt: string, endAt: string }

export default function BookingWizard({ services }: { services: Service[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  const [serviceId, setServiceId] = useState<string>('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch slots whenever serviceId or date changes
  useEffect(() => {
    if (step === 2 && serviceId && date) {
      const fetchSlots = async () => {
        setLoadingSlots(true)
        setSelectedSlot(null)
        // Adjust for local timezone offset safely to format as YYYY-MM-DD
        const dateStr = format(date, 'yyyy-MM-dd')
        const result = await getAvailableSlots(dateStr, serviceId)
        if (result.data) {
          setSlots(result.data)
        }
        setLoadingSlots(false)
      }
      fetchSlots()
    }
  }, [step, serviceId, date])

  const handleNext = () => {
    if (step === 1 && !serviceId) return
    if (step === 2 && !selectedSlot) return
    setError(null)
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!serviceId || !selectedSlot) return
    setSubmitting(true)
    setError(null)

    const res = await createBooking({
      serviceId,
      staffId: selectedSlot.staffId,
      startAt: selectedSlot.startAt,
      endAt: selectedSlot.endAt,
      notes
    })

    if (res.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      router.push('/customer/booking?success=1')
    }
  }

  const selectedService = services.find(s => s.id === serviceId)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full mx-1 ${step >= s ? 'bg-primary' : 'bg-slate-100'}`} />
          ))}
        </div>
        <CardTitle>
          {step === 1 && "Langkah 1: Pilih Layanan"}
          {step === 2 && "Langkah 2: Pilih Tanggal & Waktu"}
          {step === 3 && "Langkah 3: Konfirmasi Pesanan"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Pilih jenis perawatan yang Anda inginkan."}
          {step === 2 && "Tentukan tanggal dan jam kedatangan Anda."}
          {step === 3 && "Periksa kembali detail pesanan Anda sebelum mengonfirmasi."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Layanan Tersedia</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(svc => (
                <div 
                  key={svc.id} 
                  onClick={() => setServiceId(svc.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${serviceId === svc.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-slate-300'}`}
                >
                  <div className="font-semibold">{svc.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{svc.duration_minutes} Menit</div>
                  <div className="text-primary font-medium mt-2">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(svc.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Pilih Tanggal</Label>
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
                  <p className="mb-4">Maaf, tidak ada staf yang tersedia atau semua slot telah penuh di tanggal ini.</p>
                  <Link href={`/customer/waitlist?new=1&serviceId=${serviceId}&date=${format(date, 'yyyy-MM-dd')}`}>
                    <Button variant="outline" className="w-full font-medium">Masuk Daftar Tunggu (Waitlist)</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {slots.map((slot, idx) => {
                    // Pakai kombinasi staffId dan startAt sebagai key
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
        )}

        {/* STEP 3 */}
        {step === 3 && selectedService && selectedSlot && date && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-lg border">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Ringkasan Pemesanan</h3>
              
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-slate-500">Layanan</div>
                <div className="font-medium">{selectedService.name}</div>
                
                <div className="text-slate-500">Harga</div>
                <div className="font-medium text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(selectedService.price)}</div>
                
                <div className="text-slate-500">Tanggal</div>
                <div className="font-medium">{format(date, 'EEEE, dd MMMM yyyy', { locale: localeId })}</div>
                
                <div className="text-slate-500">Jam</div>
                <div className="font-medium">{selectedSlot.time} WIB ({selectedService.duration_minutes} Menit)</div>
                
                <div className="text-slate-500">Staf</div>
                <div className="font-medium">{selectedSlot.staffName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Misal: Alergi pada produk tertentu, atau permintaan khusus."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={handleBack} disabled={step === 1 || submitting}>
          Kembali
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext} disabled={(step === 1 && !serviceId) || (step === 2 && !selectedSlot)}>
            Lanjut
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
