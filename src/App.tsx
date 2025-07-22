import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Home, Play, Trophy } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GlobalStateProvider } from './contexts/GlobalStateContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { QuizSelection } from './components/quiz/QuizSelection';
import { QuizEngine } from './components/quiz/QuizEngine';
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { TopicManagement } from './components/admin/TopicManagement';
import { QuestionManagement } from './components/admin/QuestionManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { UserManagement } from './components/admin/UserManagement';
import { QuizImport } from './components/admin/QuizImport';
import { Settings } from './components/admin/Settings';
import { QuizRoute } from './components/quiz/QuizRoute';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current view from pathname for navigation highlighting
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/quiz')) return 'quiz';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/admin/users') return 'manage-users';
    if (path === '/admin/topics') return 'manage-topics';
    if (path === '/admin/questions') return 'manage-questions';
    if (path === '/admin/categories') return 'manage-categories';
    if (path === '/admin/analytics') return 'analytics';
    if (path === '/admin/import') return 'quiz-import';
    if (path === '/admin/settings') return 'settings';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const handleViewChange = (view: string) => {
    switch (view) {
      case 'dashboard':
        navigate('/');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'manage-topics':
        navigate('/admin/topics');
        break;
      case 'manage-questions':
        navigate('/admin/questions');
        break;
      case 'manage-categories':
        navigate('/admin/categories');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'quiz-import':
        navigate('/admin/import');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="flex">
        <div className="hidden lg:block">
          <Navigation currentView={currentView} onViewChange={handleViewChange} />
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#46494D]/20 p-2 pb-safe">
        <div className="flex justify-around">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'dashboard' ? 'text-black bg-black/5' : 'text-[#46494D]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => handleViewChange('quiz')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'quiz' ? 'text-black bg-black/5' : 'text-[#46494D]'
            }`}
          >
            <Play className="w-5 h-5" />
            <span className="text-xs font-medium">Quiz</span>
          </button>
          <button
            onClick={() => handleViewChange('leaderboard')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'leaderboard' ? 'text-black bg-black/5' : 'text-[#46494D]'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-medium">Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardWithNavigation({ refreshTrigger }: { refreshTrigger: number }) {
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    switch (view) {
      case 'dashboard':
        navigate('/');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'manage-topics':
        navigate('/admin/topics');
        break;
      case 'manage-questions':
        navigate('/admin/questions');
        break;
      case 'manage-categories':
        navigate('/admin/categories');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'quiz-import':
        navigate('/admin/import');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        navigate('/');
    }
  };

  return <Dashboard onViewChange={handleViewChange} refreshTrigger={refreshTrigger} />;
}

function MainApp() {
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  const handleQuizComplete = () => {
    setDashboardRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={
                  <DashboardWithNavigation 
                    refreshTrigger={dashboardRefreshTrigger} 
                  />
                } />
                <Route path="/quiz" element={<QuizSelection />} />
                <Route path="/quiz/:topicId" element={<QuizRoute />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/topics" element={<TopicManagement />} />
                <Route path="/admin/questions" element={<QuestionManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/analytics" element={<AuditLogViewer />} />
                <Route path="/admin/import" element={<QuizImport />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GlobalStateProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MainApp />
        </TooltipProvider>
      </GlobalStateProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
