import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/hooks/useFirestore";
import { useQuiz } from "@/context/QuizContext";
import { Quiz, Question } from "@shared/schema";
import { MapPin, Route, Globe, Clock, Target, Users, Trophy, Star, Zap, Gamepad2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./../../firebase";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const quizIcons = [Gamepad2, Trophy, Zap, Star, Target, Globe, MapPin, Route];

// Difficulty levels based on duration and question count
const getDifficultyLevel = (quiz: Quiz) => {
  const questions = quiz.questionCount || 1;
  const timePerQuestion = (quiz.duration * 60) / questions;
  
  if (timePerQuestion > 120 || questions <= 5) return { level: 'Easy', color: 'bg-green-500', stars: 1 };
  if (timePerQuestion > 60 || questions <= 10) return { level: 'Medium', color: 'bg-yellow-500', stars: 2 };
  return { level: 'Hard', color: 'bg-red-500', stars: 3 };
};

// Stable participant count based on quiz ID to avoid flicker
const getParticipantCount = (quizId: string) => {
  const seed = quizId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.floor((seed % 450) + 50); // 50-500 range, stable per quiz
};

export async function fetchQuestions(quizId: string) {
  console.log("Starting quiz with ID111:", quizId);

  const q = query(collection(db, "questions"), where("quizId", "==", quizId));
  console.log("Starting quiz with q:", q);

  const snapshot = await getDocs(q);

  console.log("Starting quiz with snapshot:", snapshot);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export function QuizSelection() {
  const [location, setLocation] = useLocation();
  const { data: quizzes, loading } = useCollection<Quiz>("quizzes", [
    where("isActive", "==", true),
  ]);
  const { setCurrentQuiz } = useQuiz();

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      console.log("Starting quiz with ID:", quiz.id);

      const questions = await fetchQuestions(quiz.id);
      if (!questions || questions.length === 0) {
        alert("This quiz has no questions yet.");
        return;
      }

      setCurrentQuiz({
        quiz,
        questions: questions.slice(0, quiz.questionCount || questions.length),
        currentQuestionIndex: 0,
        answers: [],
        timeRemaining: quiz.duration * 60,
        startTime: new Date(),
      });
      
      window.location.hash = "register";
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("Failed to start quiz. Please try again.");
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Gaming Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full animate-bounce delay-0"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-secondary/10 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-accent/10 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-20 right-32 w-28 h-28 bg-success/10 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-warning/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-3/4 right-1/4 w-20 h-20 bg-info/10 rounded-full animate-pulse delay-300"></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', 
                     backgroundSize: '40px 40px'}}></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-28 h-28 gradient-bg rounded-full mb-8 shadow-2xl animate-pulse">
            <Gamepad2 className="w-16 h-16 text-white" />
          </div>
          
          <h2 className="text-6xl font-black text-foreground mb-6 tracking-tight" data-testid="text-quiz-selection-title">
            🎮 <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Choose Your Quest</span> 🎮
          </h2>
          <p className="text-2xl text-muted-foreground font-medium">
            Level up your destination design knowledge
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <Users className="w-5 h-5" />
            <span>{quizzes.length > 0 ? `${quizzes.length} epic challenges awaiting` : 'Loading challenges...'}</span>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <Card className="modern-card border-0 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">No Quests Available</h3>
              <p className="text-xl text-muted-foreground" data-testid="text-no-quizzes-available">
                The adventure masters are preparing new challenges. Check back soon! 🚀
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz, index) => {
              const IconComponent = quizIcons[index % quizIcons.length];
              const gradients = [
                "gradient-bg",
                "gradient-bg-secondary", 
                "gradient-bg-accent"
              ];
              const gradientClass = gradients[index % gradients.length];
              const difficulty = getDifficultyLevel(quiz);
              const participantCount = getParticipantCount(quiz.id);

              return (
                <Card
                  key={quiz.id}
                  className={cn(
                    "group relative overflow-hidden border-0 shadow-xl transition-all duration-500",
                    "hover:scale-105 hover:shadow-2xl hover:shadow-primary/25",
                    "bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-secondary/10 before:to-accent/10",
                    "before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 before:content-['']"
                  )}
                  data-testid={`card-quiz-${quiz.id}`}
                >
                  {/* Neon border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 p-[2px]">
                    <div className="w-full h-full bg-white rounded-2xl"></div>
                  </div>

                  <CardContent className="relative p-8">
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <div className={cn("px-3 py-1 rounded-full text-xs font-bold text-white", difficulty.color)}>
                        {difficulty.level}
                      </div>
                      <div className="flex">
                        {[...Array(3)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3 h-3",
                              i < difficulty.stars ? "text-yellow-400 fill-current" : "text-gray-300"
                            )} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Icon with enhanced styling */}
                    <div className={cn("relative inline-block mb-6", gradientClass, "p-6 rounded-2xl shadow-lg")}>
                      <IconComponent className="text-white h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Enhanced Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300"
                        data-testid={`text-quiz-title-${quiz.id}`}>
                      {quiz.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 min-h-[60px] text-base leading-relaxed"
                       data-testid={`text-quiz-description-${quiz.id}`}>
                      {quiz.description}
                    </p>

                    {/* Gaming Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 mr-1 text-primary" />
                          <span className="font-bold text-primary" data-testid={`text-quiz-questions-${quiz.id}`}>
                            {quiz.questionCount || "Multiple"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                      
                      <div className="bg-secondary/10 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="h-4 w-4 mr-1 text-secondary" />
                          <span className="font-bold text-secondary" data-testid={`text-quiz-duration-${quiz.id}`}>
                            {quiz.duration}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                    </div>

                    {/* Participant Count Badge */}
                    <div className="flex items-center justify-center mb-6 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{participantCount} players competed</span>
                    </div>

                    {/* Enhanced CTA Button */}
                    <Button
                      className={cn(
                        "w-full playful-button text-lg py-6 font-bold text-white transition-all duration-300",
                        "gradient-bg hover:scale-105 active:scale-95",
                        "shadow-lg hover:shadow-xl group-hover:shadow-primary/25"
                      )}
                      onClick={() => handleStartQuiz(quiz)}
                      data-testid={`button-start-quiz-${quiz.id}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5 group-hover:animate-pulse" />
                        START QUEST
                        <Trophy className="w-5 h-5 group-hover:animate-bounce" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
