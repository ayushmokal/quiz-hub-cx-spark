-- Safe fix script that handles existing policies

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

-- Create new working policies for topics
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

-- Create categories table for dynamic category management
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing category policies first
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'categories'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON categories';
    END LOOP;
END $$;

-- RLS policies for categories
CREATE POLICY "Allow all users to view active categories" ON categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow coaches and admins to manage categories" ON categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
);

-- Insert default categories (ignore if already exist)
INSERT INTO categories (name, display_name, description, icon, color, is_active) VALUES
('sensor', 'Sensor Issues', 'Problems related to device sensors and data collection', '📊', '#3B82F6', true),
('ring', 'Ring Hardware', 'Ring device functionality, pairing, and hardware issues', '💍', '#8B5CF6', true),
('payment', 'Payment & Billing', 'Subscription, billing, and payment related queries', '💳', '#10B981', true),
('logistics', 'Shipping & Logistics', 'Order fulfillment, shipping, and delivery issues', '📦', '#F59E0B', true),
('account', 'Account Management', 'User accounts, profiles, and app functionality', '👤', '#EF4444', true)
ON CONFLICT (name) DO NOTHING;

-- Create audit function if not exists
CREATE OR REPLACE FUNCTION log_category_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (
            'categories',
            NEW.id,
            'CREATE',
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (
            'categories',
            NEW.id,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (
            'categories',
            OLD.id,
            'DELETE',
            row_to_json(OLD),
            auth.uid()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for category audit logging
DROP TRIGGER IF EXISTS categories_audit_trigger ON categories;
CREATE TRIGGER categories_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON categories
    FOR EACH ROW EXECUTE FUNCTION log_category_changes(); 