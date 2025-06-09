-- Option 1: Create a new company for your user
-- Replace 'your-email@example.com' with your actual email

DO $$
DECLARE
    user_id UUID;
    company_id UUID;
    user_email TEXT := 'mebevilacqua@gmail.com'; -- Replace with your email
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Check if user already has a company
    SELECT p.company_id INTO company_id
    FROM public.profiles p
    WHERE p.id = user_id;
    
    IF company_id IS NOT NULL THEN
        RAISE NOTICE 'User already has company ID: %', company_id;
        RETURN;
    END IF;
    
    -- Create a new company
    INSERT INTO public.companies (name, email)
    VALUES ('My Oil & Gas Company', user_email)
    RETURNING id INTO company_id;
    
    -- Update or create the user profile
    INSERT INTO public.profiles (id, email, full_name, role, company_id)
    VALUES (user_id, user_email, 'Admin User', 'admin', company_id)
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RAISE NOTICE 'Created company % and associated user %', company_id, user_id;
END $$;

-- Verify the association worked
SELECT 
    u.email,
    p.full_name,
    p.role,
    c.name as company_name,
    c.id as company_id
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.companies c ON p.company_id = c.id
WHERE u.email = 'mebevilacqua@gmail.com'; -- Replace with your email
