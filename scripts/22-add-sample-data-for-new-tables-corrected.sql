-- Insert sample expenses data
INSERT INTO expenses (company_id, well_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Well Maintenance - ' || w.name,
    15420.00,
    'Maintenance',
    '2024-01-15',
    'paid'
FROM companies c
CROSS JOIN wells w
WHERE c.name = 'Netovip Energy LLC'
AND w.company_id = c.id
LIMIT 1;

INSERT INTO expenses (company_id, well_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Equipment Rental - ' || w.name,
    8200.00,
    'Equipment',
    '2024-01-14',
    'pending'
FROM companies c
CROSS JOIN wells w
WHERE c.name = 'Netovip Energy LLC'
AND w.company_id = c.id
LIMIT 1;

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Transportation Costs',
    3850.00,
    'Transportation',
    '2024-01-13',
    'paid'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Regulatory Fees',
    2100.00,
    'Regulatory',
    '2024-01-12',
    'paid'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Office Supplies',
    450.00,
    'Administrative',
    '2024-01-11',
    'paid'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

-- Insert sample maintenance records
INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Routine Inspection',
    'Monthly safety and performance inspection for ' || w.name,
    'medium',
    'scheduled',
    '2024-01-20'
FROM companies c
JOIN wells w ON w.company_id = c.id
WHERE c.name = 'Netovip Energy LLC'
AND w.name = 'Eagle Ford #23';

INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Pump Replacement',
    'Replace main production pump for ' || w.name,
    'high',
    'in_progress',
    '2024-01-18'
FROM companies c
JOIN wells w ON w.company_id = c.id
WHERE c.name = 'Netovip Energy LLC'
AND w.name = 'Permian #18';

INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date, completed_date, cost)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Valve Maintenance',
    'Routine valve inspection and maintenance for ' || w.name,
    'low',
    'completed',
    '2024-01-15',
    '2024-01-15',
    2500.00
FROM companies c
JOIN wells w ON w.company_id = c.id
WHERE c.name = 'Netovip Energy LLC'
AND w.name = 'Bakken #31';

INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date, completed_date, cost)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Safety Check',
    'Quarterly safety inspection for ' || w.name,
    'high',
    'completed',
    '2024-01-10',
    '2024-01-10',
    1200.00
FROM companies c
JOIN wells w ON w.company_id = c.id
WHERE c.name = 'Netovip Energy LLC'
AND w.name = 'Eagle Ford #23';

-- Insert sample distributions
INSERT INTO distributions (company_id, period_start, period_end, total_amount, status, distribution_date)
SELECT 
    c.id as company_id,
    '2023-12-01',
    '2023-12-31',
    125000.00,
    'completed',
    '2024-01-15'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

INSERT INTO distributions (company_id, period_start, period_end, total_amount, status, distribution_date)
SELECT 
    c.id as company_id,
    '2023-11-01',
    '2023-11-30',
    118500.00,
    'completed',
    '2023-12-15'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

INSERT INTO distributions (company_id, period_start, period_end, total_amount, status)
SELECT 
    c.id as company_id,
    '2024-01-01',
    '2024-01-31',
    145000.00,
    'pending'
FROM companies c
WHERE c.name = 'Netovip Energy LLC';

-- Insert sample distribution details
-- Using well_ownership table to get ownership percentages
INSERT INTO distribution_details (distribution_id, owner_id, amount, percentage, status)
SELECT 
    d.id as distribution_id,
    wo.owner_id,
    (d.total_amount * wo.ownership_percentage)::numeric AS amount,
    CASE 
        WHEN wo.ownership_percentage <= 1 THEN (wo.ownership_percentage * 100)::numeric
        ELSE NULL  -- Handle cases where ownership_percentage exceeds 1
    END as percentage,
    CASE 
        WHEN d.status = 'completed' THEN 'paid'
        ELSE 'pending'
    END as status
FROM distributions d
JOIN companies c ON d.company_id = c.id
JOIN wells w ON w.company_id = c.id
JOIN well_ownership wo ON wo.well_id = w.id
WHERE c.name = 'Netovip Energy LLC'
GROUP BY d.id, wo.owner_id, d.total_amount, wo.ownership_percentage, d.status;
