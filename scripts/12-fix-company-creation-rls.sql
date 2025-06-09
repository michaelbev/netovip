-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage their company" ON public.companies;

-- Create more permissive policies for company creation
-- Allow users to create companies (needed for signup)
CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT 
    WITH CHECK (true); -- Allow any authenticated user to create a company

-- Allow users to view companies they're associated with
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND company_id IS NOT NULL
            )
            OR 
            -- Allow viewing during creation process
            NOT EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND company_id IS NOT NULL
            )
        )
    );

-- Allow users to update their own company
CREATE POLICY "Users can update their company" ON public.companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin')
        )
    );

-- Allow users to delete their own company (admin only)
CREATE POLICY "Users can delete their company" ON public.companies
    FOR DELETE USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also fix the profiles policies to allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL -- Allow profile creation during signup
    );

-- Allow updating profiles during company association
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
    ) WITH CHECK (
        auth.uid() = id
    );
