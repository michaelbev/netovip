-- Check if auth functions are working properly
SELECT 
    routine_name, 
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%auth%' OR routine_name LIKE '%user%';

-- Check if the handle_new_user trigger is properly set up
SELECT 
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if the auth.users table exists and has data
SELECT 
    count(*) as user_count
FROM auth.users;

-- Check if RLS is enabled on key tables
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'companies', 'wells', 'revenue');
