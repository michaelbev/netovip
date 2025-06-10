-- ADD SAMPLE DATA FOR TESTING

-- Insert sample companies
INSERT INTO public.companies (id, name, address, phone, email, tax_id) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Netovip Energy LLC', '370 17th Street Ste 3025, Denver, CO 80202', '877-748-6836', 'hello@netovip.com', '12-3456789'),
('550e8400-e29b-41d4-a716-446655440099', 'Cooil Energy LLC', '123 Energy Blvd, Houston, TX 77002', '713-555-0100', 'john@cooil.com', '98-7654321');

-- Insert sample wells for Netovip Energy
INSERT INTO public.wells (id, company_id, name, api_number, location, county, state, status, well_type, spud_date, completion_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Eagle Ford #23', '42-123-45678', 'Section 12, T5S R8E', 'Karnes', 'TX', 'active', 'oil', '2023-01-15', '2023-03-20'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Permian #18', '42-123-45679', 'Section 8, T2N R4W', 'Midland', 'TX', 'active', 'oil', '2023-02-10', '2023-04-15'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Bakken #31', '33-456-78901', 'Section 15, T152N R95W', 'McKenzie', 'ND', 'active', 'oil', '2023-03-05', '2023-05-10');

-- Insert sample wells for Cooil Energy
INSERT INTO public.wells (id, company_id, name, api_number, location, county, state, status, well_type, spud_date, completion_date) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440099', 'Marcellus #42', '37-123-45680', 'Section 5, T3N R7W', 'Washington', 'PA', 'active', 'gas', '2023-05-10', '2023-07-15'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440099', 'Utica #17', '37-123-45681', 'Section 8, T4N R6W', 'Greene', 'PA', 'active', 'gas', '2023-06-20', '2023-08-25');

-- Insert sample owners for Netovip Energy
INSERT INTO public.owners (id, company_id, name, email, phone, address, city, state, zip_code, owner_type) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john.smith@email.com', '555-0101', '123 Main St', 'Houston', 'TX', '77001', 'individual'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'ABC Minerals Corp', 'contact@abcminerals.com', '555-0102', '456 Corporate Blvd', 'Dallas', 'TX', '75201', 'corporation'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Smith Family Trust', 'trustee@smithfamily.com', '555-0103', '789 Trust Ave', 'Austin', 'TX', '78701', 'trust');

-- Insert sample owners for Cooil Energy
INSERT INTO public.owners (id, company_id, name, email, phone, address, city, state, zip_code, owner_type) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440099', 'Robert Johnson', 'robert@example.com', '555-0201', '789 Oak St', 'Pittsburgh', 'PA', '15213', 'individual'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440099', 'XYZ Resources LLC', 'contact@xyzresources.com', '555-0202', '456 Pine Blvd', 'Philadelphia', 'PA', '19103', 'corporation');

-- Insert sample well ownership for Netovip Energy
INSERT INTO public.well_ownership (well_id, owner_id, ownership_percentage, interest_type, effective_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 0.2500, 'working', '2023-03-20'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 0.5000, 'working', '2023-03-20'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 0.2500, 'royalty', '2023-03-20');

-- Insert sample well ownership for Cooil Energy
INSERT INTO public.well_ownership (well_id, owner_id, ownership_percentage, interest_type, effective_date) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440110', 0.3500, 'working', '2023-07-15'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440111', 0.6500, 'working', '2023-07-15'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440110', 0.2500, 'working', '2023-08-25'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440111', 0.7500, 'working', '2023-08-25');

-- Insert sample production data
INSERT INTO public.production (well_id, production_date, oil_volume, gas_volume, water_volume, oil_price, gas_price) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2024-01-01', 45.5, 125.3, 12.8, 75.25, 3.45),
('550e8400-e29b-41d4-a716-446655440001', '2024-01-02', 43.2, 118.7, 11.9, 74.80, 3.42),
('550e8400-e29b-41d4-a716-446655440002', '2024-01-01', 38.9, 98.4, 15.2, 75.25, 3.45),
('550e8400-e29b-41d4-a716-446655440101', '2024-01-01', 0, 235.7, 8.3, 0, 3.85),
('550e8400-e29b-41d4-a716-446655440101', '2024-01-02', 0, 228.4, 7.9, 0, 3.82),
('550e8400-e29b-41d4-a716-446655440102', '2024-01-01', 0, 312.6, 12.4, 0, 3.85);

-- Insert sample revenue
INSERT INTO public.revenue (well_id, company_id, amount, gross_amount, net_amount, production_month, revenue_type, product_volume, product_price, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 89500.00, 95000.00, 89500.00, '2024-01-01', 'oil', 1250.5, 75.25, 'approved'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 82300.00, 87000.00, 82300.00, '2024-01-01', 'oil', 1180.3, 74.80, 'approved'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440099', 27500.00, 29000.00, 27500.00, '2024-01-01', 'gas', 7150.5, 3.85, 'approved'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440099', 36400.00, 38500.00, 36400.00, '2024-01-01', 'gas', 9450.8, 3.85, 'approved');

-- Insert sample expenses
INSERT INTO public.expenses (well_id, company_id, amount, expense_date, category, subcategory, description, vendor_name, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3200.00, '2024-01-15', 'Operations', 'Maintenance', 'Pump jack repair', 'ABC Oilfield Services', 'approved'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 1850.00, '2024-01-12', 'Operations', 'Chemical', 'Corrosion inhibitor', 'Chemical Solutions Inc', 'paid'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440099', 4200.00, '2024-01-10', 'Operations', 'Maintenance', 'Compressor maintenance', 'Gas Services Inc', 'approved'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440099', 3750.00, '2024-01-08', 'Operations', 'Chemical', 'Corrosion inhibitor treatment', 'Chemical Solutions LLC', 'paid');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Sample data added successfully! Created 2 companies with wells, owners, production, revenue, and expenses.';
END $$;
