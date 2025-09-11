import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/context/QuizContext';
import { createDocument } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { insertQuizSessionSchema } from '@shared/schema';
import { Trophy, Target, Clock, RotateCcw, Award } from 'lucide-react';

export function QuizCompletion() {
  const { currentQuiz, setCurrentQuiz } = useQuiz();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('quizResults');
    const participant = sessionStorage.getItem('currentParticipant');
    
    if (savedResults && participant && currentQuiz) {
      const parsedResults = JSON.parse(savedResults);
      const parsedParticipant = JSON.parse(participant);
      
      setResults({
        ...parsedResults,
        participant: parsedParticipant,
        percentage: Math.round((parsedResults.score / parsedResults.totalQuestions) * 100),
      });

      // Save to Firestore
      saveQuizSession(parsedResults, parsedParticipant);
    }
  }, [currentQuiz]);

  const saveQuizSession = async (results: any, participant: any) => {
    if (!currentQuiz || saving) return;
    
    setSaving(true);
    try {
      const sessionData = {
        quizId: currentQuiz.quiz.id,
        participantId: participant.id,
        participantName: participant.name,
        score: results.score,
        totalQuestions: results.totalQuestions,
        timeUsed: results.timeUsed,
        answers: results.answers,
      };

      const validatedData = insertQuizSessionSchema.parse(sessionData);
      await createDocument('quizSessions', validatedData);
      
      toast({
        title: "Results saved!",
        description: "Your score has been added to the leaderboard.",
      });
    } catch (error: any) {
      console.error('Error saving quiz session:', error);
      toast({
        title: "Warning",
        description: "Your quiz was completed but results could not be saved to the leaderboard.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewLeaderboard = () => {
    if (currentQuiz?.quiz.id) {
      // Store the quiz ID for the leaderboard to auto-select
      sessionStorage.setItem('navigateToQuizLeaderboard', currentQuiz.quiz.id);
      // Trigger navigation with hash change and custom event
      window.location.hash = '#leaderboard';
      window.dispatchEvent(new CustomEvent('navigate-leaderboard', { detail: currentQuiz.quiz.id }));
    }
  };

  const handleTakeAnother = () => {
    setCurrentQuiz(null);
    sessionStorage.removeItem('quizResults');
    sessionStorage.removeItem('currentParticipant');
    window.location.hash = '';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!results) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Loading results...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent!", color: "bg-green-100 text-green-700" };
    if (percentage >= 70) return { text: "Good Job!", color: "bg-blue-100 text-blue-700" };
    if (percentage >= 50) return { text: "Not Bad!", color: "bg-yellow-100 text-yellow-700" };
    return { text: "Keep Learning!", color: "bg-red-100 text-red-700" };
  };

  const badge = getScoreBadge(results.percentage);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="gradient-bg w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-white h-12 w-12" />
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-completion-title">
            Quiz Completed!
          </h2>
          
          <div className={`inline-block px-4 py-2 rounded-full mb-6 ${badge.color}`}>
            <Award className="inline mr-2 h-4 w-4" />
            {badge.text}
          </div>
          
          <p className="text-xl text-muted-foreground mb-8">
            Great job, {results.participant.name}! Here are your results:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="text-final-score">
                {results.score}/{results.totalQuestions}
              </div>
              <div className="text-muted-foreground flex items-center justify-center">
                <Target className="mr-2 h-4 w-4" />
                Correct Answers
              </div>
            </div>
            
            <div className="bg-muted/30 p-6 rounded-xl">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(results.percentage)}`} data-testid="text-percentage">
                {results.percentage}%
              </div>
              <div className="text-muted-foreground flex items-center justify-center">
                <Award className="mr-2 h-4 w-4" />
                Accuracy
              </div>
            </div>
            
            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="text-3xl font-bold text-accent mb-2" data-testid="text-time-used">
                {formatTime(results.timeUsed)}
              </div>
              <div className="text-muted-foreground flex items-center justify-center">
                <Clock className="mr-2 h-4 w-4" />
                Time Used
              </div>
            </div>
          </div>

          {results.participant.organization && (
            <p className="text-sm text-muted-foreground mb-6">
              Representing: {results.participant.organization}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="touch-button px-8 py-4 font-semibold hover:opacity-90 transition-all"
              onClick={handleViewLeaderboard}
              data-testid="button-view-leaderboard"
            >
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
            <Button
              variant="secondary"
              className="touch-button px-8 py-4 font-semibold hover:opacity-90 transition-all"
              onClick={handleTakeAnother}
              data-testid="button-take-another"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Take Another Quiz
            </Button>
          </div>

          {saving && (
            <p className="text-sm text-muted-foreground mt-4">
              Saving your results to the leaderboard...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
