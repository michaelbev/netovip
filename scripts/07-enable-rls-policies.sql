-- Enable Row Level Security on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Only enable RLS on other tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wells') THEN
        ALTER TABLE public.wells ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'owners') THEN
        ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue') THEN
        ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'production') THEN
        ALTER TABLE public.production ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Admins can manage their company" ON public.companies;

-- Create basic policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create basic policies for companies
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage their company" ON public.companies
    FOR ALL USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create basic policies for wells (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wells') THEN
        DROP POLICY IF EXISTS "Users can view company wells" ON public.wells;
        DROP POLICY IF EXISTS "Users can manage wells" ON public.wells;
        
        CREATE POLICY "Users can view company wells" ON public.wells
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM public.profiles 
                    WHERE id = auth.uid()
                )
            );

        CREATE POLICY "Users can manage wells" ON public.wells
            FOR ALL USING (
                company_id IN (
                    SELECT company_id FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'operator', 'accountant')
                )
            );
    END IF;
END $$;

-- Create basic policies for revenue (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue') THEN
        DROP POLICY IF EXISTS "Users can view company revenue" ON public.revenue;
        DROP POLICY IF EXISTS "Users can manage revenue" ON public.revenue;
        
        CREATE POLICY "Users can view company revenue" ON public.revenue
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM public.profiles 
                    WHERE id = auth.uid()
                )
            );

        CREATE POLICY "Users can manage revenue" ON public.revenue
            FOR ALL USING (
                company_id IN (
                    SELECT company_id FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'accountant')
                )
            );
    END IF;
END $$;
