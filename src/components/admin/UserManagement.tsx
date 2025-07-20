import { useState, useEffect } from 'react';
import { Users, Search, Mail, Calendar, Award, TrendingUp, MoreHorizontal, Shield, UserX, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { usersAPI, dashboardAPI } from '../../services/api';
import { User, UserRole } from '../../types';
import { CreateUser } from './CreateUser';

interface UserWithStats extends User {
  totalPoints: number;
  overallAccuracy: number;
  totalQuizzes: number;
  currentStreak: number;
  lastActivity: string;
  bestCategory: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      console.log('👥 Loading users...');
      const allUsers = await usersAPI.getUsers();
      
      // Get stats for each user
      const usersWithStats = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const stats = await dashboardAPI.getUserDashboardStats(user.id);
            return {
              ...user,
              totalPoints: stats.totalPoints || 0,
              overallAccuracy: stats.overallAccuracy || 0,
              totalQuizzes: stats.weeklyQuizzes || 0, // Use weeklyQuizzes as fallback
              currentStreak: stats.currentStreak || 0,
              lastActivity: 'Recent', // Placeholder - we don't have this field
              bestCategory: stats.topCategory || 'No quizzes yet' // Use topCategory
            };
          } catch (error) {
            console.error(`Error loading stats for user ${user.id}:`, error);
            return {
              ...user,
              totalPoints: 0,
              overallAccuracy: 0,
              totalQuizzes: 0,
              currentStreak: 0,
              lastActivity: 'Never',
              bestCategory: 'No quizzes yet'
            };
          }
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Sort by total points (descending)
    filtered.sort((a, b) => b.totalPoints - a.totalPoints);

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await usersAPI.updateUser(userId, { role: newRole });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      console.log(`Updated user ${userId} role to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Users className="h-3 w-3 mr-1" />Agent</Badge>;
      case 'coach':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Award className="h-3 w-3 mr-1" />Coach</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="quiz-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and view performance analytics
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Role filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedRole === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('all')}
                size="sm"
              >
                All Users
              </Button>
              <Button
                variant={selectedRole === 'admin' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('admin')}
                size="sm"
              >
                Admins
              </Button>
              <Button
                variant={selectedRole === 'agent' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('agent')}
                size="sm"
              >
                Agents
              </Button>
              <Button
                variant={selectedRole === 'coach' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('coach')}
                size="sm"
              >
                Coaches
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              +{users.filter(u => u.role === 'agent').length} agents
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <p className="text-xs text-muted-foreground">
              Administrator accounts
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.totalQuizzes > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with quiz attempts
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.overallAccuracy, 0) / users.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Platform average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="quiz-card">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Complete list of users with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Quizzes</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Best Category</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{user.totalPoints.toLocaleString()}</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className={`font-medium ${getAccuracyColor(user.overallAccuracy)}`}>
                      {user.overallAccuracy}%
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{user.totalQuizzes}</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{user.currentStreak}</div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {user.bestCategory}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">{formatDate(user.lastActivity)}</div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role !== 'admin' ? (
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'admin')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'agent')}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Make Agent
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'coach' && (
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'coach')}
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Make Coach
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria' : 'No users match the selected filters'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUser
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onUserCreated={loadUsers}
      />
    </div>
  );
}
