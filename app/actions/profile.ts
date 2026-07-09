'use server'

import { createSupabaseServerClient } from './auth'

export async function getProfile() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return profile
}

export async function updateProfile(formData: FormData) {
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone: phone })
    .eq('auth_user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
