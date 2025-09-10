import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuiz } from '@/context/QuizContext';
import { createDocument } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { insertParticipantSchema } from '@shared/schema';
import { UserPlus } from 'lucide-react';

export function RegistrationForm() {
  const { currentQuiz } = useQuiz();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
      const validatedData = insertParticipantSchema.parse(formData);
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
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-primary h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-registration-title">
              Join the Leaderboard
            </h2>
            <p className="text-muted-foreground">
              Enter your details to save your score (optional)
            </p>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Selected Quiz: {currentQuiz.quiz.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentQuiz.questions.length} questions • {currentQuiz.quiz.duration} minutes
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="text-lg p-4"
                required
                data-testid="input-participant-name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="text-lg p-4"
                  data-testid="input-participant-email"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="text-lg p-4"
                  data-testid="input-participant-phone"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organization" className="text-sm font-medium text-foreground mb-2">
                Organization (Optional)
              </Label>
              <Input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Company or organization name"
                className="text-lg p-4"
                data-testid="input-participant-organization"
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1 touch-button py-4 font-semibold text-lg hover:opacity-90 transition-all"
                disabled={loading}
                data-testid="button-register-and-start"
              >
                {loading ? "Registering..." : "Register & Start Quiz"}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                className="flex-1 touch-button py-4 font-semibold text-lg hover:opacity-90 transition-all"
                onClick={handleSkipRegistration}
                data-testid="button-skip-registration"
              >
                Skip Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
