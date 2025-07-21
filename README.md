# Quiz Hub CX Spark - Ultrahuman Customer Experience Training Platform

A comprehensive role-based learning and assessment platform built for Ultrahuman's Customer Experience team. Features Firebase authentication, advanced quiz engine, real-time leaderboards, admin management, and bulk CSV import capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or bun
- Firebase project with Firestore

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/ayushmokal/quiz-hub-cx-spark.git
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
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Set up Firebase**
- Create a Firebase project
- Enable Firestore Database
- Enable Authentication (Email/Password + Google)
- Deploy Firestore rules from `firestore.rules`
- Set up Firestore indexes from `firestore.indexes.json`

5. **Run the development server**
```bash
npm run dev
# or
bun dev
```

Visit `http://localhost:5173` to see the application.

## ✨ Features

### 🔐 Authentication & Authorization
- **Firebase Authentication** with email/password and Google OAuth
- **Role-based access control** (Agent, Coach, Admin)
- **Email whitelist validation** for secure access
- **Persistent sessions** with automatic token refresh

### 📚 Quiz Engine
- **Dynamic quiz generation** from question pools
- **Multiple choice questions** with immediate feedback
- **Difficulty levels** (Easy, Medium, Hard)
- **Detailed explanations** for learning reinforcement
- **Progress tracking** and attempt history
- **Real-time scoring** with performance analytics
- **Comprehensive results review** with incorrect answer analysis
- **PDF export** for offline study and record keeping

### 📊 Analytics & Reporting
- **Personal dashboards** with KPI tracking
- **Performance metrics** (accuracy, response time, streaks)
- **Category-wise analytics** and topic mastery
- **Weekly and overall statistics**
- **Trend analysis** and improvement insights

### 🏆 Gamification
- **Real-time leaderboards** with live updates
- **Achievement badges** and milestone tracking
- **Competitive rankings** across teams
- **Streak counters** and consistency rewards
- **Point-based scoring** system

### 👑 Administrative Features
- **User management** with role assignment
- **Content management** (questions, topics, categories)
- **Bulk CSV import** for rapid content creation
- **System monitoring** and usage analytics
- **Audit logs** and user activity tracking

### 🎨 User Experience
- **Responsive design** optimized for all devices
- **Modern UI** with shadcn/ui components
- **Dark/light mode** support
- **Accessibility features** (WCAG compliant)
- **Progressive Web App** capabilities

## 🗂️ Project Structure

```
quiz-hub-cx-spark/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin management interfaces
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard and analytics
│   │   ├── quiz/           # Quiz engine and selection
│   │   ├── leaderboard/    # Rankings and competition
│   │   ├── layout/         # Navigation and layout
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── services/           # Firebase API services
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   ├── types/             # TypeScript definitions
│   └── data/              # Static data and constants
├── docs/                  # Comprehensive documentation
├── quiz-data/             # Sample CSV files and templates
├── functions/             # Firebase Cloud Functions
├── database/              # Firestore rules and indexes
└── public/                # Static assets
```

## 👥 User Roles & Permissions

### 🎯 Agent (Default Role)
- Take quizzes across all available topics
- View personal dashboard and performance metrics
- Access leaderboard and competitive rankings
- Track learning progress and achievements

### 🎓 Coach (Elevated Access)
- All Agent permissions
- Create and edit quiz questions
- Manage topics and categories
- View team analytics and performance reports
- Monitor agent progress and provide guidance

### ⚙️ Admin (Full Access)
- All Coach permissions
- **Bulk CSV Import**: Import hundreds of questions at once
- User management and role assignment
- System configuration and settings
- Platform monitoring and maintenance
- Advanced analytics and reporting

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for consistent, accessible components
- **React Router** for client-side routing
- **React Hook Form** for form validation

### Backend & Database
- **Firebase Firestore** for real-time NoSQL database
- **Firebase Authentication** for secure user management
- **Firebase Cloud Functions** for serverless backend logic
- **Firebase Hosting** for static site deployment
- **Real-time subscriptions** for live data updates

### Key Features
- **Firestore Security Rules** for data protection
- **Automatic data aggregation** via Cloud Functions
- **Real-time synchronization** across all clients
- **Offline support** with automatic sync
- **Scalable architecture** for growing user base

## 📚 Documentation

### Admin Guides
- **[CSV Import Guide](./docs/CSV_IMPORT_GUIDE.md)** - Complete guide for bulk importing quiz questions
- **[Admin Setup Guide](./ADMIN_SETUP_GUIDE.md)** - Administrator onboarding and configuration
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Firebase Setup Guide](./FIREBASE_SHEETS_INTEGRATION.md)** - Firebase and Google Sheets integration

### User Guides
- **[User Management Guide](./USER_MANAGEMENT_GUIDE.md)** - Managing users and roles
- **[Quick Test Guide](./QUICK_TEST_GUIDE.md)** - Platform functionality testing
- **[Setup Instructions](./SETUP_INSTRUCTIONS.md)** - Initial platform setup

### Developer Resources
- **[Google Sheets Setup](./GOOGLE_SHEETS_SETUP_COMPLETE.md)** - Automated content management
- **[Apps Script Integration](./GOOGLE_SHEETS_APPS_SCRIPT.md)** - Advanced automation scripts

## 🎯 CSV Import System

### Bulk Question Import
Import hundreds of quiz questions efficiently using CSV files:

```csv
question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,category,difficulty
"What is the weight of the smallest Ultrahuman Ring AIR?","1.5 grams","2.4 grams","3.2 grams","4.1 grams","2.4 grams","The Ultrahuman Ring AIR weighs between 2.4-3.6 grams, with the smallest size being 2.4 grams.","Ring Knowledge","ultrahuman-training","Easy"
```

### Key Features
- **Validation system** ensures data integrity
- **Preview functionality** before importing
- **Error handling** with detailed feedback
- **Progress tracking** for large imports
- **Automatic category/topic linking**

See the [CSV Import Guide](./docs/CSV_IMPORT_GUIDE.md) for complete instructions.

## 🧪 Testing & Quality Assurance

### Demo Credentials
```
Admin Access:
Email: admin@ultrahuman.com
Password: password123

Coach Access:
Email: coach@ultrahuman.com
Password: password123

Agent Access:
Email: agent@ultrahuman.com
Password: password123
```

### Testing Coverage
- Unit tests for core business logic
- Integration tests for API endpoints
- End-to-end testing for user workflows
- Performance testing for scalability
- Security testing for data protection

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login and initialize**
```bash
firebase login
firebase init hosting
```

3. **Build and deploy**
```bash
npm run build
firebase deploy
```

### Environment Variables for Production
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
# ... other Firebase config
```

### Performance Optimizations
- **Code splitting** for faster initial loads
- **Image optimization** and lazy loading
- **Firebase caching** for improved response times
- **CDN distribution** via Firebase hosting
- **Progressive Web App** features for offline usage

## 📈 Analytics & Monitoring

### Built-in Analytics
- User engagement and activity tracking
- Quiz performance and completion rates
- Topic difficulty analysis and optimization
- Real-time user session monitoring

### Performance Metrics
- Page load times and user experience
- Database query optimization
- Error tracking and resolution
- Scalability monitoring

## 🔐 Security & Privacy

### Data Protection
- **Firestore Security Rules** prevent unauthorized access
- **Email validation** ensures only authorized users
- **Role-based permissions** limit sensitive operations
- **Input sanitization** prevents injection attacks
- **HTTPS encryption** for all data transmission

### Privacy Compliance
- Minimal data collection practices
- Transparent data usage policies
- User consent management
- Data retention and deletion policies

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Commit with conventional commit format
5. Push to your branch
6. Open a Pull Request with detailed description

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for consistent formatting
- Conventional commits for clear history
- Jest for unit testing

## 📊 Platform Statistics

### Current Capacity
- **Unlimited users** with Firebase scaling
- **Real-time performance** with Firestore
- **Global distribution** via Firebase CDN
- **99.9% uptime** with Firebase infrastructure

### Content Management
- **15+ sample questions** in Ring Knowledge
- **CSV templates** for rapid content creation
- **Multi-category support** for diverse topics
- **Flexible difficulty** and explanation system

## 🎯 Roadmap

### Upcoming Features
- **Advanced analytics** with detailed insights
- **Custom quiz creation** by coaches
- **Certification system** with badges
- **Mobile app** for iOS and Android
- **API integration** with external systems

### Platform Enhancements
- **AI-powered question generation**
- **Adaptive learning** based on performance
- **Social features** and team collaboration
- **Advanced reporting** and data export
- **Multi-language support**

## 📞 Support

### Getting Help
- **Documentation**: Comprehensive guides in `/docs`
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: Contact the development team

### Technical Support
- Platform administration assistance
- Custom feature development
- Integration support and guidance
- Performance optimization consultation

## 📄 License

**Private - Ultrahuman Internal Use Only**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

**Built with ❤️ for the Ultrahuman Customer Experience Team**

*Empowering exceptional customer service through continuous learning and assessment.*

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
- **Bulk CSV Import**: Import quiz questions in bulk via CSV files
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

## 📚 Documentation

### Admin Guides
- **[CSV Import Guide](./docs/CSV_IMPORT_GUIDE.md)** - Complete guide for bulk importing quiz questions via CSV files
- **[Setup Instructions](./SETUP_INSTRUCTIONS.md)** - Platform setup and configuration
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions

### User Guides
- **[User Management Guide](./USER_MANAGEMENT_GUIDE.md)** - Managing users and roles
- **[Quick Test Guide](./QUICK_TEST_GUIDE.md)** - Testing the platform functionality

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
