import { 
  Home, 
  Play, 
  Trophy, 
  BookOpen, 
  Tag,
  BarChart3,
  Settings,
  Users,
  FileText,
  Upload
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['agent', 'coach', 'admin'] },
    { id: 'quiz', label: 'Take Quiz', icon: Play, roles: ['agent', 'coach', 'admin'] },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['agent', 'coach', 'admin'] },
    { id: 'manage-questions', label: 'Questions', icon: FileText, roles: ['coach', 'admin'] },
    { id: 'manage-topics', label: 'Topics', icon: BookOpen, roles: ['coach', 'admin'] },
    { id: 'manage-categories', label: 'Categories', icon: Tag, roles: ['coach', 'admin'] },
    { id: 'quiz-import', label: 'Import Quizzes', icon: Upload, roles: ['admin'] },
    { id: 'analytics', label: 'Audit Log', icon: BarChart3, roles: ['coach', 'admin'] },
    { id: 'manage-users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'agent')
  );

  return (
    <nav className="w-64 bg-white border-r border-[#46494D]/20 p-4 h-full">
      <div className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-black text-white shadow-lg font-medium' 
                  : 'hover:bg-[#F5F5F5] text-[#212121] hover:text-black'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}