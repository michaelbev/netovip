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
WHERE c.name = 'Netovip Oil & Gas'
LIMIT 1;

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Equipment Rental',
    8200.00,
    'Equipment',
    '2024-01-14',
    'pending'
FROM companies c
WHERE c.name = 'Netovip Oil & Gas';

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Transportation Costs',
    3850.00,
    'Transportation',
    '2024-01-13',
    'paid'
FROM companies c
WHERE c.name = 'Netovip Oil & Gas';

INSERT INTO expenses (company_id, description, amount, category, expense_date, status) 
SELECT 
    c.id as company_id,
    'Regulatory Fees',
    2100.00,
    'Regulatory',
    '2024-01-12',
    'paid'
FROM companies c
WHERE c.name = 'Netovip Oil & Gas';

-- Insert sample maintenance records
INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Routine Inspection',
    'Monthly safety and performance inspection',
    'medium',
    'scheduled',
    '2024-01-20'
FROM companies c
CROSS JOIN wells w
WHERE c.name = 'Netovip Oil & Gas'
AND w.name LIKE '%Eagle Ford%'
LIMIT 1;

INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Pump Replacement',
    'Replace main production pump',
    'high',
    'in_progress',
    '2024-01-18'
FROM companies c
CROSS JOIN wells w
WHERE c.name = 'Netovip Oil & Gas'
AND w.name LIKE '%Permian%'
LIMIT 1;

INSERT INTO maintenance_records (company_id, well_id, maintenance_type, description, priority, status, scheduled_date, completed_date, cost)
SELECT 
    c.id as company_id,
    w.id as well_id,
    'Valve Maintenance',
    'Routine valve inspection and maintenance',
    'low',
    'completed',
    '2024-01-15',
    '2024-01-15',
    2500.00
FROM companies c
CROSS JOIN wells w
WHERE c.name = 'Netovip Oil & Gas'
AND w.name LIKE '%Bakken%'
LIMIT 1;

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
WHERE c.name = 'Netovip Oil & Gas';

INSERT INTO distributions (company_id, period_start, period_end, total_amount, status, distribution_date)
SELECT 
    c.id as company_id,
    '2023-11-01',
    '2023-11-30',
    118500.00,
    'completed',
    '2023-12-15'
FROM companies c
WHERE c.name = 'Netovip Oil & Gas';

INSERT INTO distributions (company_id, period_start, period_end, total_amount, status)
SELECT 
    c.id as company_id,
    '2024-01-01',
    '2024-01-31',
    145000.00,
    'pending'
FROM companies c
WHERE c.name = 'Netovip Oil & Gas';

-- Insert sample distribution details
INSERT INTO distribution_details (distribution_id, owner_id, amount, percentage, status)
SELECT 
    d.id as distribution_id,
    o.id as owner_id,
    d.total_amount * (o.ownership_percentage / 100.0),
    o.ownership_percentage,
    'completed'
FROM distributions d
CROSS JOIN owners o
WHERE d.status = 'completed'
AND o.company_id = d.company_id;
