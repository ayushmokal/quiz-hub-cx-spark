-- Function to handle user profile creation
-- This will be called when a user exists in auth.users but not in public.users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, department, avatar, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 
             INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))),
    CASE 
      WHEN NEW.email = 'admin@ultrahuman.com' OR NEW.email = 'adi@ultrahuman.com' THEN 'admin'
      WHEN NEW.email IN ('jaideep@ultrahuman.com', 'munish@ultrahuman.com') THEN 'coach'
      ELSE 'agent'
    END,
    'Customer Support',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If insert fails (user already exists), just continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also handle existing users who might not have profiles yet
INSERT INTO public.users (id, email, name, role, department, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 
           INITCAP(REPLACE(SPLIT_PART(au.email, '@', 1), '.', ' '))),
  CASE 
    WHEN au.email = 'admin@ultrahuman.com' OR au.email = 'adi@ultrahuman.com' THEN 'admin'
    WHEN au.email IN ('jaideep@ultrahuman.com', 'munish@ultrahuman.com') THEN 'coach'
    ELSE 'agent'
  END,
  'Customer Support',
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING; 