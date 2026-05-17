-- Fix RLS policies for admin operations on client-side static build
-- Run this in Supabase SQL Editor

-- ============================================
-- APARTMENTS TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read apartments
DROP POLICY IF EXISTS "Anyone can read apartments" ON apartments;
CREATE POLICY "Anyone can read apartments"
ON apartments FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert apartments
DROP POLICY IF EXISTS "Authenticated users can insert apartments" ON apartments;
CREATE POLICY "Authenticated users can insert apartments"
ON apartments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update apartments
DROP POLICY IF EXISTS "Authenticated users can update apartments" ON apartments;
CREATE POLICY "Authenticated users can update apartments"
ON apartments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete apartments
DROP POLICY IF EXISTS "Authenticated users can delete apartments" ON apartments;
CREATE POLICY "Authenticated users can delete apartments"
ON apartments FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- PROFILES TABLE (for user management)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- MENU_ITEMS TABLE
-- ============================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read menu items
DROP POLICY IF EXISTS "Anyone can read menu_items" ON menu_items;
CREATE POLICY "Anyone can read menu_items"
ON menu_items FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage menu items
DROP POLICY IF EXISTS "Authenticated users can insert menu_items" ON menu_items;
CREATE POLICY "Authenticated users can insert menu_items"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update menu_items" ON menu_items;
CREATE POLICY "Authenticated users can update menu_items"
ON menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete menu_items" ON menu_items;
CREATE POLICY "Authenticated users can delete menu_items"
ON menu_items FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- CONTENT_SECTIONS TABLE
-- ============================================

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published content
DROP POLICY IF EXISTS "Anyone can read published content" ON content_sections;
CREATE POLICY "Anyone can read published content"
ON content_sections FOR SELECT
TO public
USING (status = 'published' OR true);

-- Allow authenticated users to manage content
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content_sections;
CREATE POLICY "Authenticated users can insert content"
ON content_sections FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update content" ON content_sections;
CREATE POLICY "Authenticated users can update content"
ON content_sections FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete content" ON content_sections;
CREATE POLICY "Authenticated users can delete content"
ON content_sections FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- CONTENT_REVISIONS TABLE
-- ============================================

ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage revisions
DROP POLICY IF EXISTS "Anyone can read content revisions" ON content_revisions;
CREATE POLICY "Anyone can read content revisions"
ON content_revisions FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert revisions" ON content_revisions;
CREATE POLICY "Authenticated users can insert revisions"
ON content_revisions FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- SETTINGS TABLE
-- ============================================

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
CREATE POLICY "Anyone can read settings"
ON settings FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update settings
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON settings;
CREATE POLICY "Authenticated users can insert settings"
ON settings FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update settings" ON settings;
CREATE POLICY "Authenticated users can update settings"
ON settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- BOOKINGS TABLE (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read bookings" ON bookings;
    CREATE POLICY "Anyone can read bookings"
    ON bookings FOR SELECT
    TO public
    USING (true);

    DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
    CREATE POLICY "Anyone can insert bookings"
    ON bookings FOR INSERT
    TO public
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
    CREATE POLICY "Authenticated users can update bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;
    CREATE POLICY "Authenticated users can delete bookings"
    ON bookings FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- ============================================
-- GALLERY TABLE (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gallery') THEN
    ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can read gallery" ON gallery;
    CREATE POLICY "Anyone can read gallery"
    ON gallery FOR SELECT
    TO public
    USING (true);

    DROP POLICY IF EXISTS "Authenticated users can insert gallery" ON gallery;
    CREATE POLICY "Authenticated users can insert gallery"
    ON gallery FOR INSERT
    TO authenticated
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Authenticated users can update gallery" ON gallery;
    CREATE POLICY "Authenticated users can update gallery"
    ON gallery FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Authenticated users can delete gallery" ON gallery;
    CREATE POLICY "Authenticated users can delete gallery"
    ON gallery FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;
