-- VERIFY COMPLETE DATABASE SETUP

-- Check tables exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check data counts
SELECT 'companies' as table_name, count(*) as row_count FROM public.companies
UNION ALL
SELECT 'profiles', count(*) FROM public.profiles
UNION ALL
SELECT 'wells', count(*) FROM public.wells
UNION ALL
SELECT 'owners', count(*) FROM public.owners
UNION ALL
SELECT 'revenue', count(*) FROM public.revenue
UNION ALL
SELECT 'expenses', count(*) FROM public.expenses
UNION ALL
SELECT 'production', count(*) FROM public.production
ORDER BY table_name;

-- Check user associations
SELECT 
    u.email,
    p.full_name,
    p.role,
    c.name as company_name,
    c.id as company_id
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
ORDER BY u.email;

-- Check policies exist
SELECT 
    tablename,
    count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database verification complete! Check the results above to ensure everything is set up correctly.';
END $$;
