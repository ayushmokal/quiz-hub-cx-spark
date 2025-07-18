-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('agent', 'coach', 'admin');
CREATE TYPE question_type AS ENUM ('multiple-choice', 'multi-select', 'case-study');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE topic_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE category_type AS ENUM ('sensor', 'ring', 'payment', 'logistics', 'account');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    avatar TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category category_type NOT NULL,
    status topic_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answers INTEGER[] NOT NULL,
    explanation TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'beginner',
    time_limit INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    questions JSONB NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    avg_time DECIMAL(8,2) NOT NULL,
    streak INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table (for dashboard and leaderboard)
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER NOT NULL DEFAULT 0,
    overall_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
    avg_response_time DECIMAL(8,2) NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    weekly_quizzes INTEGER NOT NULL DEFAULT 0,
    best_category category_type,
    last_quiz_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_topic_id ON quiz_attempts(topic_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_total_points ON user_stats(total_points DESC);

-- Function to update user stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, total_points, overall_accuracy, avg_response_time, current_streak, weekly_quizzes, last_quiz_date)
    VALUES (NEW.user_id, NEW.score, NEW.accuracy, NEW.avg_time, NEW.streak, 1, NEW.completed_at)
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_stats.total_points + NEW.score,
        overall_accuracy = (
            SELECT AVG(accuracy) 
            FROM quiz_attempts 
            WHERE user_id = NEW.user_id
        ),
        avg_response_time = (
            SELECT AVG(avg_time) 
            FROM quiz_attempts 
            WHERE user_id = NEW.user_id
        ),
        current_streak = CASE 
            WHEN user_stats.last_quiz_date::date = (NEW.completed_at::date - INTERVAL '1 day')::date 
            THEN user_stats.current_streak + 1
            WHEN user_stats.last_quiz_date::date = NEW.completed_at::date 
            THEN user_stats.current_streak
            ELSE 1
        END,
        weekly_quizzes = CASE 
            WHEN DATE_TRUNC('week', user_stats.last_quiz_date) = DATE_TRUNC('week', NEW.completed_at)
            THEN user_stats.weekly_quizzes + 1
            ELSE 1
        END,
        last_quiz_date = NEW.completed_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats after quiz completion
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND role = 'admin'
    )
);

-- RLS Policies for topics table
CREATE POLICY "Anyone can view active topics" ON topics FOR SELECT USING (status = 'active');
CREATE POLICY "Coaches and admins can manage topics" ON topics FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND role IN ('coach', 'admin')
    )
);

-- RLS Policies for questions table
CREATE POLICY "Anyone can view questions for active topics" ON questions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM topics 
        WHERE topics.id = questions.topic_id AND topics.status = 'active'
    )
);
CREATE POLICY "Coaches and admins can manage questions" ON questions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND role IN ('coach', 'admin')
    )
);

-- RLS Policies for quiz_attempts table
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Coaches and admins can view all quiz attempts" ON quiz_attempts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text AND role IN ('coach', 'admin')
    )
);

-- RLS Policies for user_stats table
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "System can insert/update user stats" ON user_stats FOR ALL USING (true); 