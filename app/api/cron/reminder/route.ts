import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { addDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { format, toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Jakarta'

export async function GET(request: Request) {
  try {
    // 1. Inisialisasi Supabase menggunakan Service Role (Bypass RLS untuk Cron)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Variabel SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env' }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 2. Hitung target waktu "Besok" di zona WIB
    const nowWib = toZonedTime(new Date(), TIMEZONE)
    const tomorrowWib = addDays(nowWib, 1)
    
    const tomorrowStr = format(tomorrowWib, 'yyyy-MM-dd')
    const startOfTomorrow = `${tomorrowStr}T00:00:00+07:00`
    const endOfTomorrow = `${tomorrowStr}T23:59:59+07:00`
    
    // 3. Query pemesanan besok yang berstatus 'confirmed'
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, start_at, services(name), customer:profiles!bookings_customer_id_fkey(email, full_name)')
      .eq('status', 'confirmed')
      .gte('start_at', startOfTomorrow)
      .lte('start_at', endOfTomorrow)
      
    if (error) throw new Error(error.message)
    
    // 4. Siapkan Resend (Email Provider)
    const resendKey = process.env.RESEND_API_KEY
    const resend = resendKey ? new Resend(resendKey) : null
    
    let sentCount = 0
    let simulatedCount = 0
    
    // 5. Eksekusi pengiriman pengingat
    for (const item of bookings || []) {
      const b = item as any
      if (!b.customer?.email) continue
      
      const startTimeWib = format(toZonedTime(new Date(b.start_at), TIMEZONE), 'HH:mm', { timeZone: TIMEZONE })
      const subject = 'Pengingat: Jadwal Perawatan Salon Anda Besok'
      const htmlMsg = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #059669;">Halo ${b.customer.full_name},</h2>
          <p>Ini adalah pengingat otomatis bahwa Anda memiliki jadwal layanan <strong>${b.services?.name}</strong> besok.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Tanggal:</strong> ${format(tomorrowWib, 'EEEE, dd MMMM yyyy', { locale: localeId })}</p>
            <p style="margin: 5px 0 0 0;"><strong>Waktu:</strong> ${startTimeWib} WIB</p>
          </div>
          <p>Kami sangat menantikan kedatangan Anda. Mohon datang tepat waktu ya!</p>
          <br/>
          <p>Salam hangat,</p>
          <p><strong>Tim Manajemen Salon</strong></p>
        </div>
      `
      
      if (resend) {
        await resend.emails.send({
          from: 'Salon Notifications <onboarding@resend.dev>',
          to: [b.customer.email],
          subject,
          html: htmlMsg
        })
        sentCount++
      } else {
        console.log(`[SIMULASI CRON] Mengirim email pengingat H-1 ke: ${b.customer.email} untuk pesanan ${b.services?.name}`)
        simulatedCount++
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job berhasil dijalankan.',
      stats: { sent: sentCount, simulated: simulatedCount },
      targetDate: tomorrowStr
    })
    
  } catch (err: any) {
    console.error('Cron Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
