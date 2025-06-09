-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate revenue distributions
CREATE OR REPLACE FUNCTION calculate_revenue_distribution(revenue_id UUID)
RETURNS TABLE (
    owner_id UUID,
    owner_name TEXT,
    ownership_percentage NUMERIC,
    gross_amount NUMERIC,
    net_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wo.owner_id,
        o.name as owner_name,
        wo.ownership_percentage,
        (r.amount * wo.ownership_percentage) as gross_amount,
        (r.amount * wo.ownership_percentage) as net_amount
    FROM public.revenue r
    JOIN public.well_ownership wo ON r.well_id = wo.well_id
    JOIN public.owners o ON wo.owner_id = o.id
    WHERE r.id = revenue_id
    AND wo.effective_date <= r.production_month
    AND (wo.end_date IS NULL OR wo.end_date >= r.production_month);
END;
$$ LANGUAGE plpgsql;
