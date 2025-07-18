-- Fix infinite recursion in RLS policies
-- The issue is that the admin policy tries to query the users table from within a users table policy

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create simpler, non-recursive policies for users table
-- Allow all authenticated users to view all profiles (needed for the app to work)
CREATE POLICY "Authenticated users can view all profiles" ON users 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow users to update their own profile (match by auth.uid())
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Allow any authenticated user to insert (for new user creation)
CREATE POLICY "Allow user creation" ON users 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Note: We'll handle admin permissions at the application level rather than in RLS
-- This avoids the infinite recursion issue while keeping the app functional 