import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedStaff() {
  console.log("Mulai mendaftarkan akun Staf...")

  const staffMembers = [
    { email: 'sari.stylist@elleira.com', password: 'password123', full_name: 'Sari (Senior Stylist)' },
    { email: 'dian.spa@elleira.com', password: 'password123', full_name: 'Dian (Spa Therapist)' },
    { email: 'maya.nails@elleira.com', password: 'password123', full_name: 'Maya (Nail Artist)' }
  ]

  const createdStaffIds = []

  for (const staff of staffMembers) {
    console.log(`Mendaftarkan ${staff.email}...`)
    
    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email: staff.email,
      password: staff.password,
      options: {
        data: {
          full_name: staff.full_name
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️ Akun ${staff.email} sudah terdaftar. Melewati...`)
        // Jika sudah terdaftar, coba ambil ID-nya dengan login
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: staff.email,
          password: staff.password
        })
        if (signInData?.user) {
          createdStaffIds.push(signInData.user.id)
        }
      } else {
        console.error(`❌ Gagal mendaftarkan ${staff.email}:`, error.message)
      }
    } else if (data.user) {
      console.log(`✅ Berhasil mendaftarkan ${staff.email}`)
      createdStaffIds.push(data.user.id)
    }
  }

  console.log("\n=======================================================")
  console.log("AKUN STAF BERHASIL DIBUAT DI AUTH.USERS!")
  console.log("=======================================================\n")
  
  console.log("Langkah selanjutnya:")
  console.log("Karena batasan keamanan (RLS), kita tidak bisa mengubah 'role' mereka menjadi 'staff' melalui script biasa.")
  console.log("Silakan jalankan SQL Query berikut di menu [SQL Editor] di dashboard Supabase Anda:\n")
  
  const sql = `
-- 1. Jadikan mereka Staf
UPDATE public.profiles 
SET role = 'staff' 
WHERE email IN (
  'sari.stylist@elleira.com',
  'dian.spa@elleira.com',
  'maya.nails@elleira.com'
);

-- 2. Hubungkan layanan ke staf (staff_services)
-- Mengambil ID staf yang baru dibuat
DO $$
DECLARE 
  staf1 UUID;
  staf2 UUID;
  staf3 UUID;
  srv_hair UUID;
  srv_spa UUID;
  srv_nail UUID;
BEGIN
  -- Dapatkan ID Profil Staf
  SELECT id INTO staf1 FROM public.profiles WHERE email = 'sari.stylist@elleira.com';
  SELECT id INTO staf2 FROM public.profiles WHERE email = 'dian.spa@elleira.com';
  SELECT id INTO staf3 FROM public.profiles WHERE email = 'maya.nails@elleira.com';
  
  -- Dapatkan ID Layanan (contoh, mengambil 3 layanan pertama)
  SELECT id INTO srv_hair FROM public.services LIMIT 1 OFFSET 0;
  SELECT id INTO srv_spa FROM public.services LIMIT 1 OFFSET 1;
  SELECT id INTO srv_nail FROM public.services LIMIT 1 OFFSET 2;
  
  -- Insert ke staff_services
  INSERT INTO public.staff_services (staff_id, service_id) VALUES 
    (staf1, srv_hair), (staf1, srv_spa),
    (staf2, srv_spa),
    (staf3, srv_nail)
  ON CONFLICT DO NOTHING;

  -- 3. Masukkan Jadwal Ketersediaan (staff_availability)
  -- Contoh: Semua staf tersedia hari Senin-Jumat jam 09:00 - 17:00
  INSERT INTO public.staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
    (staf1, 1, '09:00', '17:00'), (staf1, 2, '09:00', '17:00'),
    (staf2, 1, '09:00', '17:00'), (staf2, 2, '09:00', '17:00'),
    (staf3, 1, '09:00', '17:00'), (staf3, 2, '09:00', '17:00')
  ON CONFLICT DO NOTHING;

END $$;
`
  console.log(sql)
  console.log("Copy dan jalankan query di atas di Supabase Anda.")
}

seedStaff()
