-- Add sample data for the new company
DO $$
DECLARE
    company_id UUID;
    well_id1 UUID;
    well_id2 UUID;
    owner_id1 UUID;
    owner_id2 UUID;
BEGIN
    -- Get the company ID for Cooil Energy
    SELECT id INTO company_id
    FROM public.companies
    WHERE name = 'Cooil Energy LLC';
    
    IF company_id IS NULL THEN
        RAISE EXCEPTION 'Company "Cooil Energy LLC" not found';
    END IF;
    
    -- Add sample wells
    INSERT INTO public.wells (company_id, name, api_number, location, county, state, status, well_type, spud_date, completion_date)
    VALUES 
        (company_id, 'Marcellus #42', '37-123-45680', 'Section 5, T3N R7W', 'Washington', 'PA', 'active', 'gas', '2023-05-10', '2023-07-15'),
        (company_id, 'Utica #17', '37-123-45681', 'Section 8, T4N R6W', 'Greene', 'PA', 'active', 'gas', '2023-06-20', '2023-08-25')
    RETURNING id INTO well_id1;
    
    -- Get the second well ID
    SELECT id INTO well_id2
    FROM public.wells
    WHERE company_id = company_id AND name = 'Utica #17';
    
    -- Add sample owners
    INSERT INTO public.owners (company_id, name, email, phone, address, city, state, zip_code, owner_type)
    VALUES
        (company_id, 'Robert Johnson', 'robert@example.com', '555-0201', '789 Oak St', 'Pittsburgh', 'PA', '15213', 'individual'),
        (company_id, 'XYZ Resources LLC', 'contact@xyzresources.com', '555-0202', '456 Pine Blvd', 'Philadelphia', 'PA', '19103', 'corporation')
    RETURNING id INTO owner_id1;
    
    -- Get the second owner ID
    SELECT id INTO owner_id2
    FROM public.owners
    WHERE company_id = company_id AND name = 'XYZ Resources LLC';
    
    -- Add sample well ownership
    INSERT INTO public.well_ownership (well_id, owner_id, ownership_percentage, interest_type, effective_date)
    VALUES
        (well_id1, owner_id1, 0.3500, 'working', '2023-07-15'),
        (well_id1, owner_id2, 0.6500, 'working', '2023-07-15'),
        (well_id2, owner_id1, 0.2500, 'working', '2023-08-25'),
        (well_id2, owner_id2, 0.7500, 'working', '2023-08-25');
    
    -- Add sample production data
    INSERT INTO public.production (well_id, production_date, oil_volume, gas_volume, water_volume, oil_price, gas_price)
    VALUES
        (well_id1, '2024-01-01', 0, 235.7, 8.3, 0, 3.85),
        (well_id1, '2024-01-02', 0, 228.4, 7.9, 0, 3.82),
        (well_id2, '2024-01-01', 0, 312.6, 12.4, 0, 3.85);
    
    -- Add sample revenue
    INSERT INTO public.revenue (well_id, company_id, amount, gross_amount, net_amount, production_month, revenue_type, product_volume, product_price, status)
    VALUES
        (well_id1, company_id, 27500.00, 29000.00, 27500.00, '2024-01-01', 'gas', 7150.5, 3.85, 'approved'),
        (well_id2, company_id, 36400.00, 38500.00, 36400.00, '2024-01-01', 'gas', 9450.8, 3.85, 'approved');
    
    -- Add sample expenses
    INSERT INTO public.expenses (well_id, company_id, amount, expense_date, category, subcategory, description, vendor_name, status)
    VALUES
        (well_id1, company_id, 4200.00, '2024-01-10', 'Operations', 'Maintenance', 'Compressor maintenance', 'Gas Services Inc', 'approved'),
        (well_id2, company_id, 3750.00, '2024-01-08', 'Operations', 'Chemical', 'Corrosion inhibitor treatment', 'Chemical Solutions LLC', 'paid');
    
    RAISE NOTICE 'Sample data added for company %', company_id;
END $$;
