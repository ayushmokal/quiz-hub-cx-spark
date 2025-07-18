# Firebase Migration Guide

## 🚀 Quick Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. **Project name**: `quiz-hub-cx-spark` (or your preferred name)
4. **Analytics**: Disable for now (can enable later)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider
4. Enable **Google** provider:
   - Click Google → Enable
   - Add your project support email
   - **Authorized domains**: Add your Vercel domain (e.g., `your-app.vercel.app`)

### 3. Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. **Security rules**: Start in **production mode** (we have custom rules)
3. **Location**: Choose closest to your users (e.g., `us-central`)
4. Wait for database creation

### 4. Get Firebase Configuration

1. In Firebase Console → **Project settings** (gear icon)
2. Scroll to **Your apps** → **Web app** → Click **</>** icon
3. **App name**: `quiz-hub-cx-spark`
4. **Firebase Hosting**: ✅ Check this box
5. Copy the configuration object

### 5. Set Environment Variables

Create `.env.local` file in your project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 6. Deploy Security Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - **Project**: Select your Firebase project
   - **Rules file**: Keep default `firestore.rules`
   - **Indexes file**: Keep default `firestore.indexes.json`

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 7. Configure Google OAuth Domain Restriction

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client** (created by Firebase)
5. Click edit → **Authorized domains** → Add:
   - `ultrahuman.com`
   - Your Vercel deployment domain
   - `localhost` (for development)

### 8. Test the Migration

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   - Try Google login with `@ultrahuman.com` email
   - Verify user profile creation
   - Check role assignment

3. **Test admin features** (if you have admin role):
   - Create a category
   - Create a topic
   - Add questions
   - View audit logs

## 🔥 Firebase vs Supabase Changes

### Key Differences

| Feature | Supabase | Firebase |
|---------|----------|----------|
| **Database** | PostgreSQL (SQL) | Firestore (NoSQL) |
| **Auth** | Built-in + RLS | Firebase Auth + Security Rules |
| **Real-time** | Subscriptions | Realtime listeners |
| **Queries** | SQL queries | Collection queries |
| **Schema** | Fixed tables | Flexible documents |

### Code Changes Made

1. **API Layer**: `src/services/api.ts` now redirects to `src/services/firebase-api.ts`
2. **Auth Context**: Updated to use Firebase Auth
3. **Firebase Config**: New `src/lib/firebase.ts` configuration
4. **Security Rules**: `firestore.rules` for role-based access
5. **Schema**: `docs/firestore-schema.md` shows new structure

### Breaking Changes

⚠️ **Important**: The following will need updates if you have custom components:

1. **Field Names**: Changed from `snake_case` to `camelCase`
2. **Question Storage**: Now in subcollections (`topics/{id}/questions/{id}`)
3. **Timestamps**: Firebase Timestamp objects instead of strings
4. **Audit Logs**: Different field structure

## 🛠 Data Migration (Optional)

If you have existing data in Supabase, create migration scripts:

### 1. Export from Supabase
```sql
-- Export users
COPY (SELECT * FROM users) TO '/tmp/users.csv' WITH CSV HEADER;

-- Export categories  
COPY (SELECT * FROM categories) TO '/tmp/categories.csv' WITH CSV HEADER;

-- Export topics
COPY (SELECT * FROM topics) TO '/tmp/topics.csv' WITH CSV HEADER;

-- Export questions
COPY (SELECT * FROM questions) TO '/tmp/questions.csv' WITH CSV HEADER;
```

### 2. Import to Firebase
Create a Node.js script using Firebase Admin SDK to import the CSV data.

## 🔒 Security Verification

### Test Role-Based Access

1. **Agent Role**:
   - ✅ Can view topics and questions
   - ✅ Can take quizzes
   - ❌ Cannot create/edit topics
   - ❌ Cannot view audit logs

2. **Coach Role**:
   - ✅ All agent permissions
   - ✅ Can create/edit topics and questions
   - ✅ Can manage categories
   - ❌ Cannot view audit logs

3. **Admin Role**:
   - ✅ All coach permissions
   - ✅ Can manage users
   - ✅ Can view audit logs
   - ✅ Full system access

## 📊 Performance & Scaling

### Firestore Advantages for Your Use Case

1. **Real-time Updates**: Perfect for live quiz features
2. **Automatic Scaling**: Handles your 160 users easily
3. **Offline Support**: Works without internet
4. **Global CDN**: Fast worldwide access

### Monitoring

1. **Firebase Console**: Monitor usage and performance
2. **Firestore Usage**: Track reads/writes in console
3. **Auth Usage**: Monitor sign-ins and user growth

## 🚨 Troubleshooting

### Common Issues

1. **Auth Domain Error**:
   - Check `VITE_FIREBASE_AUTH_DOMAIN` in `.env.local`
   - Verify domain in Firebase Console → Authentication → Settings

2. **Permission Denied**:
   - Check Firestore rules deployment
   - Verify user role in Firestore users collection

3. **CORS Error**:
   - Add your domain to Firebase authorized domains
   - Check Google OAuth configuration

### Need Help?

1. **Firebase Console**: Check error logs
2. **Browser Console**: Look for authentication errors
3. **Network Tab**: Check API call responses

## ✅ Migration Complete!

Your quiz hub is now powered by Firebase! 🎉

**Benefits Achieved**:
- ✅ **Free hosting**: Perfect for your 160 users
- ✅ **Real-time features**: Live leaderboards and updates  
- ✅ **Better scaling**: Handles growth automatically
- ✅ **Improved security**: Role-based Firestore rules
- ✅ **Faster development**: Less backend configuration

**Next Steps**:
1. Deploy to Vercel
2. Add team members to Firebase project
3. Monitor usage in Firebase Console
4. Consider Firebase Hosting for better performance 