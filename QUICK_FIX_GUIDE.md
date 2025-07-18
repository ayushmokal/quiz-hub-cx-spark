# Quick Fix Guide - RLS Policy Error & Category Management

## 🚨 Immediate Fix Required

You're seeing an RLS (Row Level Security) policy error because the topics table doesn't have the correct permissions for admins/coaches to create topics.

## Step 1: Fix Database Permissions (CRITICAL)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/zlzqwkatbijbekpllyfg
2. **Click SQL Editor** in the left sidebar
3. **Create New Query** and paste this script:

```sql
-- Fix RLS policies for topics table to allow admins and coaches to create/edit topics

-- First, let's check and fix the topics table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to view topics" ON topics;
DROP POLICY IF EXISTS "Allow coaches and admins to manage topics" ON topics;

-- Allow all users to view active topics
CREATE POLICY "Allow all users to view topics" ON topics
FOR SELECT USING (true);

-- Allow coaches and admins to create topics
CREATE POLICY "Allow coaches and admins to create topics" ON topics
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
);

-- Allow coaches and admins to update topics
CREATE POLICY "Allow coaches and admins to update topics" ON topics
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
);

-- Allow coaches and admins to delete topics
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

-- Insert default categories
INSERT INTO categories (name, display_name, description, icon, color, is_active) VALUES
('sensor', 'Sensor Issues', 'Problems related to device sensors and data collection', '📊', '#3B82F6', true),
('ring', 'Ring Hardware', 'Ring device functionality, pairing, and hardware issues', '💍', '#8B5CF6', true),
('payment', 'Payment & Billing', 'Subscription, billing, and payment related queries', '💳', '#10B981', true),
('logistics', 'Shipping & Logistics', 'Order fulfillment, shipping, and delivery issues', '📦', '#F59E0B', true),
('account', 'Account Management', 'User accounts, profiles, and app functionality', '👤', '#EF4444', true)
ON CONFLICT (name) DO NOTHING;

-- Add audit logging for categories
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
```

4. **Click Run** to execute the script
5. **Verify Success**: You should see "Success. No rows returned" or similar

## Step 2: Test the Fix

1. **Refresh your browser** where the quiz app is open
2. **Try creating a topic again** - the error should be gone
3. **Check new navigation**: You should now see a "Categories" option in the left menu

## 🎉 New Features Added

✅ **Fixed RLS Policy Error** - Admins and coaches can now create/edit topics
✅ **Dynamic Category Management** - Create custom categories with icons and colors
✅ **Category Management Interface** - Full CRUD operations for categories
✅ **Enhanced Topic Forms** - Categories now load dynamically from database
✅ **Audit Logging** - All category changes are tracked

## 🎯 How to Use New Category Management

1. **Access Categories**: Click "Categories" in the left navigation
2. **Create Category**: Click "Create Category" button
3. **Fill Form**:
   - **Category Name**: Display name (e.g., "Software Issues")
   - **System Name**: Auto-generated URL-friendly name
   - **Description**: What this category covers
   - **Icon**: Choose from available emoji icons
   - **Color**: Pick a color for visual identification
   - **Status**: Active/Inactive toggle

4. **Edit/Delete**: Use the edit (pencil) or delete (trash) icons on each category card

## 🔄 Updated Topic Management

- **Topic forms now use dynamic categories** from the database
- **Icons and colors** are displayed in category selection
- **No more hardcoded category options**

## ⚠️ Important Notes

- **Categories are shared** across all topics
- **Deleting a category** may affect existing topics using it
- **All changes are audited** and visible in the Audit Log
- **Only admins and coaches** can manage categories

---

**✅ Problem Solved**: Your topic creation should now work perfectly with dynamic category management! 