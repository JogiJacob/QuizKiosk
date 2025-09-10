import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Welcome back, admin! 🎉",
      });
      // Redirect to home page after successful login
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Oops! Login Failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-bounce delay-0"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-primary/20 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-success/20 rounded-full animate-bounce delay-1500"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="playful-button bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Card className="modern-card border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="gradient-bg w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="text-white h-10 w-10" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-foreground mb-3" data-testid="text-login-title">
                🛡️ Admin Portal 🛡️
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Sign in to manage your quizzes and analytics
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  📧 Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="text-lg p-6 pl-14 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  🔒 Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    className="text-lg p-6 pl-14 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full playful-button text-lg py-6 font-bold text-white transition-all",
                    "gradient-bg hover:scale-105 active:scale-95"
                  )}
                  disabled={loading}
                  data-testid="button-login"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚪 Sign In to Admin Panel
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                🔐 Secure admin access for quiz management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
