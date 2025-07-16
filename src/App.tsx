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
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { Topic } from './types';

const queryClient = new QueryClient();

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  if (!user) {
    return <LoginPage />;
  }

  const handleStartQuiz = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView('quiz-active');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'quiz':
        return <QuizSelection onStartQuiz={handleStartQuiz} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'manage-questions':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Question Management</h2>
              <p className="text-muted-foreground">Coming soon in V2</p>
            </div>
          </div>
        );
      case 'manage-topics':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Topic Management</h2>
              <p className="text-muted-foreground">Coming soon in V2</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Coming soon in V2</p>
            </div>
          </div>
        );
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
        return <Dashboard onViewChange={setCurrentView} />;
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
