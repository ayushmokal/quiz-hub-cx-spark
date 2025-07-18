# 🔧 Quick Fix: Create Demo Users in Supabase

## The Problem
You're getting "Invalid email or password" because the demo users don't exist in Supabase Auth yet.

## The Solution (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: **zlzqwkatbijbekpllyfg**

### Step 2: Create Demo Users
1. Go to **Authentication** → **Users** 
2. Click **"Add User"** button
3. Create these 3 users:

#### User 1: Admin
- **Email**: `admin@ultrahuman.com`
- **Password**: `password123`
- **Email Confirmed**: ✅ **Check this box**
- Click **Create User**

#### User 2: Coach  
- **Email**: `jaideep@ultrahuman.com`
- **Password**: `password123`
- **Email Confirmed**: ✅ **Check this box**
- Click **Create User**

#### User 3: Agent
- **Email**: `priya.sharma@ultrahuman.com`
- **Password**: `password123`
- **Email Confirmed**: ✅ **Check this box**
- Click **Create User**

### Step 3: Test Login
- Go back to your app (localhost:5173)
- Try logging in with: `admin@ultrahuman.com` / `password123`
- Should work immediately! ✅

## Screenshots Guide

### Where to find "Authentication" → "Users":
```
Supabase Dashboard
├── Your Project (zlzqwkatbijbekpllyfg)
├── 📊 Table Editor
├── 🔐 Authentication  ← Click here
│   ├── Users          ← Then click here
│   ├── Providers
│   └── Settings
```

### "Add User" form should look like:
```
Email: admin@ultrahuman.com
Password: password123
☑️ Email Confirmed (IMPORTANT: Check this!)
[ Create User ]
```

## Troubleshooting

### If you still get login errors:
1. **Check Email Confirmed**: Make sure you checked the "Email Confirmed" box
2. **Check Password**: Exactly `password123` (lowercase)
3. **Check Email**: Exactly `admin@ultrahuman.com`
4. **Wait 30 seconds**: Sometimes takes a moment to sync

### If users don't appear:
1. Refresh the Users page
2. Check you're in the right project
3. Make sure you clicked "Create User" for each one

## Next Steps After Login Works
1. ✅ Login with admin@ultrahuman.com works
2. ✅ Test dashboard appears
3. ✅ Run the database seed script (from DEPLOYMENT_GUIDE.md)
4. ✅ Test quiz functionality

---

**This should fix your login issue in under 5 minutes!** 🎉 