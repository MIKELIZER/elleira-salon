'use server'

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'
import { format, toZonedTime } from 'date-fns-tz'
import { Resend } from 'resend'

const TIMEZONE = 'Asia/Jakarta'

// Helper pengiriman email dengan mode fallback Console
async function sendNotificationEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    // Mode Simulasi (Fallback)
    console.log('\n--- 📧 SIMULASI PENGIRIMAN EMAIL ---')
    console.log(`Kepada  : ${to}`)
    console.log(`Subjek  : ${subject}`)
    console.log(`Konten  : (Lihat source code)\n${htmlContent.substring(0, 150)}...\n`)
    console.log('--- SELESAI ---\n')
    return { success: true, simulated: true }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Salon Notifications <onboarding@resend.dev>', // default resend testing domain
      to: [to],
      subject,
      html: htmlContent
    })

    if (error) {
      console.error('Resend Error:', error)
      return { error: error.message }
    }
    return { success: true }
  } catch (error: any) {
    console.error('Email Exception:', error)
    return { error: error.message }
  }
}

export async function getAvailableSlots(dateStr: string, serviceId: string, staffId?: string) {
  try {
    const { createSupabaseAdminClient } = await import('./auth')
    const supabase = await createSupabaseAdminClient()
    
    // 1. Get Service Duration
    const { data: service } = await supabase.from('services').select('duration_minutes').eq('id', serviceId).single()
    if (!service) return { error: 'Layanan tidak ditemukan' }
    const duration = service.duration_minutes

    // 2. Tentukan Day of Week (0 = Minggu, 6 = Sabtu) di WIB
    const wibDate = new Date(`${dateStr}T12:00:00+07:00`)
    const dayOfWeek = wibDate.getDay()

    // 3. Ambil staff availability
    let availQuery = supabase.from('staff_availability').select('*, profiles!inner(is_active, full_name)').eq('day_of_week', dayOfWeek).eq('profiles.is_active', true)
    if (staffId) {
      availQuery = availQuery.eq('staff_id', staffId)
    }
    const { data: availabilities, error: availErr } = await availQuery
    if (availErr || !availabilities || availabilities.length === 0) return { data: [] }

    // 4. Ambil Existing Bookings untuk tanggal tersebut
    const startOfDayWib = `${dateStr}T00:00:00+07:00`
    const endOfDayWib = `${dateStr}T23:59:59+07:00`

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('staff_id, start_at, end_at, status')
      .in('status', ['pending', 'confirmed'])
      .gte('start_at', startOfDayWib)
      .lte('start_at', endOfDayWib)

    // 5. Kalkulasi Blok Waktu per staf
    const slots: { staffId: string, staffName: string, time: string, startAt: string, endAt: string }[] = []
    
    const nowTime = Date.now()
    
    for (const avail of availabilities) {
      const staffBookings = existingBookings?.filter(b => b.staff_id === avail.staff_id) || []
      
      const [startHour, startMinute] = avail.start_time.split(':').map(Number)
      const [endHour, endMinute] = avail.end_time.split(':').map(Number)
      
      let sTime = new Date(`${dateStr}T${avail.start_time}+07:00`).getTime()
      const eTime = new Date(`${dateStr}T${avail.end_time}+07:00`).getTime()
      
      while (sTime + duration * 60000 <= eTime) {
        const slotStart = new Date(sTime)
        const slotEnd = new Date(sTime + duration * 60000)
        
        let isOverlap = false
        for (const b of staffBookings) {
          const bStart = new Date(b.start_at).getTime()
          const bEnd = new Date(b.end_at).getTime()
          
          if (sTime < bEnd && (sTime + duration * 60000) > bStart) {
            isOverlap = true
            break
          }
        }
        
        if (!isOverlap && sTime > nowTime) {
          slots.push({
            staffId: avail.staff_id,
            staffName: avail.profiles.full_name,
            time: format(toZonedTime(slotStart, TIMEZONE), 'HH:mm', { timeZone: TIMEZONE }),
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString()
          })
        }
        
        sTime += 30 * 60000 // Interval 30 menit
      }
    }

    slots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    return { data: slots }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function createBooking(payload: { serviceId: string, staffId: string, startAt: string, endAt: string, notes?: string }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Anda harus login untuk membuat booking.' }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return { error: 'Profil pelanggan tidak ditemukan.' }

    const { error } = await supabase
      .from('bookings')
      .insert({
        customer_id: profile.id,
        service_id: payload.serviceId,
        staff_id: payload.staffId,
        start_at: payload.startAt,
        end_at: payload.endAt,
        status: 'pending',
        notes: payload.notes || ''
      })

    if (error) {
      if (error.code === '23P01') {
        return { error: 'Maaf, slot waktu ini baru saja dipesan oleh pelanggan lain. Silakan pilih slot atau staf lainnya.' }
      }
      return { error: error.message }
    }
    
    revalidatePath('/customer/booking')
    revalidatePath('/admin/bookings')
    revalidatePath('/staff/bookings')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getCustomerBookings() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: null }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(name, price, duration_minutes), profiles!bookings_staff_id_fkey(full_name)')
      .eq('customer_id', user.id)
      .order('start_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function getAllBookings(staffIdFilter?: string) {
  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase.from('bookings')
      .select('*, services(name, price, duration_minutes), customer:profiles!bookings_customer_id_fkey(full_name, phone, email, customer_preferences!customer_preferences_customer_id_fkey(allergy_note, general_note)), staff:profiles!bookings_staff_id_fkey(full_name)')
      .order('start_at', { ascending: false })
      
    if (staffIdFilter) {
      // staffIdFilter adalah auth.users.id, kita butuh profiles.id
      const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', staffIdFilter).single()
      if (profile) {
        query = query.eq('staff_id', profile.id)
      } else {
        return { data: [], error: 'Profil staf tidak ditemukan' }
      }
    }
    
    const { data, error } = await query
    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Ambil detail booking untuk email notifikasi (jika confirmed)
    const { data: bookingDetail } = await supabase
      .from('bookings')
      .select('*, customer:profiles!bookings_customer_id_fkey(email, full_name), services(name)')
      .eq('id', bookingId)
      .single()
    
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (error) return { error: error.message }
    
    // Picu Email Notifikasi jika dikonfirmasi
    const bDetail = bookingDetail as any
    if (status === 'confirmed' && bDetail?.customer?.email) {
      const startTimeWib = format(toZonedTime(new Date(bDetail.start_at), TIMEZONE), 'dd MMM yyyy, HH:mm', { timeZone: TIMEZONE })
      
      const htmlMsg = `
        <h2>Halo ${bDetail.customer.full_name},</h2>
        <p>Kabar baik! Pesanan Anda untuk layanan <strong>${bDetail.services?.name}</strong> telah kami <strong>konfirmasi</strong>.</p>
        <p><strong>Jadwal Anda:</strong> ${startTimeWib} WIB</p>
        <p>Harap datang tepat waktu atau hubungi kami jika ada perubahan.</p>
        <br/>
        <p>Terima kasih,</p>
        <p>Tim Manajemen Salon</p>
      `
      await sendNotificationEmail(bDetail.customer.email, 'Konfirmasi Pesanan Salon Anda', htmlMsg)
    }
    
    revalidatePath('/customer/booking')
    revalidatePath('/admin/bookings')
    revalidatePath('/staff/bookings')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, 'cancelled')
}

export async function rescheduleBooking(bookingId: string, payload: { staffId: string, startAt: string, endAt: string, notes?: string }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Update jadwal
    const { error } = await supabase
      .from('bookings')
      .update({
        staff_id: payload.staffId,
        start_at: payload.startAt,
        end_at: payload.endAt,
        notes: payload.notes || ''
      })
      .eq('id', bookingId)
      .eq('customer_id', user.id) // Pastikan hanya pemilik yang bisa reschedule
      .in('status', ['pending', 'confirmed']) // Hanya bisa diubah jika pending atau confirmed

    if (error) {
      if (error.code === '23P01') {
        return { error: 'Maaf, slot waktu ini baru saja dipesan oleh pelanggan lain. Silakan pilih slot lainnya.' }
      }
      return { error: error.message }
    }
    
    revalidatePath('/customer/booking')
    revalidatePath('/admin/bookings')
    revalidatePath('/staff/bookings')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

