// Legacy API file - redirects to Firebase API for backward compatibility
// All existing imports from './services/api' will now use Firebase instead of Supabase

export { 
  authAPI, 
  usersAPI, 
  categoriesAPI, 
  topicsAPI, 
  questionsAPI, 
  quizAPI, 
  dashboardAPI, 
  leaderboardAPI, 
  auditAPI 
} from './firebase-api'; 