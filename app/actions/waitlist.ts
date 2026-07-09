'use server'

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function joinWaitlist(payload: { serviceId: string, preferredStaffId?: string | null, desiredDate: string, desiredTimeRange?: string }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Anda harus login untuk masuk daftar tunggu.' }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return { error: 'Profile not found' }

    const { error } = await supabase
      .from('waitlist')
      .insert({
        customer_id: profile.id,
        service_id: payload.serviceId,
        preferred_staff_id: payload.preferredStaffId || null,
        desired_date: payload.desiredDate,
        desired_time_range: payload.desiredTimeRange || '',
        status: 'waiting'
      })

    if (error) return { error: error.message }
    
    revalidatePath('/customer/waitlist')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getCustomerWaitlist() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized', data: null }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single()
    if (!profile) return { error: 'Profile not found', data: null }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*, services(name), preferred_staff:profiles!waitlist_preferred_staff_id_fkey(full_name)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, data: null }
    return { data, error: null }
  } catch (err: any) {
    return { error: err.message, data: null }
  }
}

export async function cancelWaitlist(waitlistId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', waitlistId)

    if (error) return { error: error.message }
    
    revalidatePath('/customer/waitlist')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
