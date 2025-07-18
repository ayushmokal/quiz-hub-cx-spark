# 🚀 CX Quiz Hub Deployment Guide

## Quick Deployment Checklist

### ✅ Completed Implementation
- [x] Supabase client setup
- [x] Database schema created
- [x] Seed data prepared
- [x] Email/password authentication system
- [x] Quiz engine with real-time scoring
- [x] API service layer
- [x] Dashboard with real data
- [x] Leaderboard system
- [x] Error handling and loading states
- [x] Responsive design
- [x] TypeScript integration

### 📋 Required Steps for Production

## Step 1: Database Setup (5 minutes)

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Open SQL Editor**
3. **Run schema creation**:
   - Copy all content from `database/schema.sql`
   - Paste in SQL Editor
   - Click "Run"

4. **Run seed data**:
   - Copy all content from `database/seed-data.sql`
   - Paste in SQL Editor
   - Click "Run"

5. **Verify tables created**:
   - Check Tables tab shows: users, topics, questions, quiz_attempts, user_stats

## Step 2: Authentication Setup (3 minutes)

### **Enable Email Authentication**
1. Go to Authentication > Settings
2. Set "Enable email confirmations" to **OFF** (for demo/internal use)
3. Set "Enable phone confirmations" to **OFF**

### **Create Demo Users Manually**
1. Go to Authentication > Users
2. Click "Add User"
3. Create these users with password `password123`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ultrahuman.com` | `password123` |
| Coach | `jaideep@ultrahuman.com` | `password123` |
| Agent | `priya.sharma@ultrahuman.com` | `password123` |

4. **Important**: Make sure to set "Email Confirmed" to **true** for each user

## Step 3: Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=https://zlzqwkatbijbekpllyfg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenF3a2F0YmlqYmVrcGxseWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2MDMsImV4cCI6MjA2ODMzNjYwM30.Jo-sUVo-cfS7xKQU94zs6SWwsxwAFmV0xKTw05Cil1Q
```

## Step 4: Test Locally

```bash
npm install
npm run dev
```

Test with demo credentials:
- **Admin**: admin@ultrahuman.com / password123
- **Coach**: jaideep@ultrahuman.com / password123  
- **Agent**: priya.sharma@ultrahuman.com / password123

## Step 5: Deploy to Vercel

### Option A: GitHub Integration (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option B: Direct Upload
1. Run `npm run build`
2. Upload `dist` folder to Vercel
3. Set environment variables

## 🧪 Post-Deployment Testing

### Critical User Flows
1. **Login Flow**:
   - [ ] Email/password login works with demo users
   - [ ] Role-based navigation appears correctly
   - [ ] Proper error messages for invalid credentials

2. **Quiz Flow**:
   - [ ] Quiz topics load from database
   - [ ] Quiz engine works with real questions
   - [ ] Scoring saves to database
   - [ ] Results appear on dashboard

3. **Leaderboard**:
   - [ ] Real user stats display
   - [ ] Rankings update after quiz completion

## 🔐 Security Features

### Authentication Security
- [x] **Email/Password Authentication**: Secure login via Supabase Auth
- [x] **Manual User Creation**: Only pre-approved users can access
- [x] **Role-based Access**: Different permissions for Agent/Coach/Admin
- [x] **JWT Authentication**: Secure session management via Supabase

### Database Security
- [x] Row Level Security enabled
- [x] User access controlled via authentication
- [x] Environment variables secured
- [x] No sensitive data in frontend code

## 📊 Performance Verification

### Expected Load Times
- **Dashboard**: < 2 seconds
- **Quiz Loading**: < 1 second  
- **Question Transitions**: < 500ms
- **Results**: < 1 second

### Database Queries
- All queries use indexes
- RLS policies enforce security
- Real-time updates via Supabase subscriptions

## 📈 Monitoring Setup

### Recommended Tools
1. **Error Tracking**: Sentry integration
2. **Performance**: Vercel Analytics
3. **Database**: Supabase built-in monitoring
4. **Uptime**: Uptime Robot or similar

### Key Metrics to Track
- User login success rate
- Quiz completion rate
- Average quiz scores
- Database query performance
- Error rates

## 🚨 Troubleshooting

### Authentication Issues

**"Invalid login credentials"**
- Ensure demo users are created in Supabase Auth > Users
- Verify email and password are correct (password123)
- Check if "Email Confirmed" is set to true for each user
- Verify user exists in both auth.users and public.users tables

**"User not found" or profile errors**
- Check if user exists in your custom `users` table
- Run the seed data script to populate user profiles
- Verify the email matches exactly between auth and users table

### Database Issues

**"Database connection failed"**
- Verify Supabase URL and key in environment variables
- Check if Supabase project is active

**"Questions not loading"**
- Ensure seed data was run successfully
- Check RLS policies allow reading
- Verify topics and questions tables have data

**"Quiz results not saving"**
- Verify user is properly authenticated
- Check database permissions and RLS policies

## 📞 Support Information

### Resources
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Auth Guide**: https://supabase.com/docs/guides/auth

### Emergency Contacts
- Database issues: Check Supabase dashboard
- Deployment issues: Check Vercel deployment logs
- Authentication issues: Check Supabase Auth logs

---

## 🎯 Success Metrics

After deployment, you should see:
- ✅ Demo users can log in with email/password
- ✅ Role-based navigation works correctly
- ✅ 5 quiz topics available
- ✅ 12+ sample questions working
- ✅ Real-time leaderboard updates
- ✅ Responsive design on all devices
- ✅ Sub-2s page load times

## 🚀 Next Steps (V2 Features)

Once core platform is stable:
1. Google OAuth integration (if needed later)
2. Question management interface
3. Topic management system
4. Analytics dashboard
5. User management (Admin)
6. Email notifications
7. Advanced reporting

---

**Total Setup Time**: ~15-25 minutes  
**Cost**: $0 (using free tiers)  
**Scalability**: Supports 100+ users easily

## 🔑 Authentication Summary

### Email/Password Login (Current Implementation)
- **Manual user creation** required in Supabase Dashboard
- **Demo users**: admin@ultrahuman.com, jaideep@ultrahuman.com, priya.sharma@ultrahuman.com
- **Password**: password123 for all demo users
- **No external dependencies** - works immediately after user creation

### Adding More Users
To add new team members:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter their @ultrahuman.com email and a secure password
4. Set "Email Confirmed" to true
5. The user profile will be created automatically in your users table

### Future OAuth Integration
- Google OAuth can be added later without affecting existing users
- Current email/password users will continue to work
- OAuth users will be auto-created when first signing in 