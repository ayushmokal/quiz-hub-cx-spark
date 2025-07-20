// Quick fix script to update existing quiz attempts with category names
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

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

async function fixQuizAttempts() {
  try {
    console.log('🔧 Fixing existing quiz attempts...');
    
    // Get all quiz attempts
    const attemptsSnapshot = await getDocs(collection(db, 'quizAttempts'));
    console.log(`Found ${attemptsSnapshot.docs.length} quiz attempts to check`);
    
    for (const attemptDoc of attemptsSnapshot.docs) {
      const attempt = attemptDoc.data();
      
      if (!attempt.categoryName && attempt.topicId) {
        console.log(`Fixing attempt ${attemptDoc.id} for topic ${attempt.topicId}`);
        
        // Get topic to find category
        const topicDoc = await getDoc(doc(db, 'topics', attempt.topicId));
        if (topicDoc.exists()) {
          const topicData = topicDoc.data();
          const categoryName = topicData.category;
          
          if (categoryName) {
            // Calculate missing fields
            const totalQuestions = attempt.questions?.length || 0;
            const correctAnswers = Math.round((attempt.accuracy / 100) * totalQuestions);
            
            await updateDoc(attemptDoc.ref, {
              categoryName: categoryName,
              totalQuestions: totalQuestions,
              correctAnswers: correctAnswers
            });
            
            console.log(`✅ Updated attempt ${attemptDoc.id} with category: ${categoryName}`);
          }
        }
      }
    }
    
    console.log('🎉 Fix completed!');
  } catch (error) {
    console.error('❌ Error fixing quiz attempts:', error);
  }
}

// Note: This script would need to be run with proper authentication
// For now, just take a new quiz to test the fix
console.log('To test the fix: Take a new quiz and then check the leaderboard!');
