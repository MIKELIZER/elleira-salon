-- Script ini akan memasukkan data uji coba (dummy data) ke dalam database Salon.
-- Harap COPY seluruh kode ini, lalu PASTE dan RUN di Supabase SQL Editor Anda.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- Variabel untuk menyimpan ID dari tabel auth.users
  v_admin_auth_id UUID;
  v_staf1_auth_id UUID;
  v_staf2_auth_id UUID;
  v_cust1_auth_id UUID;
  v_cust2_auth_id UUID;

  -- Variabel untuk menyimpan ID dari tabel public.profiles (PENTING KARENA INI YANG DIGUNAKAN DI TABEL LAIN)
  v_admin_id UUID;
  v_staf1_id UUID;
  v_staf2_id UUID;
  v_cust1_id UUID;
  v_cust2_id UUID;
  
  srv_id1 UUID := gen_random_uuid();
  srv_id2 UUID := gen_random_uuid();
  srv_id3 UUID := gen_random_uuid();
  
  book_id1 UUID := gen_random_uuid();
  book_id2 UUID := gen_random_uuid();
  book_id3 UUID := gen_random_uuid();
BEGIN
  
  -- ==========================================
  -- 1. Injeksi Pengguna (Auth & Profiles)
  -- ==========================================
  
  -- ADMIN
  SELECT id INTO v_admin_auth_id FROM auth.users WHERE email = 'admin@salon.com';
  IF NOT FOUND THEN
    v_admin_auth_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, role, aud) 
    VALUES (v_admin_auth_id, '00000000-0000-0000-0000-000000000000', 'admin@salon.com', crypt('password', gen_salt('bf')), now(), '{"full_name": "Admin Utama"}', '{"provider":"email","providers":["email"]}', now(), now(), 'authenticated', 'authenticated');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_admin_auth_id, format('{"sub":"%s","email":"admin@salon.com"}', v_admin_auth_id)::jsonb, 'email', v_admin_auth_id, now(), now(), now());
  END IF;

  SELECT id INTO v_admin_id FROM public.profiles WHERE auth_user_id = v_admin_auth_id;
  IF NOT FOUND THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO public.profiles (id, auth_user_id, role, full_name, is_active) VALUES (v_admin_id, v_admin_auth_id, 'admin', 'Admin Utama', true);
  ELSE
    UPDATE public.profiles SET role = 'admin', full_name = 'Admin Utama', is_active = true WHERE id = v_admin_id;
  END IF;

  -- STAFF 1
  SELECT id INTO v_staf1_auth_id FROM auth.users WHERE email = 'staf1@salon.com';
  IF NOT FOUND THEN
    v_staf1_auth_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, role, aud) 
    VALUES (v_staf1_auth_id, '00000000-0000-0000-0000-000000000000', 'staf1@salon.com', crypt('password', gen_salt('bf')), now(), '{"full_name": "Dewi Stylist"}', '{"provider":"email","providers":["email"]}', now(), now(), 'authenticated', 'authenticated');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_staf1_auth_id, format('{"sub":"%s","email":"staf1@salon.com"}', v_staf1_auth_id)::jsonb, 'email', v_staf1_auth_id, now(), now(), now());
  END IF;

  SELECT id INTO v_staf1_id FROM public.profiles WHERE auth_user_id = v_staf1_auth_id;
  IF NOT FOUND THEN
    v_staf1_id := gen_random_uuid();
    INSERT INTO public.profiles (id, auth_user_id, role, full_name, is_active) VALUES (v_staf1_id, v_staf1_auth_id, 'staff', 'Dewi Stylist', true);
  ELSE
    UPDATE public.profiles SET role = 'staff', full_name = 'Dewi Stylist', is_active = true WHERE id = v_staf1_id;
  END IF;

  -- STAFF 2
  SELECT id INTO v_staf2_auth_id FROM auth.users WHERE email = 'staf2@salon.com';
  IF NOT FOUND THEN
    v_staf2_auth_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, role, aud) 
    VALUES (v_staf2_auth_id, '00000000-0000-0000-0000-000000000000', 'staf2@salon.com', crypt('password', gen_salt('bf')), now(), '{"full_name": "Budi Barber"}', '{"provider":"email","providers":["email"]}', now(), now(), 'authenticated', 'authenticated');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_staf2_auth_id, format('{"sub":"%s","email":"staf2@salon.com"}', v_staf2_auth_id)::jsonb, 'email', v_staf2_auth_id, now(), now(), now());
  END IF;

  SELECT id INTO v_staf2_id FROM public.profiles WHERE auth_user_id = v_staf2_auth_id;
  IF NOT FOUND THEN
    v_staf2_id := gen_random_uuid();
    INSERT INTO public.profiles (id, auth_user_id, role, full_name, is_active) VALUES (v_staf2_id, v_staf2_auth_id, 'staff', 'Budi Barber', true);
  ELSE
    UPDATE public.profiles SET role = 'staff', full_name = 'Budi Barber', is_active = true WHERE id = v_staf2_id;
  END IF;

  -- CUSTOMER 1
  SELECT id INTO v_cust1_auth_id FROM auth.users WHERE email = 'cust1@salon.com';
  IF NOT FOUND THEN
    v_cust1_auth_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, role, aud) 
    VALUES (v_cust1_auth_id, '00000000-0000-0000-0000-000000000000', 'cust1@salon.com', crypt('password', gen_salt('bf')), now(), '{"full_name": "Siska Customer"}', '{"provider":"email","providers":["email"]}', now(), now(), 'authenticated', 'authenticated');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_cust1_auth_id, format('{"sub":"%s","email":"cust1@salon.com"}', v_cust1_auth_id)::jsonb, 'email', v_cust1_auth_id, now(), now(), now());
  END IF;

  SELECT id INTO v_cust1_id FROM public.profiles WHERE auth_user_id = v_cust1_auth_id;
  IF NOT FOUND THEN
    v_cust1_id := gen_random_uuid();
    INSERT INTO public.profiles (id, auth_user_id, role, full_name, is_active) VALUES (v_cust1_id, v_cust1_auth_id, 'customer', 'Siska Customer', true);
  ELSE
    UPDATE public.profiles SET role = 'customer', full_name = 'Siska Customer', is_active = true WHERE id = v_cust1_id;
  END IF;

  -- CUSTOMER 2
  SELECT id INTO v_cust2_auth_id FROM auth.users WHERE email = 'cust2@salon.com';
  IF NOT FOUND THEN
    v_cust2_auth_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, role, aud) 
    VALUES (v_cust2_auth_id, '00000000-0000-0000-0000-000000000000', 'cust2@salon.com', crypt('password', gen_salt('bf')), now(), '{"full_name": "Andi Customer"}', '{"provider":"email","providers":["email"]}', now(), now(), 'authenticated', 'authenticated');
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_cust2_auth_id, format('{"sub":"%s","email":"cust2@salon.com"}', v_cust2_auth_id)::jsonb, 'email', v_cust2_auth_id, now(), now(), now());
  END IF;

  SELECT id INTO v_cust2_id FROM public.profiles WHERE auth_user_id = v_cust2_auth_id;
  IF NOT FOUND THEN
    v_cust2_id := gen_random_uuid();
    INSERT INTO public.profiles (id, auth_user_id, role, full_name, is_active) VALUES (v_cust2_id, v_cust2_auth_id, 'customer', 'Andi Customer', true);
  ELSE
    UPDATE public.profiles SET role = 'customer', full_name = 'Andi Customer', is_active = true WHERE id = v_cust2_id;
  END IF;


  -- ==========================================
  -- 2. Injeksi Layanan Salon (Services)
  -- ==========================================
  INSERT INTO public.services (id, name, category, price, duration_minutes) VALUES
  (srv_id1, 'Potong Rambut Premium', 'hair', 75000, 45),
  (srv_id2, 'Mewarnai Rambut (Basic)', 'color', 250000, 120),
  (srv_id3, 'Creambath Tradisional', 'treatment', 120000, 60)
  ON CONFLICT DO NOTHING;


  -- ==========================================
  -- 3. Mengatur Ketersediaan Staf
  -- ==========================================
  FOR i IN 1..6 LOOP
    INSERT INTO public.staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
    (v_staf1_id, i, '09:00:00', '17:00:00'),
    (v_staf2_id, i, '10:00:00', '18:00:00')
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- ==========================================
  -- 4. Injeksi Jadwal Pesanan (Bookings)
  -- ==========================================
  BEGIN
    -- Pesanan 1 (Sudah Selesai Kemarin)
    INSERT INTO public.bookings (id, customer_id, service_id, staff_id, start_at, end_at, status) VALUES
    (book_id1, v_cust1_id, srv_id1, v_staf1_id, (now() - interval '1 day' + interval '10 hours'), (now() - interval '1 day' + interval '10 hours 45 minutes'), 'completed');

    -- Transaksi untuk Pesanan 1
    INSERT INTO public.transactions (booking_id, handled_by, amount, payment_method, paid_at) VALUES
    (book_id1, v_staf1_id, 75000, 'cash', (now() - interval '1 day' + interval '10 hours 50 minutes'));

    -- Pesanan 2 (Dikonfirmasi untuk Besok)
    INSERT INTO public.bookings (id, customer_id, service_id, staff_id, start_at, end_at, status) VALUES
    (book_id2, v_cust2_id, srv_id3, v_staf2_id, (now() + interval '1 day' + interval '11 hours'), (now() + interval '1 day' + interval '12 hours'), 'confirmed');

    -- Pesanan 3 (Menunggu Konfirmasi untuk Lusa)
    INSERT INTO public.bookings (id, customer_id, service_id, staff_id, start_at, end_at, status) VALUES
    (book_id3, v_cust1_id, srv_id2, v_staf1_id, (now() + interval '2 days' + interval '13 hours'), (now() + interval '2 days' + interval '15 hours'), 'pending');
  EXCEPTION WHEN OTHERS THEN
    -- Abaikan jika jadwal tumpang tindih (exclusion constraint / unique index)
    RAISE NOTICE 'Beberapa booking mungkin sudah ada atau tumpang tindih. Mengabaikan.';
  END;

END $$;
