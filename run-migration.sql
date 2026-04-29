-- Run this in your Supabase SQL Editor or database console

-- Migration: Add documents and downloads_enabled to menu_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'menu_items' AND column_name = 'documents') THEN
    ALTER TABLE menu_items ADD COLUMN documents TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added documents column to menu_items';
  ELSE
    RAISE NOTICE 'documents column already exists';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'menu_items' AND column_name = 'downloads_enabled') THEN
    ALTER TABLE menu_items ADD COLUMN downloads_enabled BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added downloads_enabled column to menu_items';
  ELSE
    RAISE NOTICE 'downloads_enabled column already exists';
  END IF;
END $$;

-- Check the current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position;