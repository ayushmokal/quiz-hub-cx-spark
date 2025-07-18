# 🧪 Quick Test Guide - CX Quiz Hub

## ✅ **Step 1: Populate Database (2 minutes)**

You're logged in! Now let's add the quiz content.

### **Run Seed Data in Supabase:**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the content from `database/seed-data.sql`
3. Click **"Run"**
4. You should see: "Success. No rows returned"

**This will add:**
- ✅ 5 quiz topics (Sensor, Ring, Payment, Logistics, Account)
- ✅ 12+ sample questions across different difficulties
- ✅ All users with proper roles

---

## 🎮 **Step 2: Test Core Features (5 minutes)**

### **A. Dashboard Test**
1. **Refresh your app** (localhost:5173)
2. **Expected**: Dashboard shows user stats (should be zeros for new user)
3. **Expected**: "Knowledge Topics" section shows 5 topic cards
4. **Expected**: Topics show categories, question counts, accuracy

### **B. Quiz Flow Test**
1. **Click "Take Quiz"** in navigation or any topic card
2. **Expected**: Quiz selection page with 5 topics
3. **Click "Start Quiz"** on any topic
4. **Expected**: Quiz loads with questions, timer, progress bar
5. **Take the quiz**: Select answers and complete it
6. **Expected**: Results screen with score, accuracy, feedback
7. **Click "Back to Dashboard"**
8. **Expected**: Dashboard stats should update with your score

### **C. Leaderboard Test**
1. **Click "Leaderboard"** in navigation
2. **Expected**: Shows rankings (you should appear after taking quiz)
3. **Expected**: Top performers, accuracy stats, response times

---

## 🎯 **Expected Results After Seed Data:**

### **Dashboard Should Show:**
```
📊 Knowledge Topics (5 topics):
├── Sensor Troubleshooting (3 questions)
├── Ring Device Support (3 questions) 
├── Payment Processing (2 questions)
├── Logistics & Shipping (2 questions)
└── Account Management (2 questions)
```

### **Quiz Selection Should Show:**
```
🎮 Available Topics:
├── All with "Start Quiz" buttons
├── Category filters working
├── Question counts visible
├── Difficulty indicators
```

### **Quiz Engine Should:**
```
⏱️ Timer counting down
📝 Multiple choice and multi-select questions
✅ Answer selection working
📊 Progress bar updating
🎉 Results screen with scoring
```

---

## 🚨 **Troubleshooting**

### **"No topics found" on dashboard:**
- ❌ Seed data not run yet
- ✅ **Fix**: Run `database/seed-data.sql` in Supabase SQL Editor

### **"No questions available" when starting quiz:**
- ❌ Questions didn't import properly
- ✅ **Fix**: Re-run seed data script, check for SQL errors

### **Quiz results don't save:**
- ❌ RLS policies might be blocking
- ✅ **Fix**: Check browser console for errors

### **Stats don't update after quiz:**
- ❌ Trigger functions might not be working
- ✅ **Fix**: Check user_stats table in Supabase

---

## 🏆 **Success Criteria**

After running seed data and testing, you should have:

- ✅ **5 quiz topics** visible on dashboard
- ✅ **12+ questions** across different topics  
- ✅ **Working quiz engine** with timer and scoring
- ✅ **Results saving** to database
- ✅ **User stats updating** after completing quizzes
- ✅ **Leaderboard showing** real rankings
- ✅ **Role-based navigation** working (Agent/Coach/Admin)

---

## 🚀 **Next Steps After Testing**

Once core functionality is verified:

1. **Add more questions** via admin interface (V2)
2. **Add more users** to test leaderboard
3. **Deploy to production** via Vercel
4. **Invite team members** to start using

---

**Total test time: ~7 minutes**
**Expected outcome: Fully functional quiz platform!** 🎉 