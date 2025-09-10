import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useFirestore';
import { QuizManager } from './QuizManager';
import { QuestionManager } from './QuestionManager';
import { Quiz, QuizSession, Question } from '@shared/schema';
import { QuizStats } from '@/types/quiz';
import { BarChart3, BookOpen, Users, Target, LogOut } from 'lucide-react';

export function AdminDashboard() {
  const { logout } = useAuth();
  const { data: quizzes } = useCollection<Quiz>('quizzes');
  const { data: questions } = useCollection<Question>('questions');
  const { data: sessions } = useCollection<QuizSession>('quizSessions');

  const stats: QuizStats = {
    totalQuizzes: quizzes.length,
    totalQuestions: questions.length,
    totalParticipants: new Set(sessions.map(s => s.participantName)).size,
    avgScore: sessions.length > 0 
      ? Math.round((sessions.reduce((sum, s) => sum + (s.score / s.totalQuestions * 100), 0) / sessions.length))
      : 0,
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    bgColor = "bg-primary/10",
    iconColor = "text-primary" 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    bgColor?: string;
    iconColor?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon className={`${iconColor} h-6 w-6`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-admin-title">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Manage quizzes, questions, and view analytics</p>
        </div>
        <Button 
          onClick={logout} 
          variant="outline"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={BookOpen}
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Active Questions"
          value={stats.totalQuestions}
          icon={Target}
          bgColor="bg-secondary/10"
          iconColor="text-secondary"
        />
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
          bgColor="bg-accent/10"
          iconColor="text-accent"
        />
        <StatCard
          title="Avg. Score"
          value={`${stats.avgScore}%`}
          icon={BarChart3}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <QuizManager />
        <QuestionManager />
      </div>
    </div>
  );
}
