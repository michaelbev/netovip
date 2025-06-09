-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.well_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Companies policies
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

-- Similar policies for other tables
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
