-- Associate the user john@cooil.com with a company
DO $$
DECLARE
    user_id UUID;
    new_company_id UUID;
    user_email TEXT := 'john@cooil.com'; -- The user we want to update
    existing_company_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Check if user already has a company
    SELECT p.company_id INTO existing_company_id
    FROM public.profiles p
    WHERE p.id = user_id;
    
    IF existing_company_id IS NOT NULL THEN
        RAISE NOTICE 'User already has company ID: %', existing_company_id;
        RETURN;
    END IF;
    
    -- Create a new company for this user
    INSERT INTO public.companies (name, email)
    VALUES ('Cooil Energy LLC', user_email)
    RETURNING id INTO new_company_id;
    
    -- Update the user profile with company association
    UPDATE public.profiles
    SET 
        company_id = new_company_id,
        role = 'admin'
    WHERE id = user_id;
    
    RAISE NOTICE 'Created company % and associated user %', new_company_id, user_id;
    
    -- Verify the association worked
    RAISE NOTICE 'Verification: User % now associated with company %', user_id, new_company_id;
END $$;

-- Final verification query
SELECT 
    u.email,
    p.full_name,
    p.role,
    c.name as company_name,
    c.id as company_id
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.companies c ON p.company_id = c.id
WHERE u.email = 'john@cooil.com';
