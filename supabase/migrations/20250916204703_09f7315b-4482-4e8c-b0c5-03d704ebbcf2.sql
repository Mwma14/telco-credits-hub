-- Fix security definer function to have immutable search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid()::text;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, pg_temp;