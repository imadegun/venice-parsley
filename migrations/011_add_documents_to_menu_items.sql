-- Migration: Add documents and downloads_enabled to menu_items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'menu_items' AND column_name = 'documents') THEN
    ALTER TABLE menu_items ADD COLUMN documents TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'menu_items' AND column_name = 'downloads_enabled') THEN
    ALTER TABLE menu_items ADD COLUMN downloads_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;