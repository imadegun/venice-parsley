-- Create a function to handle profile creation that bypasses RLS
CREATE OR REPLACE FUNCTION create_user_profile(user_id UUID, user_email TEXT, user_full_name TEXT, user_role TEXT DEFAULT 'guest')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (user_id, user_email, user_full_name, user_role::user_role)
  ON CONFLICT (id) DO NOTHING;
END;
$$;