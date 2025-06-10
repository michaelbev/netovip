-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if we have any data
SELECT 'companies' as table_name, count(*) as row_count FROM public.companies
UNION ALL
SELECT 'profiles', count(*) FROM public.profiles
UNION ALL
SELECT 'wells', count(*) FROM public.wells
UNION ALL
SELECT 'owners', count(*) FROM public.owners
UNION ALL
SELECT 'revenue', count(*) FROM public.revenue;

-- Check auth users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check profiles and their company associations
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.company_id,
    c.name as company_name
FROM public.profiles p
LEFT JOIN public.companies c ON p.company_id = c.id
ORDER BY p.created_at DESC;
