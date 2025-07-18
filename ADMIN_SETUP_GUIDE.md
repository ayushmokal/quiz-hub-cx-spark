# Admin & Coach Management Features Setup Guide

## Overview

This guide walks you through setting up the complete topic and question management system with audit logging for the CX Quiz Hub platform.

## 🚀 Features Implemented

✅ **Topic Management**
- Create new quiz topics
- Edit existing topics (name, description, category, status)
- Delete topics (with confirmation)
- Role-based access (admins and coaches only)

✅ **Question Management**
- Add questions to topics
- Support for multiple question types (multiple-choice, multi-select, case-study)
- Edit existing questions
- Delete questions (with confirmation)
- Rich form validation and UX

✅ **Audit Logging**
- Complete change history for all topic and question modifications
- User attribution for every change
- Detailed before/after value tracking
- Filterable audit log viewer

✅ **Role-Based Access Control**
- Only admins and coaches can manage content
- Agents have read-only access to quizzes
- Proper permission checks throughout the UI

## 📋 Setup Instructions

### Step 1: Run Audit Logging SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zlzqwkatbijbekpllyfg
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL script:

```sql
-- Add audit logging for topic and question management

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add indexes for performance
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);

-- Function to log topic changes
CREATE OR REPLACE FUNCTION log_topic_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (
            'topics',
            NEW.id,
            'CREATE',
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (
            'topics',
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
            'topics',
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

-- Function to log question changes
CREATE OR REPLACE FUNCTION log_question_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (
            'questions',
            NEW.id,
            'CREATE',
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (
            'questions',
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
            'questions',
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

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS topics_audit_trigger ON topics;
CREATE TRIGGER topics_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON topics
    FOR EACH ROW EXECUTE FUNCTION log_topic_changes();

DROP TRIGGER IF EXISTS questions_audit_trigger ON questions;
CREATE TRIGGER questions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON questions
    FOR EACH ROW EXECUTE FUNCTION log_question_changes();

-- RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow coaches and admins to view audit logs
CREATE POLICY "Coaches and admins can view audit logs" ON audit_logs 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND role IN ('coach', 'admin')
    )
);

-- Only system can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs" ON audit_logs 
FOR INSERT WITH CHECK (true);
```

5. Click **Run** to execute the script
6. Verify success by checking that the `audit_logs` table was created

### Step 2: Test Admin Features

1. **Login as Admin/Coach**
   - Use `admin@ultrahuman.com` or `jaideep@ultrahuman.com` 
   - Password: `password123`

2. **Navigate to Topic Management**
   - Click "Topics" in the left navigation
   - You should see the topic management interface

3. **Create a Test Topic**
   - Click "Create Topic"
   - Fill in the form:
     - **Topic Name**: "Test Topic"
     - **Description**: "This is a test topic"
     - **Category**: Select any category
     - **Status**: "Draft"
   - Click "Create Topic"

4. **Add Questions to Topic**
   - Click "Questions" in the left navigation
   - Select your test topic
   - Click "Add Question"
   - Create a sample multiple-choice question

5. **View Audit Log**
   - Click "Audit Log" in the left navigation
   - You should see records of your topic and question creation

## 🎯 User Interface Guide

### Topic Management

- **Create Topics**: Use the "Create Topic" button in the top right
- **Edit Topics**: Click the edit button (pencil icon) on any topic card
- **Delete Topics**: Click the delete button (trash icon) - requires confirmation
- **Topic Status**: 
  - `Draft` - Topic is being worked on
  - `Active` - Topic is available for quizzes
  - `Inactive` - Topic is disabled but preserved

### Question Management

- **Navigate**: Start by selecting a topic, then manage its questions
- **Question Types**:
  - `Multiple Choice` - Single correct answer
  - `Multi-Select` - Multiple correct answers
  - `Case Study` - Scenario-based questions
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Time Limits**: 10-300 seconds per question

### Audit Log

- **Filter by Table**: View all changes or filter by topics/questions only
- **User Attribution**: See who made each change and when
- **Detailed Changes**: Expand any log entry to see exact before/after values
- **Real-time Updates**: Click "Refresh" to see the latest changes

## 🔒 Security Features

- **Role-Based Access**: Only admins and coaches can access management features
- **Audit Trail**: Every change is logged with user attribution
- **Data Validation**: Form validation prevents invalid data entry
- **Confirmation Dialogs**: Destructive actions require confirmation

## 📝 Admin User Roles

| Role | Dashboard | Quizzes | Leaderboard | Topics | Questions | Audit Log | Users | Settings |
|------|-----------|---------|-------------|--------|-----------|-----------|-------|----------|
| **Agent** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Coach** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🚨 Important Notes

1. **Data Integrity**: Deleting a topic will also delete all its questions and quiz attempts
2. **Audit Persistence**: Audit logs are permanent and cannot be deleted by users
3. **Performance**: Audit logging adds minimal overhead but tracks comprehensive changes
4. **User Management**: Only admins can manage user roles and settings

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your user role has the required permissions
3. Ensure the audit logging SQL script was executed successfully
4. Contact technical support with specific error details

---

**✅ System Ready**: Your CX Quiz Hub now has complete topic and question management with full audit logging! 