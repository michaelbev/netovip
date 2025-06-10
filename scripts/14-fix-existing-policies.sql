-- Drop existing policies if they exist (ignore errors if they don't exist)
DO $$ 
BEGIN
    -- Drop profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    
    -- Drop companies policies
    DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
    DROP POLICY IF EXISTS "Admins can manage their company" ON public.companies;
    DROP POLICY IF EXISTS "Users can insert companies" ON public.companies;
    
    -- Drop wells policies
    DROP POLICY IF EXISTS "Users can view company wells" ON public.wells;
    DROP POLICY IF EXISTS "Admins and operators can manage wells" ON public.wells;
    
    -- Drop owners policies
    DROP POLICY IF EXISTS "Users can view company owners" ON public.owners;
    DROP POLICY IF EXISTS "Admins and accountants can manage owners" ON public.owners;
    
    -- Drop revenue policies
    DROP POLICY IF EXISTS "Users can view company revenue" ON public.revenue;
    DROP POLICY IF EXISTS "Admins and accountants can manage revenue" ON public.revenue;
    
    -- Drop expenses policies
    DROP POLICY IF EXISTS "Users can view company expenses" ON public.expenses;
    DROP POLICY IF EXISTS "Admins and accountants can manage expenses" ON public.expenses;
    
    -- Drop production policies
    DROP POLICY IF EXISTS "Users can view company production" ON public.production;
    DROP POLICY IF EXISTS "Operators can manage production" ON public.production;
    
    -- Drop distributions policies
    DROP POLICY IF EXISTS "Users can view company distributions" ON public.distributions;
    DROP POLICY IF EXISTS "Admins can manage distributions" ON public.distributions;
    
    -- Drop well_ownership policies
    DROP POLICY IF EXISTS "Users can view company well ownership" ON public.well_ownership;
    DROP POLICY IF EXISTS "Admins can manage well ownership" ON public.well_ownership;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not have existed: %', SQLERRM;
END $$;

-- Now recreate all policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert companies" ON public.companies
    FOR INSERT WITH CHECK (true); -- Allow company creation during signup

CREATE POLICY "Admins can manage their company" ON public.companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Wells policies
CREATE POLICY "Users can view company wells" ON public.wells
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and operators can manage wells" ON public.wells
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator', 'accountant')
        )
    );

-- Owners policies
CREATE POLICY "Users can view company owners" ON public.owners
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and accountants can manage owners" ON public.owners
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- Well ownership policies
CREATE POLICY "Users can view company well ownership" ON public.well_ownership
    FOR SELECT USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage well ownership" ON public.well_ownership
    FOR ALL USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
        )
    );

-- Revenue policies
CREATE POLICY "Users can view company revenue" ON public.revenue
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and accountants can manage revenue" ON public.revenue
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- Expenses policies
CREATE POLICY "Users can view company expenses" ON public.expenses
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and accountants can manage expenses" ON public.expenses
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- Production policies
CREATE POLICY "Users can view company production" ON public.production
    FOR SELECT USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Operators can manage production" ON public.production
    FOR ALL USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'operator', 'accountant')
            )
        )
    );

-- Distributions policies
CREATE POLICY "Users can view company distributions" ON public.distributions
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage distributions" ON public.distributions
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );
