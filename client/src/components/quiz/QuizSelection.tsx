import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection } from '@/hooks/useFirestore';
import { useQuiz } from '@/context/QuizContext';
import { Quiz, Question } from '@shared/schema';
import { MapPin, Route, Globe, Clock, Target } from 'lucide-react';
import { query, where } from 'firebase/firestore';

const quizIcons = [MapPin, Route, Globe];

export function QuizSelection() {
  const { data: quizzes, loading } = useCollection<Quiz>('quizzes', [where('isActive', '==', true)]);
  const { setCurrentQuiz } = useQuiz();

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      // Get questions for this quiz
      const { data: questions } = await import('@/hooks/useFirestore').then(module => 
        module.useCollection<Question>('questions', [where('quizId', '==', quiz.id)])
      );

      if (questions.length === 0) {
        alert('This quiz has no questions yet. Please contact the administrator.');
        return;
      }

      setCurrentQuiz({
        quiz,
        questions: questions.slice(0, quiz.questionCount || questions.length),
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining: quiz.duration * 60, // Convert to seconds
        startTime: new Date(),
      });

      // Navigate to registration form or quiz interface
      window.location.hash = 'register';
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-quiz-selection-title">
          Choose Your Quiz
        </h2>
        <p className="text-xl text-muted-foreground">
          Test your destination design knowledge
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground" data-testid="text-no-quizzes-available">
              No quizzes are currently available. Please check back later.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const IconComponent = quizIcons[index % quizIcons.length];
            const bgColors = ['bg-primary', 'bg-secondary', 'bg-accent'];
            const bgColor = bgColors[index % bgColors.length];

            return (
              <Card 
                key={quiz.id} 
                className="hover:shadow-md transition-all cursor-pointer"
                data-testid={`card-quiz-${quiz.id}`}
              >
                <CardContent className="p-6">
                  <div className={`${bgColor} p-4 rounded-lg mb-4 inline-block`}>
                    <IconComponent className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-quiz-title-${quiz.id}`}>
                    {quiz.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 min-h-[48px]" data-testid={`text-quiz-description-${quiz.id}`}>
                    {quiz.description}
                  </p>
                  <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      <span data-testid={`text-quiz-questions-${quiz.id}`}>
                        {quiz.questionCount || 'Multiple'} Questions
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span data-testid={`text-quiz-duration-${quiz.id}`}>
                        {quiz.duration} Minutes
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full touch-button py-3 font-semibold hover:opacity-90 transition-all"
                    onClick={() => handleStartQuiz(quiz)}
                    data-testid={`button-start-quiz-${quiz.id}`}
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
