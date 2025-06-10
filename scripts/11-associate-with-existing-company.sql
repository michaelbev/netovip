-- Option 2: Associate user with existing company
-- First, check what companies exist:

SELECT id, name, email FROM public.companies;

-- Then run this block, replacing the values:
DO $$
DECLARE
    user_id UUID;
    target_company_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- Replace with actual company ID
    user_email TEXT := 'mebevilacqua@gmail.com'; -- Replace with your email
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update or create the user profile with company association
    INSERT INTO public.profiles (id, email, full_name, role, company_id)
    VALUES (user_id, user_email, 'Admin User', 'admin', target_company_id)
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        role = EXCLUDED.role;
    
    RAISE NOTICE 'Associated user % with company %', user_id, target_company_id;
END $$;
