-- Update category display names to be cleaner
UPDATE public.categories SET display_name = 'Data' WHERE name = 'data';
UPDATE public.categories SET display_name = 'Minutes' WHERE name = 'minutes'; 
UPDATE public.categories SET display_name = 'Points' WHERE name = 'points';
UPDATE public.categories SET display_name = 'Packages' WHERE name = 'packages';
UPDATE public.categories SET display_name = 'Beautiful Numbers' WHERE name = 'beautiful_numbers';