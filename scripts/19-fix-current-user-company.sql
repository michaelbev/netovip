-- Check current user status and fix company association
DO $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    existing_company_id UUID;
    netovip_company_id UUID;
BEGIN
    -- Get the current authenticated user (you'll need to replace this with your actual user email)
    -- Check what users exist first
    RAISE NOTICE 'Current users in the system:';
    FOR current_user_email IN 
        SELECT email FROM auth.users ORDER BY created_at
    LOOP
        RAISE NOTICE 'User: %', current_user_email;
    END LOOP;
    
    -- Get the first user (assuming it's the one you're logged in with)
    SELECT id, email INTO current_user_id, current_user_email
    FROM auth.users 
    ORDER BY created_at 
    LIMIT 1;
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in the system';
    END IF;
    
    RAISE NOTICE 'Working with user: % (ID: %)', current_user_email, current_user_id;
    
    -- Check if user has a profile
    SELECT company_id INTO existing_company_id
    FROM public.profiles
    WHERE id = current_user_id;
    
    IF existing_company_id IS NOT NULL THEN
        RAISE NOTICE 'User already has company ID: %', existing_company_id;
        RETURN;
    END IF;
    
    -- Check if Netovip Energy company exists
    SELECT id INTO netovip_company_id
    FROM public.companies
    WHERE name = 'Netovip Energy';
    
    IF netovip_company_id IS NULL THEN
        -- Create Netovip Energy company
        INSERT INTO public.companies (name, email, phone, address)
        VALUES (
            'Netovip Energy',
            current_user_email,
            '+1-555-0123',
            '123 Energy Drive, Houston, TX 77002'
        )
        RETURNING id INTO netovip_company_id;
        
        RAISE NOTICE 'Created Netovip Energy company with ID: %', netovip_company_id;
    ELSE
        RAISE NOTICE 'Found existing Netovip Energy company with ID: %', netovip_company_id;
    END IF;
    
    -- Update or create user profile
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
        current_user_id,
        current_user_email,
        'Admin User',
        netovip_company_id,
        'admin'
    )
    ON CONFLICT (id) DO UPDATE SET
        company_id = netovip_company_id,
        role = 'admin',
        updated_at = NOW();
    
    RAISE NOTICE 'Associated user % with Netovip Energy (company ID: %)', current_user_email, netovip_company_id;
    
END $$;

-- Verify the association
SELECT 
    u.email,
    p.full_name,
    p.role,
    c.name as company_name,
    c.id as company_id
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
ORDER BY u.created_at;
