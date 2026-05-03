-- Auto-Admin Trigger (AFTER INSERT version)
-- Automatically grants 'admin' role to a specific email on first registration
-- This fires AFTER INSERT so it works regardless of how the profile is created
-- Replace 'your-admin-email@example.com' with the actual admin email before running

-- Step 1: Create the function (case-insensitive comparison)
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Case-insensitive email check
  -- Replace with your actual admin email (lowercase)
  IF LOWER(NEW.email) = LOWER('your-admin-email@example.com') THEN
    UPDATE public.profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Recreate the trigger as AFTER INSERT
DROP TRIGGER IF EXISTS auto_admin_on_signup ON public.profiles;

CREATE TRIGGER auto_admin_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin();

-- Step 3: Also update any existing user with the admin email
-- Uncomment and run after deploying if needed:
-- UPDATE profiles SET role = 'admin' WHERE LOWER(email) = LOWER('your-admin-email@example.com');

-- Step 4: Verify the trigger
SELECT tgname, tgrelid::regclass AS table_name, tgenabled 
FROM pg_trigger 
WHERE tgname = 'auto_admin_on_signup';
