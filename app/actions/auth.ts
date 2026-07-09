'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Helper internal untuk menginisialisasi Supabase di konteks Server Action
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
             // Error wajar terjadi jika method dipanggil di dalam Server Component.
             // Middleware sudah mengatasi pembaharuan sesi.
          }
        },
      },
    }
  )
}

// Helper untuk Admin Client (Memerlukan SUPABASE_SERVICE_ROLE_KEY)
export async function createSupabaseAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Harus didefinisikan di .env.local
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ...
          }
        },
      },
    }
  )
}

/**
 * Registrasi customer baru
 */
export async function signUpCustomer(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  if (!email || !password || !fullName) {
    return { error: 'Email, password, dan nama lengkap wajib diisi.' }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/customer/dashboard')
}

/**
 * Login dan penentuan rute role
 */
export async function signInWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Silakan isi email dan password.' }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Kredensial tidak valid. Silakan coba lagi.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', data.user.id)
    .single()

  const role = profile?.role || 'customer'
  
  redirect(`/${role}/dashboard`)
}

/**
 * Pembuatan Akun Staf (Oleh Admin)
 */
export async function createStaffAccount(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  if (!email || !password || !fullName) {
    return { error: 'Email, password, dan nama lengkap wajib diisi.' }
  }

  // 1. Verifikasi bahwa yang memanggil ini adalah Admin
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') {
    return { error: 'Forbidden: Only admin can create staff accounts.' }
  }

  // 2. Gunakan Admin Client untuk membuat user tanpa mengubah session aktif
  const supabaseAdmin = await createSupabaseAdminClient()
  
  const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // PENTING: Karena trigger kita menghardcode role='customer',
  // Admin Client harus meng-update rolenya menjadi 'staff' secara manual setelah trigger berjalan.
  if (newAuthUser?.user?.id) {
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'staff' })
      .eq('auth_user_id', newAuthUser.user.id)
      
    if (updateError) {
       return { error: 'Gagal menetapkan peran staff pada database: ' + updateError.message }
    }
  }

  return { success: true }
}

/**
 * Logout
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  
  redirect('/login')
}
