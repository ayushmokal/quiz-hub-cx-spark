# CX Quiz Hub - Ultrahuman Customer Experience Training Platform

A comprehensive role-based learning and assessment platform built for Ultrahuman's Customer Experience team. Features real authentication, quiz engine, leaderboard, and admin management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or bun
- Supabase account

### Environment Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd quiz-hub-cx-spark
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://zlzqwkatbijbekpllyfg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenF3a2F0YmlqYmVrcGxseWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2MDMsImV4cCI6MjA2ODMzNjYwM30.Jo-sUVo-cfS7xKQU94zs6SWwsxwAFmV0xKTw05Cil1Q
```

4. **Set up the database**
Run the schema and seed files in your Supabase SQL editor:
```bash
# Copy contents of database/schema.sql to Supabase SQL Editor
# Copy contents of database/seed-data.sql to Supabase SQL Editor
```

5. **Run the development server**
```bash
npm run dev
# or
bun dev
```

Visit `http://localhost:5173` to see the application.

## 📊 Features

### ✅ Implemented
- **Authentication System**: Email/password + Google OAuth with Supabase
- **Role-based Access**: Agent, Coach, Admin roles with different permissions
- **Quiz Engine**: Real-time quiz interface with scoring and explanations
- **Dashboard**: Personalized KPIs and quick topic access
- **Leaderboard**: Real-time rankings and performance tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🚧 In Development
- Question Management (Coach/Admin)
- Topic Management (Coach/Admin)
- Analytics Dashboard
- User Management (Admin)
- Advanced Settings

## 🗂️ Project Structure

```
src/
├── components/
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard interface
│   ├── quiz/              # Quiz selection and engine
│   ├── leaderboard/       # Leaderboard interface
│   ├── layout/            # Header, navigation
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts (Auth)
├── services/              # API service layer
├── lib/                   # Utilities (Supabase client)
├── types/                 # TypeScript type definitions
└── data/                  # Mock data (legacy)
```

## 👥 User Roles & Access

### Agent (Default)
- Take quizzes
- View dashboard
- Access leaderboard

### Coach
- All Agent permissions
- Manage questions (planned)
- Manage topics (planned)
- View analytics (planned)

### Admin
- All Coach permissions
- Manage users (planned)
- System settings (planned)

## 🔧 Database Schema

The application uses PostgreSQL with Supabase:

### Core Tables
- `users` - User profiles and roles
- `topics` - Quiz topics with categories
- `questions` - Questions with multiple choice/multi-select support
- `quiz_attempts` - User quiz results and scoring
- `user_stats` - Aggregated user performance data

### Key Features
- Row Level Security (RLS) policies
- Automatic user stats calculation via triggers
- Real-time subscriptions for leaderboard updates

## 🎨 Design System

### Colors
- **Accent**: `hsl(211 100% 60%)`
- **Success**: `hsl(110 100% 53%)`
- **Warning**: `hsl(35 100% 50%)`
- **Destructive**: `hsl(0 100% 50%)`

### Category Colors
- **Sensor**: `hsl(259 100% 75%)`
- **Ring**: `hsl(217 100% 70%)`
- **Payment**: `hsl(110 100% 60%)`
- **Logistics**: `hsl(35 100% 55%)`
- **Account**: `hsl(270 100% 70%)`

### Custom Classes
- `.quiz-card` - Standard card styling
- `.quiz-button-primary` - Primary action buttons
- `.category-{type}` - Category-specific styling

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main**

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Build Command
```bash
npm run build
```

## 📈 Performance & Scaling

### Current Capacity
- **69 users** (based on provided email list)
- **Supabase Free Tier**: 500MB DB, 50K MAUs
- **Vercel Free Tier**: 100GB bandwidth/month

### Monitoring
- Real-time error tracking recommended (Sentry)
- Performance monitoring via Vercel Analytics
- Database monitoring via Supabase Dashboard

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication via Supabase
- Email whitelist validation
- Role-based UI and API access control

## 🧪 Testing

### Demo Credentials
- **Admin**: `admin@ultrahuman.com`
- **Coach**: `simran.rajput@ultrahuman.com`
- **Agent**: `priya.sharma@ultrahuman.com`
- **Password**: `password123` (universal for demo)

## 📝 API Documentation

### Authentication
```typescript
// Sign in
await authAPI.signIn(email, password)

// Sign out
await authAPI.signOut()

// Get current user
await authAPI.getCurrentUser()
```

### Quiz Operations
```typescript
// Get questions for topic
await questionsAPI.getQuestionsByTopic(topicId)

// Submit quiz attempt
await quizAPI.submitQuizAttempt(attempt)
```

### Leaderboard
```typescript
// Get leaderboard data
await leaderboardAPI.getLeaderboard()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Private - Ultrahuman Internal Use Only

---

Built with ❤️ by the Ultrahuman Engineering Team
