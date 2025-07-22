# Quiz Hub CX Spark - Complete Documentation

*A comprehensive role-based learning and assessment platform built for Ultrahuman's Customer Experience team*

---

## 📋 Table of Contents

**Quick Navigation**
- [[#🧠-executive-summary|Executive Summary]]
- [[#🚀-quick-start-guide|Quick Start Guide]]
- [[#⚙️-technical-architecture|Technical Architecture]]
- [[#👥-user-roles--permissions|User Roles & Permissions]]
- [[#🎯-features--functionality|Features & Functionality]]
- [[#📊-admin-management|Admin Management]]
- [[#🔐-authentication--security|Authentication & Security]]
- [[#🧪-testing--quality-assurance|Testing & Quality Assurance]]
- [[#🚀-deployment-guide|Deployment Guide]]
- [[#📈-analytics--monitoring|Analytics & Monitoring]]
- [[#🔧-troubleshooting|Troubleshooting]]
- [[#📚-api-documentation|API Documentation]]
- [[#📞-support--resources|Support & Resources]]

---

## 🧠 Executive Summary

The **Quiz Hub CX Spark** is a sophisticated role-based learning and assessment platform specifically designed for Ultrahuman's Customer Experience organization. This comprehensive solution combines modern web technologies with gamification elements to create an engaging training environment.

### Key Objectives
- **Enhance CX Team Knowledge**: Systematic training on Ultrahuman products and support processes
- **Performance Tracking**: Real-time analytics and competitive leaderboards
- **Scalable Content Management**: Bulk import capabilities and role-based content creation
- **Mobile-First Design**: Optimized for all devices and screen sizes

### Current Status
✅ **Production Ready** with Firebase backend, real-time data synchronization, and comprehensive user management

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- Firebase project with Firestore enabled
- Google account for Firebase access
- Basic understanding of React/TypeScript

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/ayushmokal/quiz-hub-cx-spark.git
cd quiz-hub-cx-spark
```

2. **Install Dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Configuration**
Create `.env` file in root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Firebase Setup**
- Enable Firestore Database
- Configure Authentication (Email/Password + Google OAuth)
- Deploy security rules from `firestore.rules`
- Create Firestore indexes from `firestore.indexes.json`

5. **Start Development Server**
```bash
npm run dev
# Application available at http://localhost:8080
```

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ultrahuman.com | password123 |
| **Coach** | coach@ultrahuman.com | password123 |
| **Agent** | agent@ultrahuman.com | password123 |

---

## ⚙️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **shadcn/ui** for consistent, accessible components
- **React Router DOM** for client-side routing
- **React Hook Form** for form validation

### Backend & Database
- **Firebase Firestore** for real-time NoSQL database
- **Firebase Authentication** for secure user management
- **Firebase Cloud Functions** for serverless backend logic
- **Firebase Hosting** for static site deployment

### Key Architecture Features
- **Real-time Data Synchronization**: Live updates across all clients
- **Offline Support**: Automatic sync when connection restored
- **Security Rules**: Firestore-level data protection
- **Scalable Design**: Supports unlimited users with Firebase scaling

### Project Structure
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
│   ├── contexts/           # React contexts (Auth, GlobalState)
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

---

## 👥 User Roles & Permissions

### 🎯 Agent (Default Role)
**Primary Users**: Customer Experience representatives

**Permissions**:
- ✅ Take quizzes across all available topics
- ✅ View personal dashboard and performance metrics
- ✅ Access leaderboard and competitive rankings
- ✅ Track learning progress and achievements
- ✅ Export quiz results as PDF
- ❌ Create or edit content
- ❌ Access admin features

**Dashboard Features**:
- Personal KPI cards (accuracy, response time, streak)
- Quick quiz access
- Recent activity tracking
- Achievement badges

### 🎓 Coach (Elevated Access)
**Primary Users**: Team leads and training managers

**Permissions**:
- ✅ All Agent permissions
- ✅ Create and edit quiz questions
- ✅ Manage topics and categories
- ✅ View team analytics and performance reports
- ✅ Monitor agent progress and provide guidance
- ✅ Bulk CSV import for rapid content creation
- ✅ Access audit logs
- ❌ User management
- ❌ System settings

**Additional Features**:
- Topic management interface
- Question creation and editing
- Team performance analytics
- Content audit trails

### ⚙️ Admin (Full Access)
**Primary Users**: IT administrators and platform managers

**Permissions**:
- ✅ All Coach permissions
- ✅ User management and role assignment
- ✅ System configuration and settings
- ✅ Platform monitoring and maintenance
- ✅ Advanced analytics and reporting
- ✅ Audit log viewing
- ✅ Category management

**Exclusive Features**:
- User account creation and management
- Role assignment and permissions
- System-wide configuration
- Advanced reporting and analytics

---

## 🎯 Features & Functionality

### 🔐 Authentication System
- **Firebase Authentication** with email/password and Google OAuth
- **Email Whitelist Validation** for secure access (@ultrahuman.com only)
- **Role-based Access Control** with automatic UI adaptation
- **Persistent Sessions** with automatic token refresh
- **Password Reset** functionality

### 📚 Quiz Engine
**Core Features**:
- **Dynamic Quiz Generation** from question pools
- **Multiple Question Types**: Multiple choice, multi-select, case study
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Time Limits**: Configurable per question (10-300 seconds)
- **Real-time Scoring** with immediate feedback
- **Detailed Explanations** for learning reinforcement

**User Experience**:
- **Progress Tracking** with visual indicators
- **Attempt History** and performance analytics
- **Results Review** with incorrect answer analysis
- **PDF Export** for offline study
- **Responsive Design** optimized for all devices

**Advanced Features**:
- **Question Randomization** for varied experiences
- **Streak Tracking** for consistency rewards
- **Performance Analytics** with trend analysis
- **Retry Functionality** for improvement

### 📊 Dashboard & Analytics
**Personal Dashboard**:
- **KPI Cards**: Total points, accuracy percentage, average response time, current streak
- **Recent Activity**: Last quiz attempts and scores
- **Quick Actions**: Start random quiz, view leaderboard
- **Progress Tracking**: Visual charts and trend analysis

**Analytics Features**:
- **Category-wise Performance**: Breakdown by topic areas
- **Time-based Trends**: Weekly and monthly progress
- **Comparative Analysis**: Against team averages
- **Goal Tracking**: Personal improvement targets

### 🏆 Leaderboard & Gamification
**Competitive Features**:
- **Real-time Rankings** with live updates
- **Top 3 Podium** with special highlighting
- **Weekly and All-time Leaderboards**
- **Achievement Badges** and milestone tracking
- **Streak Counters** and consistency rewards

**Gamification Elements**:
- **Point-based Scoring** system
- **Achievement Unlocks** for various milestones
- **Competitive Rankings** across teams
- **Progress Visualization** with charts and graphs

### 👑 Administrative Features
**Content Management**:
- **Topic Creation and Editing** with category assignment
- **Question Management** with bulk operations
- **CSV Import System** for rapid content creation
- **Category Organization** with color coding
- **Content Status Management** (Draft, Active, Inactive)

**User Management**:
- **Account Creation** with role assignment
- **Profile Management** and user details
- **Role Modification** and permission updates
- **Activity Monitoring** and user engagement tracking

**System Monitoring**:
- **Audit Logs** with comprehensive change tracking
- **Usage Analytics** and platform statistics
- **Performance Monitoring** and optimization insights
- **Security Logging** and access tracking

---

## 📊 Admin Management

### Topic Management
**Creating Topics**:
1. Navigate to Admin → Topics
2. Click "Create Topic" button
3. Fill in required fields:
   - **Topic Name**: Clear, descriptive title
   - **Description**: Detailed explanation of topic scope
   - **Category**: Select from available categories
   - **Status**: Draft, Active, or Inactive
4. Save topic for question assignment

**Topic Categories**:
- **Health Science**: Biomarkers, sleep metrics, recovery scores
- **Ultrahuman Training**: Product features, troubleshooting, support processes
- **Technical Support**: Advanced troubleshooting and system knowledge
- **Customer Operations**: Process workflows and best practices

### Question Management
**Question Types Supported**:
- **Multiple Choice**: Single correct answer
- **Multi-Select**: Multiple correct answers
- **Case Study**: Scenario-based questions

**Question Creation Process**:
1. Select topic from dropdown
2. Choose question type
3. Enter question text and options
4. Set correct answer(s)
5. Add explanation for learning
6. Configure difficulty and time limit
7. Save and review

### Bulk CSV Import System
**Import Process**:
1. Download CSV template from admin interface
2. Fill in questions following the template format
3. Upload CSV file through import interface
4. Review and validate questions
5. Confirm import to add to database

**CSV Template Format**:
```csv
Category,Topic,Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation,Difficulty,Time Limit
health-science,Health Biomarkers,"What does HRV measure?","Heart Rate","Heart Rate Variability","Heart Volume","Heart Pressure","Heart Rate Variability","HRV measures the variation in time between heartbeats",beginner,30
```

### User Management
**Creating Users**:
1. Navigate to Admin → Users
2. Click "Create User" button
3. Enter user details:
   - **Email**: Must be @ultrahuman.com domain
   - **Name**: Full name
   - **Role**: Agent, Coach, or Admin
   - **Department**: Optional grouping
   - **Password**: Temporary password for first login
4. User receives account credentials

**Role Assignment**:
- **Role Changes**: Can be modified by admins
- **Permission Updates**: Take effect immediately
- **Activity Tracking**: All changes logged in audit trail

---

## 🔐 Authentication & Security

### Security Architecture
**Firebase Authentication**:
- JWT-based authentication with automatic token refresh
- Email verification for new accounts
- Secure password requirements
- OAuth integration with Google accounts

**Database Security**:
- **Row Level Security (RLS)** on all Firestore collections
- **Role-based Access Control** at the database level
- **Input Validation** and sanitization
- **HTTPS Encryption** for all data transmission

**Access Control**:
- **Email Whitelist**: Only @ultrahuman.com emails allowed
- **Role Verification**: Server-side permission checks
- **Session Management**: Secure token handling
- **Audit Logging**: Comprehensive change tracking

### Data Protection
**Privacy Measures**:
- Minimal data collection practices
- Transparent data usage policies
- User consent management
- Data retention and deletion policies

**Security Best Practices**:
- Environment variable protection
- No sensitive data in frontend code
- Regular security audits
- Dependency vulnerability scanning

---

## 🧪 Testing & Quality Assurance

### Testing Coverage
**Unit Tests**:
- Core business logic validation
- Component functionality testing
- Utility function verification
- Error handling scenarios

**Integration Tests**:
- API endpoint testing
- Database operation validation
- Authentication flow testing
- Role-based access verification

**End-to-End Testing**:
- Complete user workflow testing
- Cross-browser compatibility
- Mobile responsiveness verification
- Performance benchmarking

### Quality Metrics
**Performance Standards**:
- Dashboard load time: < 2 seconds
- Quiz loading: < 1 second
- Question transitions: < 500ms
- Results display: < 1 second

**Accessibility Compliance**:
- WCAG 2.1 AA standards
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements

---

## 🚀 Deployment Guide

### Firebase Hosting (Recommended)

**Setup Process**:
1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

2. Login and initialize project
```bash
firebase login
firebase init hosting
```

3. Build and deploy
```bash
npm run build
firebase deploy
```

### Environment Configuration
**Production Variables**:
```env
VITE_FIREBASE_API_KEY=production_api_key
VITE_FIREBASE_AUTH_DOMAIN=production_domain
VITE_FIREBASE_PROJECT_ID=production_project_id
VITE_FIREBASE_STORAGE_BUCKET=production_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=production_sender_id
VITE_FIREBASE_APP_ID=production_app_id
```

### Performance Optimizations
- **Code Splitting**: Lazy loading for improved initial load times
- **Image Optimization**: WebP format with fallbacks
- **Firebase Caching**: Optimized response times
- **CDN Distribution**: Global content delivery
- **Progressive Web App**: Offline capabilities

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Authentication providers enabled
- [ ] Demo users created
- [ ] Seed data imported
- [ ] SSL certificate configured
- [ ] Domain DNS configured
- [ ] Performance testing completed

---

## 📈 Analytics & Monitoring

### Built-in Analytics
**User Engagement Tracking**:
- Quiz completion rates
- Session duration and frequency
- Feature usage patterns
- User retention metrics

**Performance Analytics**:
- Topic difficulty analysis
- Question effectiveness metrics
- Learning progression tracking
- Competitive engagement levels

### Performance Monitoring
**System Metrics**:
- Page load times and user experience
- Database query optimization
- Error tracking and resolution
- Scalability monitoring

**Business Intelligence**:
- Training effectiveness measurement
- Knowledge retention analysis
- Team performance comparisons
- ROI tracking for training programs

---

## 🔧 Troubleshooting

### Common Issues

**Authentication Problems**:
- **"Invalid login credentials"**: Verify demo users exist in Firebase Auth
- **"User not found"**: Check if user profile exists in Firestore
- **"Permission denied"**: Verify user role and permissions

**Quiz Loading Issues**:
- **"Questions not loading"**: Ensure seed data was imported correctly
- **"Database connection failed"**: Verify Firebase configuration
- **"Results not saving"**: Check Firestore security rules

**Performance Issues**:
- **Slow loading**: Check network connection and Firebase region
- **Memory leaks**: Ensure proper component cleanup
- **High CPU usage**: Optimize render cycles and state updates

### Debugging Guide
**Development Tools**:
1. Enable Firebase debug mode
2. Check browser console for errors
3. Use React Developer Tools
4. Monitor network requests
5. Review Firestore debug logs

**Error Resolution**:
1. Identify error source (frontend/backend)
2. Check error messages in console
3. Verify user permissions and roles
4. Test with different user accounts
5. Review recent code changes

---

## 📚 API Documentation

### Authentication API
```typescript
// Sign in with email/password
await authAPI.signIn(email: string, password: string)

// Sign in with Google OAuth
await authAPI.signInWithGoogle()

// Sign out current user
await authAPI.signOut()

// Get current authenticated user
await authAPI.getCurrentUser()

// Reset password
await authAPI.resetPassword(email: string)
```

### Quiz Operations API
```typescript
// Get all available topics
await topicsAPI.getTopics()

// Get questions for specific topic
await questionsAPI.getQuestionsByTopic(topicId: string)

// Submit quiz attempt
await quizAPI.submitQuizAttempt(attempt: QuizAttempt)

// Get user quiz history
await quizAPI.getUserQuizAttempts(userId: string)
```

### Admin API
```typescript
// Create new topic
await topicsAPI.createTopic(topic: Topic)

// Update existing topic
await topicsAPI.updateTopic(topicId: string, updates: Partial<Topic>)

// Delete topic
await topicsAPI.deleteTopic(topicId: string)

// Create new question
await questionsAPI.createQuestion(question: Question)

// Bulk import questions via CSV
await questionsAPI.importQuestionsFromCSV(csvData: string)
```

### Leaderboard API
```typescript
// Get current leaderboard
await leaderboardAPI.getLeaderboard()

// Get user statistics
await dashboardAPI.getUserDashboardStats(userId: string)

// Get user rankings
await leaderboardAPI.getUserRanking(userId: string)
```

---

## 📞 Support & Resources

### Getting Help
**Documentation Resources**:
- **[CSV Import Guide](./docs/CSV_IMPORT_GUIDE.md)**: Complete guide for bulk importing quiz questions
- **[Admin Setup Guide](./ADMIN_SETUP_GUIDE.md)**: Administrator onboarding and configuration
- **[User Management Guide](./USER_MANAGEMENT_GUIDE.md)**: Managing users and roles
- **[Quick Test Guide](./QUICK_TEST_GUIDE.md)**: Platform functionality testing
- **[Firebase Setup Guide](./FIREBASE_SHEETS_INTEGRATION.md)**: Firebase configuration

**Technical Support**:
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Email support for urgent issues
- Video call support for complex problems

### Emergency Contacts
**Database Issues**:
- Check Firebase console for service status
- Review Firestore usage and quotas
- Verify security rules configuration

**Authentication Issues**:
- Check Firebase Auth logs
- Verify OAuth provider configuration
- Review user account status

**Deployment Issues**:
- Check build logs for errors
- Verify environment variables
- Test deployment in staging environment

### Development Resources
**Community Resources**:
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui Components: https://ui.shadcn.com

**Best Practices**:
- Follow TypeScript strict mode
- Use ESLint for code quality
- Implement comprehensive error handling
- Maintain consistent naming conventions
- Document all custom hooks and utilities

---

## 🎯 Roadmap & Future Enhancements

### Upcoming Features (Version 2.0)
**Advanced Learning Features**:
- AI-powered question generation
- Adaptive learning based on performance
- Personalized learning paths
- Advanced analytics and insights

**Platform Enhancements**:
- Mobile app for iOS and Android
- Offline mode with synchronization
- Advanced reporting and data export
- Multi-language support

**Integration Capabilities**:
- Slack notifications for achievements
- Calendar integration for scheduled quizzes
- Email reminders and progress reports
- API webhooks for external systems

### Long-term Vision
**Enterprise Features**:
- Multi-tenant architecture
- Advanced role customization
- Custom branding options
- Enterprise SSO integration

**Scale & Performance**:
- Global CDN deployment
- Advanced caching strategies
- Real-time collaboration features
- Advanced security hardening

---

**Built with ❤️ for the Ultrahuman Customer Experience Team**

*Empowering exceptional customer service through continuous learning and assessment.*

---

**Last Updated**: July 22, 2025  
**Version**: 1.0  
**License**: Private - Ultrahuman Internal Use Only
