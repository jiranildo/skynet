-- Create system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    color TEXT DEFAULT 'bg-gray-50 text-gray-500',
    icon TEXT DEFAULT 'ri-information-line',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to system_logs" ON public.system_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Function to log events
CREATE OR REPLACE FUNCTION public.fn_log_system_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'users') THEN
        INSERT INTO public.system_logs (user_id, action, details, icon, color)
        VALUES (NEW.id, 'Usuário Criado', 'Novo usuário: ' || COALESCE(NEW.full_name, NEW.username), 'ri-user-add-line', 'bg-blue-50 text-blue-500');
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'trips') THEN
        INSERT INTO public.system_logs (user_id, action, details, icon, color)
        VALUES (NEW.user_id, 'Novo Roteiro', NEW.title, 'ri-map-pin-line', 'bg-green-50 text-green-500');
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'travel_money_transaction') THEN
        INSERT INTO public.system_logs (user_id, action, details, icon, color)
        VALUES (NEW.user_id, 'Transação TM', NEW.amount || ' TM ' || NEW.type, 'ri-money-dollar-circle-line', 
               CASE WHEN NEW.type = 'earn' THEN 'bg-yellow-50 text-yellow-500' ELSE 'bg-red-50 text-red-500' END);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS tr_log_user_creation ON public.users;
CREATE TRIGGER tr_log_user_creation
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_system_event();

DROP TRIGGER IF EXISTS tr_log_trip_creation ON public.trips;
CREATE TRIGGER tr_log_trip_creation
    AFTER INSERT ON public.trips
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_system_event();

DROP TRIGGER IF EXISTS tr_log_tm_transaction ON public.travel_money_transaction;
CREATE TRIGGER tr_log_tm_transaction
    AFTER INSERT ON public.travel_money_transaction
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_system_event();
