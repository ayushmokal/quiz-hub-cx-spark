import { useState } from 'react';
import { Brain, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('google');
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="p-4 bg-black rounded-2xl shadow-lg mb-4 mx-auto w-fit">
            <img src="/assets/icon_ultraquiz.png" alt="CX Ultra Quiz" className="h-10 w-10" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
          <p className="text-white mt-2">Loading CX Ultra Quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl shadow-lg">
                <img src="/assets/icon_ultraquiz.png" alt="CX Ultra Quiz" className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Welcome to CX Ultra Quiz</h1>
            <p className="text-gray-600 text-lg font-medium">Personalised, Predictive, Proven.</p>
            <p className="text-sm text-gray-500 mt-2">Ultrahuman Customer Experience Training Platform</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Google Sign-In (Primary) */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    <strong>Recommended:</strong> Sign in with your Ultrahuman Google account for seamless access.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-black hover:bg-gray-800 text-white font-medium h-12 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Use your <strong>@ultrahuman.com</strong> email address
              </p>
            </div>

            {/* Alternative Email Login */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">
                      Use this for admin-created accounts. If you have an @ultrahuman.com email, you can also use Google sign-in instead.
                    </p>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="google" 
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    Google
                  </TabsTrigger>
                  <TabsTrigger 
                    value="email" 
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@ultrahuman.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-black focus:ring-black/20 rounded-xl h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-black focus:ring-black/20 rounded-xl h-12"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gray-900 hover:bg-black text-white font-medium h-12 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isSubmitting || !email || !password}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Sign in with Email
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}