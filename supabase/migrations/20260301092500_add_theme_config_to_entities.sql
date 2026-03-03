-- Add theme_config column to the entities table
ALTER TABLE entities ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;
