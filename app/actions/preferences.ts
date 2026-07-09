'use server'

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'

export async function getPreferences() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: null }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return { error: 'Profile not found', data: null }

    const { data, error } = await supabase
      .from('customer_preferences')
      .select('*, preferred_staff:profiles!customer_preferences_preferred_staff_id_fkey(full_name)')
      .eq('customer_id', profile.id)
      .single()

    // Jika belum ada preferensi, ini bukan error kritis
    if (error && error.code !== 'PGRST116') {
      return { error: error.message, data: null }
    }

    return { error: null, data: data || null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function updatePreferences(payload: { allergyNote?: string, generalNote?: string, preferredStaffId?: string | null }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return { error: 'Profile not found' }

    // Gunakan upsert (jika customer_id belum ada, insert; jika ada, update)
    const { error } = await supabase
      .from('customer_preferences')
      .upsert({
        customer_id: profile.id,
        allergy_note: payload.allergyNote || '',
        general_note: payload.generalNote || '',
        preferred_staff_id: payload.preferredStaffId || null
      }, { onConflict: 'customer_id' })

    if (error) return { error: error.message }
    
    revalidatePath('/customer/profile')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
