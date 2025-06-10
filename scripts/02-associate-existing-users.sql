-- ASSOCIATE EXISTING USERS WITH COMPANIES

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    company1_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- Netovip Energy
    company2_id UUID := '550e8400-e29b-41d4-a716-446655440099'; -- Cooil Energy
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM auth.users WHERE email = 'mebevilacqua@gmail.com';
    SELECT id INTO user2_id FROM auth.users WHERE email = 'john@cooil.com';
    
    -- Associate first user with Netovip Energy as admin
    IF user1_id IS NOT NULL THEN
        UPDATE public.profiles
        SET 
            company_id = company1_id,
            role = 'admin',
            full_name = COALESCE(full_name, 'Admin User')
        WHERE id = user1_id;
        
        RAISE NOTICE 'Associated user mebevilacqua@gmail.com with Netovip Energy as admin';
    ELSE
        RAISE NOTICE 'User mebevilacqua@gmail.com not found';
    END IF;
    
    -- Associate second user with Cooil Energy as admin
    IF user2_id IS NOT NULL THEN
        UPDATE public.profiles
        SET 
            company_id = company2_id,
            role = 'admin',
            full_name = COALESCE(full_name, 'John Thompson')
        WHERE id = user2_id;
        
        RAISE NOTICE 'Associated user john@cooil.com with Cooil Energy as admin';
    ELSE
        RAISE NOTICE 'User john@cooil.com not found';
    END IF;
END $$;

-- Verify associations
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
