import { useState } from 'react';
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
    console.log('App: Quiz completed with score:', score, 'accuracy:', accuracy);
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
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
              <p className="text-muted-foreground">Coming soon in V2</p>
            </div>
          </div>
        );
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
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
