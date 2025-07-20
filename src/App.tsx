import { useState } from 'react';
import { Home, Play, Trophy } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { Topic } from './types';

const queryClient = new QueryClient();

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  if (!user) {
    return <LoginPage />;
  }

  const handleStartQuiz = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView('quiz-active');
  };

  const handleQuizComplete = (score: number, accuracy: number) => {
    console.log('App: Quiz completed with score:', score, 'accuracy:', accuracy, 'for user:', user?.id);
    // Trigger dashboard refresh to show updated stats
    setDashboardRefreshTrigger(prev => prev + 1);
    // Show success message and redirect to dashboard
    setCurrentView('dashboard');
    setSelectedTopic(null);
  };

  const handleQuizExit = () => {
    setCurrentView('quiz');
    setSelectedTopic(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} refreshTrigger={dashboardRefreshTrigger} />;
      case 'quiz':
        return <QuizSelection onStartQuiz={handleStartQuiz} />;
      case 'quiz-active':
        return selectedTopic ? (
          <QuizEngine 
            topic={selectedTopic} 
            onComplete={handleQuizComplete}
            onExit={handleQuizExit}
          />
        ) : (
          <QuizSelection onStartQuiz={handleStartQuiz} />
        );
      case 'leaderboard':
        return <Leaderboard />;
      case 'manage-questions':
        return <QuestionManagement />;
              case 'manage-topics':
          return <TopicManagement />;
        case 'manage-categories':
          return <CategoryManagement />;
        case 'analytics':
          return <AuditLogViewer />;
      case 'manage-users':
        return <UserManagement />;
      case 'quiz-import':
        return <QuizImport />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
              <p className="text-muted-foreground">Coming soon in V2</p>
            </div>
          </div>
        );
      default:
        return <Dashboard onViewChange={setCurrentView} refreshTrigger={dashboardRefreshTrigger} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="flex">
        <div className="hidden lg:block">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {renderCurrentView()}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#46494D]/20 p-2 pb-safe">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'dashboard' ? 'text-[#FF0000] bg-[#FF0000]/5' : 'text-[#46494D]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setCurrentView('quiz')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'quiz' ? 'text-[#FF0000] bg-[#FF0000]/5' : 'text-[#46494D]'
            }`}
          >
            <Play className="w-5 h-5" />
            <span className="text-xs font-medium">Quiz</span>
          </button>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === 'leaderboard' ? 'text-[#FF0000] bg-[#FF0000]/5' : 'text-[#46494D]'
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MainApp />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
