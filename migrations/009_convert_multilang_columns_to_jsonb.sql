-- Migration to convert multilang columns from text to jsonb
-- This handles existing plain text data by wrapping it in {en: value, it: value}

-- Step 1: First, convert existing text data to jsonb format
-- For each row, wrap the existing text value in a jsonb object
UPDATE apartments SET 
  name = jsonb_build_object('en', COALESCE(name::text, ''), 'it', COALESCE(name::text, '')),
  description = jsonb_build_object('en', COALESCE(description::text, ''), 'it', COALESCE(description::text, '')),
  short_description = jsonb_build_object('en', COALESCE(short_description::text, ''), 'it', COALESCE(short_description::text, ''));

-- Step 2: Now alter the column types to jsonb
ALTER TABLE apartments 
  ALTER COLUMN name TYPE jsonb USING name::jsonb,
  ALTER COLUMN description TYPE jsonb USING description::jsonb,
  ALTER COLUMN short_description TYPE jsonb USING short_description::jsonb;

-- Step 3: Set default values for jsonb columns
ALTER TABLE apartments 
  ALTER COLUMN name SET DEFAULT '{"en": "", "it": ""}'::jsonb,
  ALTER COLUMN description SET DEFAULT '{"en": "", "it": ""}'::jsonb,
  ALTER COLUMN short_description SET DEFAULT '{"en": "", "it": ""}'::jsonb;
