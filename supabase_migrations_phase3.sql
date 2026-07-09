-- 1. Tambahkan kolom is_active pada profil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Buat RPC function untuk mengatur jadwal staf (menggantikan yang lama dalam 1 transaksi)
CREATE OR REPLACE FUNCTION public.update_staff_availability(
  p_staff_id UUID,
  p_schedules JSONB
) RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot JSONB;
BEGIN
  -- Hapus semua jadwal lama untuk staf ini
  DELETE FROM public.staff_availability WHERE staff_id = p_staff_id;
  
  -- Insert jadwal baru dari JSON array
  FOR slot IN SELECT * FROM jsonb_array_elements(p_schedules)
  LOOP
    INSERT INTO public.staff_availability (id, staff_id, day_of_week, start_time, end_time)
    VALUES (
      gen_random_uuid(),
      p_staff_id,
      (slot->>'day_of_week')::int,
      (slot->>'start_time')::time,
      (slot->>'end_time')::time
    );
  END LOOP;
END;
$$;
