-- Add priority and category columns to notices table
-- This enhances the notices system with better categorization and priority management

-- Add priority column with enum constraint
ALTER TABLE public.notices 
ADD COLUMN priority text DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add category column with enum constraint  
ALTER TABLE public.notices 
ADD COLUMN category text DEFAULT 'general'
CHECK (category IN ('general', 'urgent', 'donation_drive', 'maintenance', 'emergency'));

-- Update existing notices to have default values
UPDATE public.notices 
SET priority = 'medium', category = 'general' 
WHERE priority IS NULL OR category IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.notices.priority IS 'Priority level of the notice (low, medium, high, urgent)';
COMMENT ON COLUMN public.notices.category IS 'Category of the notice (general, urgent, donation_drive, maintenance, emergency)';

-- Create index for better query performance on priority and category
CREATE INDEX idx_notices_priority ON public.notices(priority);
CREATE INDEX idx_notices_category ON public.notices(category);
CREATE INDEX idx_notices_active_priority ON public.notices(active, priority) WHERE active = true;