-- Check current users and their profiles
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.full_name,
    p.role,
    p.company_id,
    c.name as company_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
ORDER BY u.created_at DESC;

-- Check existing companies
SELECT 
    id,
    name,
    email,
    created_at
FROM public.companies
ORDER BY created_at DESC;

-- Check if there are any profiles without company_id
SELECT 
    id,
    email,
    full_name,
    role,
    company_id
FROM public.profiles
WHERE company_id IS NULL;
