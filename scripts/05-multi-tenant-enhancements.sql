-- Enhance companies table with subscription information
ALTER TABLE public.companies
ADD COLUMN subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'basic',
ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'trial', 'past_due', 'canceled')) DEFAULT 'trial',
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_id TEXT,
ADD COLUMN max_users INTEGER DEFAULT 5,
ADD COLUMN max_wells INTEGER DEFAULT 50,
ADD COLUMN tenant_settings JSONB DEFAULT '{}',
ADD COLUMN custom_domain TEXT,
ADD COLUMN logo_url TEXT;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')) DEFAULT 'trialing',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_method_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_invitations table
CREATE TABLE public.tenant_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'accountant', 'operator', 'viewer')) DEFAULT 'viewer',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, email)
);

-- Create tenant_settings table for company-specific configurations
CREATE TABLE public.tenant_settings (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    theme JSONB DEFAULT '{"primary_color": "#0f766e", "logo": null, "favicon": null}',
    fiscal_year_start INTEGER DEFAULT 1, -- Month (1-12)
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    currency TEXT DEFAULT 'USD',
    default_state TEXT DEFAULT 'TX',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table for tenant activity tracking
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tenant usage tracking
CREATE TABLE public.tenant_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    user_count INTEGER DEFAULT 0,
    well_count INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, month)
);

-- Enhance RLS policies for strict tenant isolation
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view company wells" ON public.wells;
DROP POLICY IF EXISTS "Admins and operators can manage wells" ON public.wells;
DROP POLICY IF EXISTS "Users can view company owners" ON public.owners;
DROP POLICY IF EXISTS "Admins and accountants can manage owners" ON public.owners;
DROP POLICY IF EXISTS "Users can view company revenue" ON public.revenue;
DROP POLICY IF EXISTS "Admins and accountants can manage revenue" ON public.revenue;
DROP POLICY IF EXISTS "Users can view company expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins and accountants can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view company production" ON public.production;
DROP POLICY IF EXISTS "Operators can manage production" ON public.production;

-- Create enhanced RLS policies for strict tenant isolation
-- Wells policies
CREATE POLICY "tenant_isolation_wells_select" ON public.wells
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "tenant_isolation_wells_insert" ON public.wells
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin', 'operator', 'accountant')
        )
    );

CREATE POLICY "tenant_isolation_wells_update" ON public.wells
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin', 'operator', 'accountant')
        )
    );

CREATE POLICY "tenant_isolation_wells_delete" ON public.wells
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin')
        )
    );

-- Similar policies for other tables
-- Owners policies
CREATE POLICY "tenant_isolation_owners_select" ON public.owners
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "tenant_isolation_owners_insert" ON public.owners
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin', 'accountant')
        )
    );

CREATE POLICY "tenant_isolation_owners_update" ON public.owners
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin', 'accountant')
        )
    );

CREATE POLICY "tenant_isolation_owners_delete" ON public.owners
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin')
        )
    );

-- Create RLS policies for new tables
CREATE POLICY "tenant_isolation_subscriptions" ON public.subscriptions
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role = 'admin'
        )
    );

CREATE POLICY "tenant_isolation_invitations_select" ON public.tenant_invitations
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
        )
    );

CREATE POLICY "tenant_isolation_invitations_insert" ON public.tenant_invitations
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role = 'admin'
        )
    );

CREATE POLICY "tenant_isolation_invitations_delete" ON public.tenant_invitations
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role = 'admin'
        )
    );

CREATE POLICY "tenant_isolation_settings" ON public.tenant_settings
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role = 'admin'
        )
    );

CREATE POLICY "tenant_isolation_audit_logs" ON public.audit_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid() AND company_id IS NOT NULL
            AND role IN ('admin', 'accountant')
        )
    );

-- Create function to enforce tenant isolation in all queries
CREATE OR REPLACE FUNCTION enforce_tenant_isolation()
RETURNS TRIGGER AS $$
DECLARE
    user_company_id UUID;
BEGIN
    -- Get the company_id of the current user
    SELECT company_id INTO user_company_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- If no company_id found or doesn't match, reject the operation
    IF user_company_id IS NULL OR NEW.company_id != user_company_id THEN
        RAISE EXCEPTION 'Tenant isolation violation: Cannot access data from another company';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    user_company_id UUID;
    user_id UUID;
BEGIN
    -- Get current user info
    SELECT auth.uid() INTO user_id;
    
    -- Get user's company_id
    SELECT company_id INTO user_company_id
    FROM public.profiles
    WHERE id = user_id;
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        previous_values,
        new_values
    ) VALUES (
        user_company_id,
        user_id,
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE 
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' 
            THEN to_jsonb(OLD) 
            ELSE NULL 
        END,
        CASE 
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'INSERT' 
            THEN to_jsonb(NEW) 
            ELSE NULL 
        END
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for main tables
CREATE TRIGGER wells_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.wells
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER owners_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.owners
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER revenue_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.revenue
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER expenses_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
