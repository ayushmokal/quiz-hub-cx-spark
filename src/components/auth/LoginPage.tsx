import { useState } from 'react';
import { Brain, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Make sure you're using the correct credentials.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        toast({
          title: "Google Sign-In Failed",
          description: "Please make sure you're using an @ultrahuman.com email address.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed", 
        description: error.message || "Google authentication failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="quiz-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-accent to-[hsl(267_100%_70%)] rounded-xl shadow-[var(--shadow-medium)]">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">CX Quiz Hub</h1>
            <p className="text-muted-foreground">Ultrahuman Customer Experience Training</p>
          </div>

          {/* Primary Sign-In Method */}
          <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-[hsl(267_100%_70%)]/10 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sign in with your Ultrahuman Google account
            </p>
          </div>

          {/* Google Sign-In */}
          <Button
            type="button"
            className="w-full quiz-button-primary mb-6 h-12"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Quick Access:</strong>
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between p-2 bg-background/50 rounded border">
                <span><strong>Admin:</strong> admin@ultrahuman.com</span>
                <span className="text-xs">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/50 rounded border">
                <span><strong>Coach:</strong> jaideep@ultrahuman.com</span>
                <span className="text-xs">Topic Management</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/50 rounded border">
                <span><strong>Agent:</strong> Any @ultrahuman.com email</span>
                <span className="text-xs">Quiz Access</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Users are auto-created on first login with Google. Roles are assigned based on email address.
                <br/><br/>
                <strong>Your email:</strong> ayush.mokal@ultrahuman.com → Admin role (Full Access)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}