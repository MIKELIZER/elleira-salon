'use server'

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'

/**
 * Helper: Memverifikasi apakah user adalah staf atau admin yang aktif.
 */
async function verifyStaffOrAdminAccess() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    throw new Error('Forbidden: Only staff or admin can checkout.')
  }
  if (profile?.is_active === false) throw new Error('Forbidden: Your account is deactivated.')

  return { supabase, profile }
}

export async function createTransaction(bookingId: string, paymentMethod: string) {
  try {
    const { supabase, profile } = await verifyStaffOrAdminAccess()
    
    // Validasi tipe enum
    if (!['cash', 'transfer', 'qris_manual'].includes(paymentMethod)) {
      return { error: 'Metode pembayaran tidak valid.' }
    }

    // 1. Dapatkan harga asli dari layanan (Server-side validation)
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, status, services(price)')
      .eq('id', bookingId)
      .single()
      
    if (bErr || !booking) return { error: 'Booking tidak ditemukan.' }
    if (booking.status !== 'confirmed') {
      return { error: 'Hanya pesanan berstatus Confirmed yang bisa diproses ke pembayaran.' }
    }
    
    const amount = (booking.services as any).price

    // 2. Insert data transaksi (ini akan di-lock relasi 1:1 oleh booking_id)
    const { error: tErr } = await supabase
      .from('transactions')
      .insert({
        booking_id: bookingId,
        handled_by: profile.id, // ID internal profil staf/kasir
        amount: amount,
        payment_method: paymentMethod
      })

    if (tErr) {
      // 23505 adalah kode untuk unique violation jika double checkout
      if (tErr.code === '23505') return { error: 'Transaksi untuk pesanan ini sudah pernah dilakukan.' }
      return { error: tErr.message }
    }

    // 3. Update status pesanan
    const { error: uErr } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId)

    if (uErr) return { error: uErr.message }
    
    revalidatePath('/customer/booking')
    revalidatePath('/admin/bookings')
    revalidatePath('/staff/bookings')
    
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getInvoice(bookingId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: null }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(name, duration_minutes),
        customer:profiles!bookings_customer_id_fkey(full_name, phone, email),
        staff:profiles!bookings_staff_id_fkey(full_name),
        transactions(*)
      `)
      .eq('id', bookingId)
      .single()

    if (error) return { error: error.message, data: null }
    
    // Pastikan transaksi ada
    if (!data.transactions || data.transactions.length === 0) {
      return { error: 'Transaksi belum dibayar atau tidak valid.', data: null }
    }

    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}
