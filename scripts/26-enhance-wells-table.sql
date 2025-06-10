-- Add additional columns to wells table for enhanced functionality
ALTER TABLE wells 
ADD COLUMN IF NOT EXISTS daily_production DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_revenue DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_production_date DATE,
ADD COLUMN IF NOT EXISTS operator_notes TEXT,
ADD COLUMN IF NOT EXISTS regulatory_status VARCHAR(50) DEFAULT 'compliant',
ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS next_inspection_date DATE,
ADD COLUMN IF NOT EXISTS environmental_rating VARCHAR(20) DEFAULT 'good';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wells_company_status ON wells(company_id, status);
CREATE INDEX IF NOT EXISTS idx_wells_production_date ON wells(last_production_date);
CREATE INDEX IF NOT EXISTS idx_wells_daily_production ON wells(daily_production);

-- Update existing wells with sample production data
UPDATE wells 
SET 
  daily_production = (RANDOM() * 80 + 20)::DECIMAL(10,2),
  monthly_revenue = (RANDOM() * 40000 + 15000)::DECIMAL(12,2),
  last_production_date = CURRENT_DATE - (RANDOM() * 30)::INTEGER,
  regulatory_status = CASE 
    WHEN RANDOM() > 0.9 THEN 'pending'
    WHEN RANDOM() > 0.95 THEN 'violation'
    ELSE 'compliant'
  END,
  next_inspection_date = CURRENT_DATE + (RANDOM() * 90 + 30)::INTEGER
WHERE daily_production IS NULL OR daily_production = 0;

-- Create a view for well analytics
CREATE OR REPLACE VIEW well_analytics AS
SELECT 
  w.*,
  CASE 
    WHEN w.daily_production > 60 THEN 'high'
    WHEN w.daily_production > 30 THEN 'medium'
    ELSE 'low'
  END as production_tier,
  CASE 
    WHEN w.monthly_revenue > 30000 THEN 'high'
    WHEN w.monthly_revenue > 15000 THEN 'medium'
    ELSE 'low'
  END as revenue_tier,
  EXTRACT(DAYS FROM (CURRENT_DATE - w.last_production_date)) as days_since_production
FROM wells w;

-- Add RLS policy for the new view
ALTER VIEW well_analytics OWNER TO postgres;

-- Grant access to authenticated users
GRANT SELECT ON well_analytics TO authenticated;

-- Create RLS policy for well_analytics view
CREATE POLICY "Users can view their company's well analytics" ON wells
FOR SELECT USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);
