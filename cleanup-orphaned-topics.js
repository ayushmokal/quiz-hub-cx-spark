import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  // Add your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupOrphanedTopics() {
  try {
    console.log('🧹 Starting cleanup of orphaned topics...');
    
    // Get all topics
    const topicsSnapshot = await getDocs(collection(db, 'topics'));
    console.log(`Found ${topicsSnapshot.docs.length} topics`);
    
    // Get all categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const validCategoryNames = categoriesSnapshot.docs.map(doc => {
      const data = doc.data();
      return [data.name, data.displayName, doc.id].filter(Boolean);
    }).flat();
    
    console.log('Valid categories:', validCategoryNames);
    
    // Find orphaned topics
    const orphanedTopics = [];
    
    topicsSnapshot.docs.forEach(topicDoc => {
      const topicData = topicDoc.data();
      const categoryMatches = validCategoryNames.some(catName => 
        catName.toLowerCase() === topicData.category?.toLowerCase()
      );
      
      if (!categoryMatches) {
        orphanedTopics.push({
          id: topicDoc.id,
          name: topicData.displayName || topicData.name,
          category: topicData.category
        });
      }
    });
    
    console.log(`Found ${orphanedTopics.length} orphaned topics:`, orphanedTopics);
    
    // Delete orphaned topics
    for (const topic of orphanedTopics) {
      await deleteDoc(doc(db, 'topics', topic.id));
      console.log(`✅ Deleted orphaned topic: ${topic.name} (category: ${topic.category})`);
    }
    
    console.log('🎉 Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup
cleanupOrphanedTopics();
