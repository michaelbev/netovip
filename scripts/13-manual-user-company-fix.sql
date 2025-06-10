-- Manual fix for specific user
-- Replace 'your-email@example.com' with your actual email

DO $$
DECLARE
    user_email TEXT := 'mebevilacqua@gmail.com'; -- Replace with your email
    user_id UUID;
    company_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Temporarily disable RLS for this operation
    SET row_security = off;
    
    -- Create company
    INSERT INTO public.companies (name, email)
    VALUES ('My Oil & Gas Company', user_email)
    RETURNING id INTO company_id;
    
    -- Create or update profile
    INSERT INTO public.profiles (id, email, full_name, role, company_id)
    VALUES (user_id, user_email, 'Admin User', 'admin', company_id)
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        role = EXCLUDED.role;
    
    -- Re-enable RLS
    SET row_security = on;
    
    RAISE NOTICE 'Successfully created company % and associated user %', company_id, user_id;
END $$;

-- Verify the fix
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
