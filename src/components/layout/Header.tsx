import { Brain, LogOut, User, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-[#FF0000]';
      case 'coach': return 'text-[#FD9400]';
      case 'agent': return 'text-[#08a104]';
      default: return 'text-[#46494D]';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#46494D]/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="p-1.5 md:p-2 bg-gradient-to-r from-[#FF0000] to-[#FF4500] rounded-lg shadow-lg">
            <Brain className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-black">CX Ultra Quiz</h1>
            <p className="text-xs text-[#46494D] hidden sm:block">Personalised, Predictive, Proven</p>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full hover:bg-[#F5F5F5]">
              <Avatar className="h-9 w-9 md:h-10 md:w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-[#FF0000] to-[#FF4500] text-white text-sm font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-50 bg-white border-[#46494D]/20 shadow-xl rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-black">{user?.name}</p>
                <p className="text-xs leading-none text-[#46494D]">{user?.email}</p>
                <p className={`text-xs font-bold ${getRoleColor(user?.role || '')}`}>
                  {user?.role?.toUpperCase()}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#46494D]/10" />
            <DropdownMenuItem className="text-[#212121] hover:bg-[#F5F5F5] cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#212121] hover:bg-[#F5F5F5] cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#46494D]/10" />
            <DropdownMenuItem onClick={logout} className="text-[#FF0000] hover:bg-[#FF0000]/5 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}