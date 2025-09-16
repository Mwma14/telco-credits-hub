-- Insert sample operators
INSERT INTO public.operators (name, display_name, logo_url, color_scheme, is_active) VALUES
('atom', 'ATOM', NULL, '#FF6B00', true),
('mpt', 'MPT', NULL, '#0066CC', true),
('mytel', 'MYTEL', NULL, '#00AA44', true),
('ooredoo', 'OOREDOO', NULL, '#DD0000', true);

-- Insert sample categories
INSERT INTO public.categories (name, display_name, icon, is_active, sort_order) VALUES
('data', 'Data', '📶', true, 1),
('minutes', 'Minutes', '📞', true, 2),
('points', 'Points', '🎯', true, 3),
('packages', 'Packages', '📦', true, 4),
('beautiful_numbers', 'Beautiful Numbers', '💎', true, 5);

-- Insert sample products for ATOM operator
INSERT INTO public.products (name, description, price_mmk, price_credits, operator_id, category_id, is_active, sort_order) 
SELECT 
    p.name, 
    p.description, 
    p.price_mmk, 
    p.price_credits,
    o.id as operator_id,
    c.id as category_id,
    true as is_active,
    p.sort_order
FROM 
    (SELECT id FROM public.operators WHERE name = 'atom') o,
    (VALUES 
        -- Data products
        ('1GB Data', '1GB high-speed data for 30 days', 1000, 10.00, 'data', 1),
        ('2GB Data', '2GB high-speed data for 30 days', 2000, 20.00, 'data', 2),
        ('5GB Data', '5GB high-speed data for 30 days', 5000, 50.00, 'data', 3),
        -- Minutes products
        ('50 Minutes', 'Any-net 50 minutes valid for 7 days', 800, 8.00, 'minutes', 1),
        ('100 Minutes', 'Any-net 100 minutes valid for 15 days', 1550, 15.50, 'minutes', 2),
        ('150 Minutes', 'Any-net 150 minutes valid for 30 days', 2300, 23.00, 'minutes', 3),
        -- Points products
        ('500 Points', '500 reward points for services', 1500, 15.00, 'points', 1),
        ('1000 Points', '1000 reward points for services', 3000, 30.00, 'points', 2),
        ('2000 Points', '2000 reward points for services', 5500, 55.00, 'points', 3),
        -- Package products
        ('15K Plan', '24GB + 360 minutes + 500 SMS for 30 days', 15000, 150.00, 'packages', 1),
        ('25K Plan', '40GB + 700 minutes + 800 SMS for 30 days', 25000, 250.00, 'packages', 2)
    ) p(name, description, price_mmk, price_credits, category_name, sort_order),
    public.categories c
WHERE c.name = p.category_name;

-- Insert sample products for other operators (MPT, Mytel, Ooredoo)
INSERT INTO public.products (name, description, price_mmk, price_credits, operator_id, category_id, is_active, sort_order)
SELECT 
    p.name, 
    p.description, 
    p.price_mmk, 
    p.price_credits,
    o.id as operator_id,
    c.id as category_id,
    true as is_active,
    p.sort_order
FROM 
    public.operators o,
    public.categories c,
    (VALUES 
        -- Data products for all operators
        ('1GB Data', '1GB high-speed data package', 1000, 10.00, 'data', 1),
        ('3GB Data', '3GB high-speed data package', 2500, 25.00, 'data', 2),
        -- Minutes products for all operators  
        ('Any-net 75 Mins', 'Any-network 75 minutes', 1200, 12.00, 'minutes', 1),
        ('Any-net 120 Mins', 'Any-network 120 minutes', 1800, 18.00, 'minutes', 2),
        -- Points products for all operators
        ('750 Points', '750 reward points', 2000, 20.00, 'points', 1),
        ('1500 Points', '1500 reward points', 4000, 40.00, 'points', 2)
    ) p(name, description, price_mmk, price_credits, category_name, sort_order)
WHERE o.name IN ('mpt', 'mytel', 'ooredoo') 
AND c.name = p.category_name;