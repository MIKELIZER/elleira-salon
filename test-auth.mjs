import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  const email = `test_${Date.now()}@test.com`
  const password = 'password123'
  
  console.log(`Testing signup for ${email}...`)
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  })
  
  if (signUpError) {
    console.error("SignUp Error:", signUpError.message)
    return
  }
  
  console.log("SignUp Success! User ID:", signUpData.user?.id)
  
  console.log("Testing signin...")
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (signInError) {
    console.error("SignIn Error:", signInError.message)
    return
  }
  
  console.log("SignIn Success! Session:", !!signInData.session)
  
  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', signInData.user.id)
    .single()
    
  if (profileError) {
    console.error("Profile Error:", profileError.message)
  } else {
    console.log("Profile Data:", profile)
  }
}

testAuth()
