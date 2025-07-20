import { useState } from 'react';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { adminAPI } from '../../services/admin-api';
import type { UserRole } from '../../types';

interface CreateUserProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  notes?: string;
}

export function CreateUser({ isOpen, onClose, onUserCreated }: CreateUserProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    name: '',
    role: 'agent',
    department: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [K in keyof CreateUserData]?: string }>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: { [K in keyof CreateUserData]?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@ultrahuman.com')) {
      newErrors.email = 'Email must be from @ultrahuman.com domain';
    }

    if (!formData.password) {
      newErrors.password = 'Password field is required (for admin reference only)';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters (for admin reference)';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the admin API to create the user record
      await adminAPI.createUser(formData);
      
      toast({
        title: "User Created Successfully",
        description: `${formData.name} can now sign in immediately using their email (${formData.email}) and the generated password, or via Google OAuth with their @ultrahuman.com account.`,
        duration: 8000,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'agent',
        department: '',
        notes: ''
      });
      setErrors({});
      
      onUserCreated();
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error Creating User",
        description: error.message || "Failed to create user record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'agent',
        department: '',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Full system access, user management, and admin features';
      case 'coach':
        return 'Can manage topics, view reports, and access coaching features';
      case 'agent':
        return 'Basic access to take quizzes and view personal stats';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account. The user will be able to log in immediately using either their email/password credentials or their @ultrahuman.com Google account.
            <br /><br />
            <strong>Note:</strong> The user can access the system right away with the generated password, or they can use Google OAuth instead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@ultrahuman.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Temporary Password (Admin Reference)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generatePassword}
                className="h-auto p-1 text-xs"
              >
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter temporary password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This password is for admin reference only. Users will authenticate via Google OAuth.
            </p>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">
                  <div className="flex flex-col items-start">
                    <span>Agent</span>
                    <span className="text-xs text-muted-foreground">
                      Basic quiz access
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="coach">
                  <div className="flex flex-col items-start">
                    <span>Coach</span>
                    <span className="text-xs text-muted-foreground">
                      Topic management + reports
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Full system access
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {formData.role && (
              <p className="text-sm text-muted-foreground">
                {getRoleDescription(formData.role)}
              </p>
            )}
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              type="text"
              placeholder="e.g. Customer Experience, Support"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this user..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
