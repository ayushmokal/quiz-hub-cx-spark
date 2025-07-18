-- Alternative approach: Use Supabase Admin API to create users
-- This is a reference script showing how to create auth users via API

-- For immediate testing, you can use this SQL to create a demo user:
-- This should be run in your Supabase SQL Editor

-- First, let's create a function to easily add demo users
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email TEXT,
  user_password TEXT DEFAULT 'password123'
)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Use Supabase's built-in function to create auth user
  -- Note: This requires RLS to be configured properly
  
  -- For now, return instruction for manual creation
  RETURN 'Please create this user manually via Supabase Dashboard Auth section: ' || user_email;
END;
$$ LANGUAGE plpgsql;

-- Instructions for manual user creation:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add User" 
-- 4. Create users with these emails and password 'password123':
--    - admin@ultrahuman.com
--    - jaideep@ultrahuman.com  
--    - priya.sharma@ultrahuman.com
--    - ayush.mokal@ultrahuman.com (for Google OAuth testing)

-- Alternative: Use the Supabase Admin API from your app
-- This can be done in a setup script or admin panel 