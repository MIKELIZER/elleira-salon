import { getCustomerWaitlist } from '@/app/actions/waitlist'
import { createSupabaseServerClient } from '@/app/actions/auth'
import WaitlistForm from './waitlist-form'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cancelWaitlist } from '@/app/actions/waitlist'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock } from 'lucide-react'

export default async function CustomerWaitlistPage({ searchParams }: { searchParams: { new?: string, serviceId?: string, date?: string } }) {
  const params = await searchParams
  const isNew = params.new === '1'
  
  const supabase = await createSupabaseServerClient()
  const { data: services } = await supabase.from('services').select('id, name').eq('is_active', true)
  const { data: staffList } = await supabase.from('profiles').select('id, full_name').eq('role', 'staff').eq('is_active', true)
  
  const { data: waitlist, error } = await getCustomerWaitlist()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-widest">Menunggu Slot</span>
      case 'notified': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-widest">Slot Tersedia</span>
      case 'expired': return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">Kedaluwarsa</span>
      default: return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {isNew ? (
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-slate-900 mb-2">Formulir Daftar Tunggu</h1>
            <p className="text-slate-500">Ajukan daftar tunggu jika slot penuh. Kami akan segera menghubungi Anda jika ada yang membatalkan pesanannya.</p>
          </div>
          <WaitlistForm 
            services={services || []} 
            staffList={staffList || []}
            initialServiceId={params.serviceId}
            initialDate={params.date}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-serif text-slate-900 mb-2">Daftar Tunggu</h1>
              <p className="text-slate-500">Menunggu slot kosong? Kami akan memberitahu Anda jika jadwal tersedia.</p>
            </div>
            <Link href="/customer/waitlist?new=1">
              <Button className="bg-[#b88e4f] hover:bg-[#a67d40] text-white rounded-full px-8 h-12 uppercase tracking-widest text-xs font-bold shadow-lg shadow-[#b88e4f]/20">
                Masuk Waitlist
              </Button>
            </Link>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid gap-6">
            {waitlist?.map((item) => (
              <Card key={item.id} className="overflow-hidden rounded-3xl border-rose-50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8 md:flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900 mb-4">{item.services.name}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-[#FDF9F8] p-4 rounded-xl border border-rose-100">
                      <div>
                        <span className="font-bold text-[#b88e4f] block text-xs uppercase tracking-widest mb-1">Tanggal Harapan</span>
                        {format(new Date(item.desired_date), 'dd MMMM yyyy', { locale: localeId })}
                      </div>
                      
                      {item.desired_time_range && (
                        <>
                          <div className="w-px bg-rose-200 hidden sm:block"></div>
                          <div>
                            <span className="font-bold text-[#b88e4f] block text-xs uppercase tracking-widest mb-1">Waktu</span>
                            {item.desired_time_range}
                          </div>
                        </>
                      )}
                      
                      {item.preferred_staff && (
                        <>
                          <div className="w-px bg-rose-200 hidden sm:block"></div>
                          <div>
                            <span className="font-bold text-[#b88e4f] block text-xs uppercase tracking-widest mb-1">Stylist Pilihan</span>
                            {item.preferred_staff.full_name}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 md:mt-0 flex flex-col items-end gap-4 min-w-[200px]">
                    {getStatusBadge(item.status)}
                    
                    {item.status === 'waiting' && (
                      <form action={async () => {
                        'use server'
                        await cancelWaitlist(item.id)
                      }}>
                        <Button variant="outline" size="sm" type="submit" className="rounded-full px-6 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                          Batalkan
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!waitlist || waitlist.length === 0) && (
              <div className="text-center py-20 bg-white rounded-3xl border border-rose-50 shadow-sm">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="text-xl font-serif text-slate-900 mb-3">Antrean Kosong</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Anda tidak sedang mengantre untuk layanan apapun.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
