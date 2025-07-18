-- Simple fix - just fix the core RLS policies for topics

-- Drop ALL existing policies on topics table first
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'topics'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON topics';
    END LOOP;
END $$;

-- Create simple working policies for topics
CREATE POLICY "Allow all users to view topics" ON topics
FOR SELECT USING (true);

CREATE POLICY "Allow coaches and admins to create topics" ON topics
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
);

CREATE POLICY "Allow coaches and admins to update topics" ON topics
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
);

CREATE POLICY "Allow coaches and admins to delete topics" ON topics
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
); 