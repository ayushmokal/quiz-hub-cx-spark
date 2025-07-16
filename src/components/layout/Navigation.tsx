import { 
  Home, 
  Play, 
  Trophy, 
  BookOpen, 
  BarChart3,
  Settings,
  Users,
  FileText
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
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['coach', 'admin'] },
    { id: 'manage-users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'agent')
  );

  return (
    <nav className="w-64 bg-card border-r border-border p-4">
      <div className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive 
                  ? 'bg-gradient-to-r from-accent to-[hsl(267_100%_70%)] text-white shadow-[var(--shadow-soft)]' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}