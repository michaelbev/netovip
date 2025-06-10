-- Production User Setup Script
-- This script safely creates profile and company records for existing authenticated users

DO $$
DECLARE
    auth_user RECORD;
    existing_profile_id UUID;
    existing_company_id UUID;
    new_company_id UUID;
    setup_count INTEGER := 0;
BEGIN
    -- Loop through all authenticated users who don't have profiles
    FOR auth_user IN 
        SELECT DISTINCT 
            au.id,
            au.email,
            au.raw_user_meta_data->>'full_name' as full_name
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
        AND au.email IS NOT NULL
        AND au.confirmed_at IS NOT NULL
    LOOP
        RAISE NOTICE 'Setting up user: % (%)', auth_user.email, auth_user.id;
        
        -- Create a company for this user
        INSERT INTO public.companies (
            name, 
            email, 
            phone,
            address,
            city,
            state,
            zip_code,
            tax_id,
            created_at, 
            updated_at
        )
        VALUES (
            COALESCE(auth_user.full_name || '''s Company', 'My Oil & Gas Company'),
            auth_user.email,
            '',
            '',
            '',
            '',
            '',
            '',
            NOW(), 
            NOW()
        )
        RETURNING id INTO new_company_id;
        
        -- Create the profile
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            company_id,
            created_at,
            updated_at
        )
        VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.full_name, 'User'),
            'admin',
            new_company_id,
            NOW(),
            NOW()
        );
        
        setup_count := setup_count + 1;
        RAISE NOTICE 'Created profile and company for user: %', auth_user.email;
    END LOOP;
    
    RAISE NOTICE 'Setup complete. Processed % users.', setup_count;
END $$;

-- Verify the setup
SELECT 
    'Setup Verification' as status,
    COUNT(*) as total_auth_users,
    COUNT(p.id) as users_with_profiles,
    COUNT(p.company_id) as users_with_companies
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.confirmed_at IS NOT NULL;

-- Show all users and their setup status
SELECT 
    au.email,
    au.id as auth_id,
    p.id as profile_id,
    p.full_name,
    p.role,
    p.company_id,
    c.name as company_name,
    CASE 
        WHEN p.id IS NULL THEN 'Missing Profile'
        WHEN p.company_id IS NULL THEN 'Missing Company'
        ELSE 'Complete Setup'
    END as setup_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
WHERE au.confirmed_at IS NOT NULL
ORDER BY au.created_at;
