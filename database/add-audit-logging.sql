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