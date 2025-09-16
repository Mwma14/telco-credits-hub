-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid()::text;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all users" ON public.users
FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Allow user creation during signup
CREATE POLICY "Allow user creation during signup" ON public.users
FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Operators table policies (public read access)
CREATE POLICY "Anyone can view active operators" ON public.operators
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage operators" ON public.operators
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Categories table policies (public read access)
CREATE POLICY "Anyone can view active categories" ON public.categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Products table policies (public read access for active products)
CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
FOR ALL USING (public.get_current_user_role() = 'admin');

-- Orders table policies
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update orders" ON public.orders
FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Credit requests table policies
CREATE POLICY "Users can view their own credit requests" ON public.credit_requests
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create credit requests" ON public.credit_requests
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all credit requests" ON public.credit_requests
FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update credit requests" ON public.credit_requests
FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Create function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_requests_updated_at
    BEFORE UPDATE ON public.credit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();