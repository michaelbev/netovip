-- Add new columns to the companies table if they don't exist
DO $$
BEGIN
    -- Check and add phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'phone') THEN
        ALTER TABLE companies ADD COLUMN phone TEXT;
    END IF;

    -- Check and add website column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'website') THEN
        ALTER TABLE companies ADD COLUMN website TEXT;
    END IF;

    -- Check and add address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'address') THEN
        ALTER TABLE companies ADD COLUMN address TEXT;
    END IF;

    -- Check and add city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'city') THEN
        ALTER TABLE companies ADD COLUMN city TEXT;
    END IF;

    -- Check and add state column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'state') THEN
        ALTER TABLE companies ADD COLUMN state TEXT;
    END IF;

    -- Check and add zip column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'zip') THEN
        ALTER TABLE companies ADD COLUMN zip TEXT;
    END IF;

    -- Check and add country column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'country') THEN
        ALTER TABLE companies ADD COLUMN country TEXT;
    END IF;

    -- Check and add tax_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'tax_id') THEN
        ALTER TABLE companies ADD COLUMN tax_id TEXT;
    END IF;

    -- Check and add industry column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'industry') THEN
        ALTER TABLE companies ADD COLUMN industry TEXT;
    END IF;

    -- Check and add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'description') THEN
        ALTER TABLE companies ADD COLUMN description TEXT;
    END IF;

    -- Check and add operator_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'operator_id') THEN
        ALTER TABLE companies ADD COLUMN operator_id TEXT;
    END IF;

    -- Check and add rrc_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'rrc_number') THEN
        ALTER TABLE companies ADD COLUMN rrc_number TEXT;
    END IF;

    -- Check and add federal_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'federal_id') THEN
        ALTER TABLE companies ADD COLUMN federal_id TEXT;
    END IF;

    -- Check and add insurance_provider column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'insurance_provider') THEN
        ALTER TABLE companies ADD COLUMN insurance_provider TEXT;
    END IF;

    -- Check and add emergency_contact column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'companies' 
                   AND column_name = 'emergency_contact') THEN
        ALTER TABLE companies ADD COLUMN emergency_contact TEXT;
    END IF;
END$$;

-- Update existing companies with sample data if fields are empty
UPDATE companies
SET 
    phone = COALESCE(phone, '+1 (555) 123-4567'),
    website = COALESCE(website, 'https://www.netovip.com'),
    address = COALESCE(address, '123 Energy Plaza'),
    city = COALESCE(city, 'Houston'),
    state = COALESCE(state, 'TX'),
    zip = COALESCE(zip, '77002'),
    country = COALESCE(country, 'United States'),
    tax_id = COALESCE(tax_id, '12-3456789'),
    industry = COALESCE(industry, 'Oil & Gas Exploration'),
    description = COALESCE(description, 'Independent oil and gas operator focused on sustainable energy production and efficient resource management.'),
    operator_id = COALESCE(operator_id, 'TX-12345'),
    rrc_number = COALESCE(rrc_number, '123456'),
    federal_id = COALESCE(federal_id, 'FED-789012'),
    insurance_provider = COALESCE(insurance_provider, 'Energy Insurance Corp'),
    emergency_contact = COALESCE(emergency_contact, '+1 (555) 987-6543')
WHERE 
    phone IS NULL OR 
    website IS NULL OR 
    address IS NULL OR 
    city IS NULL OR 
    state IS NULL OR 
    zip IS NULL OR 
    country IS NULL OR 
    tax_id IS NULL OR 
    industry IS NULL OR 
    description IS NULL OR 
    operator_id IS NULL OR 
    rrc_number IS NULL OR 
    federal_id IS NULL OR 
    insurance_provider IS NULL OR 
    emergency_contact IS NULL;
