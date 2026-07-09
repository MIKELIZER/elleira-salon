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

/**
 * Mendapatkan daftar seluruh layanan.
 * Public flag: true jika customer yang mengakses (hanya mengembalikan yang is_active = true)
 */
export async function getServices(isPublic = false) {
  const supabase = await createSupabaseServerClient()
  
  let query = supabase.from('services').select('*').order('created_at', { ascending: false })
  if (isPublic) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createService(formData: FormData) {
  try {
    const supabase = await verifyAdminAccess()

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
    const price = parseFloat(formData.get('price') as string)

    if (!name || isNaN(duration_minutes) || isNaN(price)) {
      return { error: 'Data tidak valid' }
    }

    const { error } = await supabase
      .from('services')
      .insert({ name, category, duration_minutes, price, is_active: true })

    if (error) return { error: error.message }
    
    revalidatePath('/admin/services')
    revalidatePath('/services')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const supabase = await verifyAdminAccess()

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
    const price = parseFloat(formData.get('price') as string)

    if (!name || isNaN(duration_minutes) || isNaN(price)) {
      return { error: 'Data tidak valid' }
    }

    const { error } = await supabase
      .from('services')
      .update({ name, category, duration_minutes, price })
      .eq('id', id)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/services')
    revalidatePath('/services')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = await verifyAdminAccess()

    const { error } = await supabase
      .from('services')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) return { error: error.message }
    
    revalidatePath('/admin/services')
    revalidatePath('/services')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
