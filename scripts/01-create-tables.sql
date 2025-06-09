-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
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

-- Wells table
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

-- Owners table
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

-- Well ownership table (many-to-many relationship)
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

-- Revenue table
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

-- Expenses table
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

-- Production data table
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

-- Distributions table
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

-- Create indexes for better performance
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
