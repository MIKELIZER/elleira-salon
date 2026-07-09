import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function injectUsers() {
  const users = [
    { email: 'admin-new@salon.com', password: 'password', full_name: 'Super Admin' },
    { email: 'staff-new@salon.com', password: 'password', full_name: 'Staf Ahli' },
    { email: 'customer-new@salon.com', password: 'password', full_name: 'Pelanggan Setia' }
  ]

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: { data: { full_name: u.full_name } }
    })
    
    if (error) {
      console.error(`Failed to register ${u.email}:`, error.message)
    } else {
      console.log(`Successfully registered ${u.email}`)
    }
  }
}

injectUsers()
