import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Settings, Play, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { QuizSelection } from '@/components/quiz/QuizSelection';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { cn } from '@/lib/utils';

type ViewMode = 'home' | 'admin' | 'quiz' | 'leaderboard';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();
  const { user } = useAuth();

  // Handle leaderboard navigation with quiz ID from session storage
  useEffect(() => {
    const applyNavigateToQuiz = (id?: string) => {
      const quizId = id || sessionStorage.getItem('navigateToQuizLeaderboard');
      if (quizId) {
        setSelectedQuizId(quizId);
        setCurrentView('leaderboard');
        sessionStorage.removeItem('navigateToQuizLeaderboard');
      }
    };

    // Apply on initial load
    applyNavigateToQuiz();

    // Listen for hash changes to support #leaderboard navigation
    const onHashChange = () => {
      if (window.location.hash.startsWith('#leaderboard')) {
        applyNavigateToQuiz();
      }
    };

    // Listen for custom navigation events
    const onCustomNavigate = (e: CustomEvent) => {
      applyNavigateToQuiz(e.detail);
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('navigate-leaderboard', onCustomNavigate as any);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('navigate-leaderboard', onCustomNavigate as any);
    };
  }, []);

  const NavButton = ({ 
    mode, 
    icon: Icon, 
    children, 
    className = "" 
  }: { 
    mode: ViewMode; 
    icon: React.ElementType; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <Button
      onClick={() => setCurrentView(mode)}
      className={cn(
        "touch-button min-h-12 min-w-[120px] font-semibold transition-all",
        currentView === mode 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        className
      )}
      data-testid={`button-${mode}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-3 rounded-xl">
              <GraduationCap className="text-primary-foreground h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-title">
              Destination Designers Quiz
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <NavButton mode="admin" icon={Settings}>
                Admin Panel
              </NavButton>
            ) : (
              <Button
                onClick={() => window.location.href = '/admin/login'}
                className="touch-button min-h-12 min-w-[120px] font-semibold transition-all bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-admin-login"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            )}
            <NavButton mode="quiz" icon={Play}>
              Take Quiz
            </NavButton>
            <NavButton mode="leaderboard" icon={Trophy}>
              Leaderboard
            </NavButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="gradient-bg w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="text-white h-12 w-12" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-welcome-title">
                Welcome to Destination Designers Quiz
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Test your knowledge of destination design principles and sustainable tourism practices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setCurrentView('quiz')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 p-4 rounded-lg mb-4 inline-block">
                    <Play className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Take a Quiz</h3>
                  <p className="text-muted-foreground">
                    Challenge yourself with interactive quizzes on destination design topics
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setCurrentView('leaderboard')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-secondary/10 p-4 rounded-lg mb-4 inline-block">
                    <Trophy className="text-secondary h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">View Leaderboard</h3>
                  <p className="text-muted-foreground">
                    See how you rank against other destination design enthusiasts
                  </p>
                </CardContent>
              </Card>

              {user ? (
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setCurrentView('admin')}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-accent/10 p-4 rounded-lg mb-4 inline-block">
                      <Settings className="text-accent h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Admin Panel</h3>
                    <p className="text-muted-foreground">
                      Manage quizzes, questions, and view analytics
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => window.location.href = '/admin/login'}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-accent/10 p-4 rounded-lg mb-4 inline-block">
                      <Settings className="text-accent h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Admin Login</h3>
                    <p className="text-muted-foreground">
                      Sign in to manage quizzes, questions, and view analytics
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentView === 'admin' && user && <AdminDashboard />}
        {currentView === 'quiz' && <QuizSelection />}
        {currentView === 'leaderboard' && <LeaderboardView initialQuizId={selectedQuizId} />}
      </main>
    </div>
  );
}
