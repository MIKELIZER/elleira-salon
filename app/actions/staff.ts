'use server'

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'

/**
 * Helper: Memverifikasi apakah user yang memanggil fungsi adalah admin aktif.
 */
async function verifyAdminAccess() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden: Only admin can access this action.')
  if (profile?.is_active === false) throw new Error('Forbidden: Your admin account is deactivated.')

  return supabase
}

export async function getStaffList() {
  try {
    const supabase = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function toggleStaffStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = await verifyAdminAccess()

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/staff')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getStaffAvailability(staffProfileId: string) {
  try {
    const supabase = await verifyAdminAccess()
    
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffProfileId)
      .order('day_of_week', { ascending: true })

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

// Data format yang masuk: { day_of_week: number, start_time: string, end_time: string }[]
export async function setStaffAvailability(staffProfileId: string, schedule: any[]) {
  try {
    const supabase = await verifyAdminAccess()

    // 1. Validasi input sederhana
    for (const slot of schedule) {
      if (slot.day_of_week < 0 || slot.day_of_week > 6) return { error: 'Hari tidak valid.' }
      if (!slot.start_time || !slot.end_time) return { error: 'Jam kerja tidak valid.' }
    }

    // 2. Menggunakan mekanisme transaksi (RPC) karena ini memerlukan penghapusan baris lama lalu sisip baru.
    // Kita akan memanggil RPC `update_staff_availability` (harus dibuat via SQL migration)
    const { error } = await supabase.rpc('update_staff_availability', {
      p_staff_id: staffProfileId,
      p_schedules: schedule
    })

    if (error) return { error: error.message }
    
    revalidatePath(`/admin/staff/${staffProfileId}/availability`)
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Mengambil jadwal ketersediaan untuk staf yang sedang login.
 * (Tidak memerlukan role admin)
 */
export async function getOwnAvailability() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single()

    if (profile?.role !== 'staff') throw new Error('Forbidden: Only staff can access this action.')

    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', profile.id)
      .order('day_of_week', { ascending: true })

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}
