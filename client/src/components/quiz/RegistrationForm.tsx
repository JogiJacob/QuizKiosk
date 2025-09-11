import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuiz } from '@/context/QuizContext';
import { createDocument } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { insertParticipantSchema } from '@shared/schema';
import { UserPlus, Sparkles, Trophy, Star, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RegistrationForm() {
  const { currentQuiz } = useQuiz();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuiz) return;

    setLoading(true);
    try {
      // Normalize empty strings to undefined for optional fields
      const normalizedData = {
        ...formData,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        organization: formData.organization.trim() || undefined,
      };
      const validatedData = insertParticipantSchema.parse(normalizedData);
      const participantRef = await createDocument('participants', validatedData);
      
      // Store participant info in session storage for the quiz
      sessionStorage.setItem('currentParticipant', JSON.stringify({
        id: participantRef.id,
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
      }));

      // Navigate to quiz interface
      window.location.hash = 'quiz';
      
      toast({
        title: "Registration successful!",
        description: "You're ready to start the quiz.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRegistration = () => {
    if (!currentQuiz) return;
    
    // Store anonymous participant
    sessionStorage.setItem('currentParticipant', JSON.stringify({
      id: null,
      name: 'Anonymous User',
      email: '',
      organization: '',
    }));

    // Navigate to quiz interface
    window.location.hash = 'quiz';
  };

  if (!currentQuiz) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No quiz selected. Please go back and select a quiz.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-bounce delay-0"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-secondary/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-primary/20 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-success/20 rounded-full animate-bounce delay-1500"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="modern-card border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="gradient-bg w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <UserPlus className="text-white h-10 w-10" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-foreground mb-3" data-testid="text-registration-title">
                🎮 Let's Get Started! 🎮
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Just your name to jump in, or add details to join the leaderboard!
              </p>
              
              {/* Quiz Info Card */}
              <div className="glass-card p-6 rounded-3xl border mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-accent" />
                  <p className="text-lg font-semibold text-foreground">
                    {currentQuiz.quiz.title}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {currentQuiz.questions.length} questions
                  </span>
                  <span>•</span>
                  <span>{currentQuiz.quiz.duration} minutes</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input - Always Visible */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  ✨ What's your name?
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Just your first name is fine!"
                  className="text-lg p-6 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                  required
                  data-testid="input-participant-name"
                />
              </div>
              
              {/* Expandable Details Section */}
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-center gap-2 py-4 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-details"
                >
                  <Users className="w-5 h-5" />
                  {showDetails ? 'Hide Details' : 'Want to join the leaderboard?'}
                  {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
                
                {showDetails && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        📧 Add your contact details to appear on the leaderboard and get updates!
                      </p>
                    </div>
                    
                    {/* Optional Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-lg font-semibold text-foreground flex items-center gap-2">
                          📧 Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          className="text-lg p-6 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                          data-testid="input-participant-email"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-lg font-semibold text-foreground flex items-center gap-2">
                          📱 Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="text-lg p-6 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                          data-testid="input-participant-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="organization" className="text-lg font-semibold text-foreground flex items-center gap-2">
                        🏢 Organization
                      </Label>
                      <Input
                        id="organization"
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Your amazing company or school"
                        className="text-lg p-6 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                        data-testid="input-participant-organization"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  className={cn(
                    "flex-1 playful-button text-lg py-6 font-bold text-white transition-all",
                    "gradient-bg hover:scale-105 active:scale-95"
                  )}
                  disabled={loading || !formData.name.trim()}
                  data-testid="button-start-quiz"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚀 Start Quiz
                    </span>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className={cn(
                    "flex-1 playful-button text-lg py-6 font-bold border-2 transition-all",
                    "hover:scale-105 active:scale-95 bg-white hover:bg-muted"
                  )}
                  onClick={handleSkipRegistration}
                  data-testid="button-start-as-guest"
                >
                  <span className="flex items-center gap-2">
                    👤 Start as Guest
                  </span>
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                🎯 Ready to test your skills? No hassles, just fun!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
