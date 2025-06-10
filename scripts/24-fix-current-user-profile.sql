-- Check current user's profile and company status
DO $$
DECLARE
    user_id UUID := '7ee03c50-5545-476f-86fc-f7a1d2750166';
    user_email TEXT := 'mebevilacqua@gmail.com';
    existing_profile_id UUID;
    existing_company_id UUID;
    new_company_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO existing_profile_id 
    FROM profiles 
    WHERE id = user_id;
    
    IF existing_profile_id IS NULL THEN
        RAISE NOTICE 'Profile does not exist for user %, creating...', user_email;
        
        -- Create a default company first
        INSERT INTO companies (name, email, created_at, updated_at)
        VALUES ('My Oil & Gas Company', user_email, NOW(), NOW())
        RETURNING id INTO new_company_id;
        
        RAISE NOTICE 'Created company with ID: %', new_company_id;
        
        -- Create the profile with company association
        INSERT INTO profiles (id, email, full_name, role, company_id, created_at, updated_at)
        VALUES (
            user_id,
            user_email,
            'User', -- Default name, can be updated later
            'admin',
            new_company_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created profile for user % with company %', user_email, new_company_id;
    ELSE
        RAISE NOTICE 'Profile exists for user %', user_email;
        
        -- Check if profile has company_id
        SELECT company_id INTO existing_company_id 
        FROM profiles 
        WHERE id = user_id;
        
        IF existing_company_id IS NULL THEN
            RAISE NOTICE 'Profile exists but no company association, creating company...';
            
            -- Create a default company
            INSERT INTO companies (name, email, created_at, updated_at)
            VALUES ('My Oil & Gas Company', user_email, NOW(), NOW())
            RETURNING id INTO new_company_id;
            
            -- Update profile with company association
            UPDATE profiles 
            SET company_id = new_company_id, updated_at = NOW()
            WHERE id = user_id;
            
            RAISE NOTICE 'Associated user % with company %', user_email, new_company_id;
        ELSE
            RAISE NOTICE 'User % already has company association: %', user_email, existing_company_id;
        END IF;
    END IF;
    
    -- Verify the setup
    PERFORM p.id, p.email, p.full_name, p.role, p.company_id, c.name as company_name
    FROM profiles p
    LEFT JOIN companies c ON p.company_id = c.id
    WHERE p.id = user_id;
    
    RAISE NOTICE 'Setup verification complete for user %', user_email;
END $$;

-- Show final status
SELECT 
    p.id as profile_id,
    p.email,
    p.full_name,
    p.role,
    p.company_id,
    c.name as company_name,
    c.email as company_email
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.id = '7ee03c50-5545-476f-86fc-f7a1d2750166';
