-- =========================================================
-- MIGRATION PHASE 6: CUSTOMER PREFERENCES & WAITLIST
-- =========================================================

-- 1. Tabel Preferensi Pelanggan (Customer Preferences)
CREATE TABLE IF NOT EXISTS public.customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    allergy_note TEXT,
    preferred_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    general_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger Update updated_at untuk customer_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_preferences_modtime 
BEFORE UPDATE ON public.customer_preferences 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS untuk Customer Preferences
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer can view own preferences" 
ON public.customer_preferences FOR SELECT 
USING (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customer can update own preferences" 
ON public.customer_preferences FOR UPDATE 
USING (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customer can insert own preferences" 
ON public.customer_preferences FOR INSERT 
WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Staff and admin can view all preferences" 
ON public.customer_preferences FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('staff', 'admin')));


-- 2. Tabel Daftar Tunggu (Waitlist)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    preferred_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    desired_date DATE NOT NULL,
    desired_time_range TEXT, -- Misal "Pagi (09:00 - 12:00)"
    status TEXT CHECK (status IN ('waiting', 'notified', 'expired')) DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS untuk Waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer can view own waitlist" 
ON public.waitlist FOR SELECT 
USING (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customer can insert own waitlist" 
ON public.waitlist FOR INSERT 
WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customer can delete own waitlist" 
ON public.waitlist FOR DELETE 
USING (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admin and staff can view all waitlist" 
ON public.waitlist FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admin and staff can update waitlist" 
ON public.waitlist FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role IN ('admin', 'staff')));
