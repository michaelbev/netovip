-- Ensure sample data exists for all companies
DO $$
DECLARE
    company_record RECORD;
    well_count INTEGER;
    revenue_count INTEGER;
    owner_count INTEGER;
BEGIN
    -- Loop through all companies and ensure they have sample data
    FOR company_record IN 
        SELECT id, name FROM public.companies
    LOOP
        RAISE NOTICE 'Checking sample data for company: % (ID: %)', company_record.name, company_record.id;
        
        -- Check wells count
        SELECT COUNT(*) INTO well_count
        FROM public.wells
        WHERE company_id = company_record.id;
        
        -- Check revenue count
        SELECT COUNT(*) INTO revenue_count
        FROM public.revenue
        WHERE company_id = company_record.id;
        
        -- Check owners count
        SELECT COUNT(*) INTO owner_count
        FROM public.owners
        WHERE company_id = company_record.id;
        
        RAISE NOTICE 'Company % has: % wells, % revenue records, % owners', 
            company_record.name, well_count, revenue_count, owner_count;
        
        -- If no wells, add sample wells
        IF well_count = 0 THEN
            INSERT INTO public.wells (name, api_number, status, location, company_id) VALUES
            ('Well Alpha-1', '42-123-12345-00-00', 'active', 'Section 12, Township 5N, Range 3W', company_record.id),
            ('Well Beta-2', '42-123-12346-00-00', 'active', 'Section 13, Township 5N, Range 3W', company_record.id),
            ('Well Gamma-3', '42-123-12347-00-00', 'inactive', 'Section 14, Township 5N, Range 3W', company_record.id);
            
            RAISE NOTICE 'Added sample wells for %', company_record.name;
        END IF;
        
        -- If no owners, add sample owners (without ownership_percentage)
        IF owner_count = 0 THEN
            INSERT INTO public.owners (name, email, phone, address, city, state, zip_code, owner_type, company_id) VALUES
            ('John Smith', 'john.smith@email.com', '+1-555-0101', '456 Oak Street', 'Dallas', 'TX', '75201', 'individual', company_record.id),
            ('Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0102', '789 Pine Avenue', 'Austin', 'TX', '78301', 'individual', company_record.id),
            ('Mike Wilson', 'mike.wilson@email.com', '+1-555-0103', '321 Elm Drive', 'San Antonio', 'TX', '78201', 'individual', company_record.id);
            
            RAISE NOTICE 'Added sample owners for %', company_record.name;
        END IF;
        
        -- If no revenue, add sample revenue (only if wells exist)
        IF revenue_count = 0 AND well_count > 0 THEN
            -- Get well IDs for this company and add revenue
            INSERT INTO public.revenue (amount, gross_amount, net_amount, well_id, production_month, revenue_type, status, company_id)
            SELECT 
                (RANDOM() * 50000 + 10000)::DECIMAL(12,2) as amount,
                (RANDOM() * 55000 + 12000)::DECIMAL(12,2) as gross_amount,
                (RANDOM() * 45000 + 8000)::DECIMAL(12,2) as net_amount,
                w.id as well_id,
                '2024-01-01'::DATE as production_month,
                'oil' as revenue_type,
                'approved' as status,
                company_record.id
            FROM public.wells w
            WHERE w.company_id = company_record.id 
            AND w.status = 'active'
            LIMIT 5;
            
            RAISE NOTICE 'Added sample revenue for %', company_record.name;
        END IF;
        
    END LOOP;
    
END $$;

-- Final verification
SELECT 
    c.name as company_name,
    COUNT(DISTINCT w.id) as wells_count,
    COUNT(DISTINCT o.id) as owners_count,
    COUNT(DISTINCT r.id) as revenue_count
FROM public.companies c
LEFT JOIN public.wells w ON c.id = w.company_id
LEFT JOIN public.owners o ON c.id = o.company_id
LEFT JOIN public.revenue r ON c.id = r.company_id
GROUP BY c.id, c.name
ORDER BY c.name;
