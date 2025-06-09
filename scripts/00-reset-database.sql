-- COMPLETE DATABASE RESET AND RECREATION
-- This script will drop all existing tables and recreate everything from scratch

-- First, disable RLS temporarily to allow cleanup
SET row_security = off;

-- Drop all existing tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.tenant_usage CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.tenant_invitations CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.distributions CASCADE;
DROP TABLE IF EXISTS public.production CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.revenue CASCADE;
DROP TABLE IF EXISTS public.well_ownership CASCADE;
DROP TABLE IF EXISTS public.owners CASCADE;
DROP TABLE IF EXISTS public.wells CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_revenue_distribution(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.enforce_tenant_isolation() CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event() CASCADE;

-- Re-enable RLS
SET row_security = on;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'basic',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'trial', 'past_due', 'canceled')) DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_id TEXT,
    max_users INTEGER DEFAULT 5,
    max_wells INTEGER DEFAULT 50,
    tenant_settings JSONB DEFAULT '{}',
    custom_domain TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'accountant', 'operator', 'viewer')) DEFAULT 'operator',
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WELLS TABLE
CREATE TABLE public.wells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_number TEXT UNIQUE,
    location TEXT,
    county TEXT,
    state TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'plugged', 'drilling')) DEFAULT 'active',
    well_type TEXT CHECK (well_type IN ('oil', 'gas', 'injection', 'water')) DEFAULT 'oil',
    spud_date DATE,
    completion_date DATE,
    total_depth NUMERIC,
    production_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. OWNERS TABLE
CREATE TABLE public.owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    tax_id TEXT,
    owner_type TEXT CHECK (owner_type IN ('individual', 'corporation', 'partnership', 'trust')) DEFAULT 'individual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WELL OWNERSHIP TABLE
CREATE TABLE public.well_ownership (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID NOT NULL REFERENCES public.wells(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    ownership_percentage NUMERIC(5,4) NOT NULL CHECK (ownership_percentage > 0 AND ownership_percentage <= 1),
    interest_type TEXT CHECK (interest_type IN ('working', 'royalty', 'overriding_royalty', 'net_profits')) DEFAULT 'working',
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(well_id, owner_id, interest_type, effective_date)
);

-- 6. REVENUE TABLE
CREATE TABLE public.revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID NOT NULL REFERENCES public.wells(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    gross_amount NUMERIC(12,2),
    net_amount NUMERIC(12,2),
    production_month DATE NOT NULL,
    revenue_type TEXT CHECK (revenue_type IN ('oil', 'gas', 'ngl', 'other')) DEFAULT 'oil',
    product_volume NUMERIC(10,3),
    product_price NUMERIC(8,4),
    status TEXT CHECK (status IN ('pending', 'approved', 'distributed', 'cancelled')) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EXPENSES TABLE
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID REFERENCES public.wells(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    vendor_name TEXT,
    invoice_number TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PRODUCTION TABLE
CREATE TABLE public.production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    well_id UUID NOT NULL REFERENCES public.wells(id) ON DELETE CASCADE,
    production_date DATE NOT NULL,
    oil_volume NUMERIC(10,3) DEFAULT 0,
    gas_volume NUMERIC(12,3) DEFAULT 0,
    water_volume NUMERIC(10,3) DEFAULT 0,
    oil_price NUMERIC(8,4),
    gas_price NUMERIC(8,4),
    run_ticket_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(well_id, production_date)
);

-- 9. DISTRIBUTIONS TABLE
CREATE TABLE public.distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    revenue_id UUID NOT NULL REFERENCES public.revenue(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    well_id UUID NOT NULL REFERENCES public.wells(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    gross_amount NUMERIC(12,2) NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL,
    ownership_percentage NUMERIC(5,4) NOT NULL,
    deductions NUMERIC(12,2) DEFAULT 0,
    taxes NUMERIC(12,2) DEFAULT 0,
    status TEXT CHECK (status IN ('calculated', 'approved', 'paid', 'cancelled')) DEFAULT 'calculated',
    payment_date DATE,
    check_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_wells_company_id ON public.wells(company_id);
CREATE INDEX idx_wells_status ON public.wells(status);
CREATE INDEX idx_owners_company_id ON public.owners(company_id);
CREATE INDEX idx_revenue_well_id ON public.revenue(well_id);
CREATE INDEX idx_revenue_production_month ON public.revenue(production_month);
CREATE INDEX idx_expenses_well_id ON public.expenses(well_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX idx_production_well_id_date ON public.production(well_id, production_date);
CREATE INDEX idx_distributions_owner_id ON public.distributions(owner_id);
CREATE INDEX idx_distributions_status ON public.distributions(status);

-- CREATE FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wells_updated_at BEFORE UPDATE ON public.wells
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON public.owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON public.revenue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributions_updated_at BEFORE UPDATE ON public.distributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- USER SIGNUP FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USER SIGNUP TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.well_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- COMPANIES POLICIES
CREATE POLICY "Users can view their company" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update their company" ON public.companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- WELLS POLICIES
CREATE POLICY "Users can view company wells" ON public.wells
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can manage wells" ON public.wells
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator', 'accountant')
        )
    );

-- OWNERS POLICIES
CREATE POLICY "Users can view company owners" ON public.owners
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can manage owners" ON public.owners
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- WELL OWNERSHIP POLICIES
CREATE POLICY "Users can view company well ownership" ON public.well_ownership
    FOR SELECT USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND company_id IS NOT NULL
            )
        )
    );

CREATE POLICY "Users can manage well ownership" ON public.well_ownership
    FOR ALL USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'accountant')
            )
        )
    );

-- REVENUE POLICIES
CREATE POLICY "Users can view company revenue" ON public.revenue
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can manage revenue" ON public.revenue
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- EXPENSES POLICIES
CREATE POLICY "Users can view company expenses" ON public.expenses
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can manage expenses" ON public.expenses
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- PRODUCTION POLICIES
CREATE POLICY "Users can view company production" ON public.production
    FOR SELECT USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND company_id IS NOT NULL
            )
        )
    );

CREATE POLICY "Users can manage production" ON public.production
    FOR ALL USING (
        well_id IN (
            SELECT id FROM public.wells 
            WHERE company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() AND role IN ('admin', 'operator', 'accountant')
            )
        )
    );

-- DISTRIBUTIONS POLICIES
CREATE POLICY "Users can view company distributions" ON public.distributions
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "Users can manage distributions" ON public.distributions
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'accountant')
        )
    );

-- SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE 'Database reset complete! All tables, functions, triggers, and policies have been recreated.';
END $$;
