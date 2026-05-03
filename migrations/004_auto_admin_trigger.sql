-- Auto-Admin Trigger
-- Automatically grants 'admin' role to a specific email on first registration
-- Replace 'your-admin-email@example.com' with the actual admin email before running

-- Step 1: Create the function
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user's email matches the designated admin email
  -- Update this email to your actual admin email before deploying
  IF NEW.email = 'admin@veniceparsley.com.com' THEN
    NEW.role := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on profiles table (fires BEFORE INSERT)
-- This ensures the role is set to 'admin' before the profile is saved
DROP TRIGGER IF EXISTS auto_admin_on_signup ON public.profiles;

CREATE TRIGGER auto_admin_on_signup
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin();

-- Step 3: Verify the trigger was created
SELECT tgname, tgrelid::regclass AS table_name, tgenabled 
FROM pg_trigger 
WHERE tgname = 'auto_admin_on_signup';
