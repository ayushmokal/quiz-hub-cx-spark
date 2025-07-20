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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#101010] to-[#212121]">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-[#FF0000] to-[#FF4500] rounded-2xl shadow-lg mb-4 mx-auto w-fit">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-[#FF0000] mx-auto" />
          <p className="text-white mt-2">Loading CX Ultra Quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#101010] to-[#212121] p-4">
      <div className="w-full max-w-md lg:max-w-lg">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-[#46494D]/20 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div className="p-3 md:p-4 bg-gradient-to-r from-[#FF0000] to-[#FF4500] rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">Welcome to CX Ultra Quiz</h1>
            <p className="text-[#46494D] text-base md:text-lg font-medium">Personalised, Predictive, Proven.</p>
            <p className="text-sm text-[#46494D]/70 mt-2">Ultrahuman Customer Experience Training Platform</p>
          </div>

          {/* Login Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 bg-[#F5F5F5] p-1 rounded-xl">
              <TabsTrigger 
                value="google" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="hidden sm:inline">Google</span>
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
            </TabsList>

            {/* Google Sign-In Tab */}
            <TabsContent value="google" className="space-y-4 md:space-y-6">
              <Alert className="border-[#08a104]/20 bg-[#08a104]/5">
                <CheckCircle className="h-4 w-4 text-[#08a104]" />
                <AlertDescription className="text-[#212121]">
                  <strong>Recommended:</strong> Sign in with your Ultrahuman Google account for seamless access.
                </AlertDescription>
              </Alert>

              <Button
                type="button"
                className="w-full bg-gradient-to-r from-[#FF0000] to-[#FF4500] hover:from-[#FF4500] hover:to-[#FD9400] text-white font-medium h-11 md:h-12 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
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
                <p className="text-sm text-[#46494D]">
                  Use your <strong>@ultrahuman.com</strong> email address
                </p>
              </div>
            </TabsContent>

            {/* Email/Password Sign-In Tab */}
            <TabsContent value="email" className="space-y-4 md:space-y-6">
              <Alert className="border-[#037ffc]/20 bg-[#037ffc]/5">
                <AlertCircle className="h-4 w-4 text-[#037ffc]" />
                <AlertDescription className="text-[#212121]">
                  Use this for admin-created accounts. If you have an @ultrahuman.com email, you can also use Google sign-in instead.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#212121] font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#46494D]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@ultrahuman.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-[#46494D]/20 focus:border-[#FF0000] focus:ring-[#FF0000]/20 rounded-xl h-11 md:h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#212121] font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#46494D]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-[#46494D]/20 focus:border-[#FF0000] focus:ring-[#FF0000]/20 rounded-xl h-11 md:h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#212121] to-[#46494D] hover:from-[#46494D] hover:to-[#212121] text-white font-medium h-11 md:h-12 text-sm md:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isSubmitting || !email || !password}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
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
  );
}