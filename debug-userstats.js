// Quick debug script to check userStats data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDN8YeR8HWwOVrSEhfBAgEfJyp5fAYLlnM",
  authDomain: "quiz-hub-cx-spark.firebaseapp.com",
  projectId: "quiz-hub-cx-spark",
  storageBucket: "quiz-hub-cx-spark.firebasestorage.app",
  messagingSenderId: "269896154516",
  appId: "1:269896154516:web:e09e0736b9e607a2fc7c7e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUserStats() {
  try {
    console.log('🔍 Checking userStats collection...');
    const userStatsCollection = collection(db, 'userStats');
    const snapshot = await getDocs(userStatsCollection);
    
    console.log(`Found ${snapshot.docs.length} userStats documents:`);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`User ${data.userId}:`, {
        totalPoints: data.totalPoints,
        bestCategory: data.bestCategory,
        overallAccuracy: data.overallAccuracy,
        currentStreak: data.currentStreak
      });
    });
    
    // Also check quizAttempts for comparison
    console.log('\n🔍 Checking quizAttempts collection...');
    const attemptsCollection = collection(db, 'quizAttempts');
    const attemptsSnapshot = await getDocs(attemptsCollection);
    
    console.log(`Found ${attemptsSnapshot.docs.length} quiz attempts:`);
    
    const attemptsByUser = {};
    attemptsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!attemptsByUser[data.userId]) {
        attemptsByUser[data.userId] = [];
      }
      attemptsByUser[data.userId].push({
        categoryName: data.categoryName,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
        completedAt: data.completedAt?.toDate?.()
      });
    });
    
    Object.entries(attemptsByUser).forEach(([userId, attempts]) => {
      console.log(`User ${userId} attempts:`, attempts);
    });
    
  } catch (error) {
    console.error('Error checking userStats:', error);
  }
}

checkUserStats();
