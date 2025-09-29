import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Settings,
  Play,
  Trophy,
  Gamepad2,
  Target,
  Zap,
  Star,
  Sparkles,
  Flame,
  Users,
  Crown,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { QuizSelection } from "@/components/quiz/QuizSelection";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { cn } from "@/lib/utils";

type ViewMode = "home" | "admin" | "quiz" | "leaderboard";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();
  const { user } = useAuth();

  // Handle leaderboard navigation with quiz ID from session storage
  useEffect(() => {
    const applyNavigateToQuiz = (id?: string) => {
      const quizId = id || sessionStorage.getItem("navigateToQuizLeaderboard");
      if (quizId) {
        setSelectedQuizId(quizId);
        setCurrentView("leaderboard");
        sessionStorage.removeItem("navigateToQuizLeaderboard");
      }
    };

    // Apply on initial load
    applyNavigateToQuiz();

    // Listen for hash changes to support #leaderboard navigation
    const onHashChange = () => {
      if (window.location.hash.startsWith("#leaderboard")) {
        applyNavigateToQuiz();
      }
    };

    // Listen for custom navigation events
    const onCustomNavigate = (e: CustomEvent) => {
      applyNavigateToQuiz(e.detail);
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("navigate-leaderboard", onCustomNavigate as any);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener(
        "navigate-leaderboard",
        onCustomNavigate as any,
      );
    };
  }, []);

  const NavButton = ({
    mode,
    icon: Icon,
    children,
    className = "",
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
        className,
      )}
      data-testid={`button-${mode}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gaming Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full animate-bounce delay-0"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full animate-pulse delay-300"></div>

          {/* Floating Gaming Icons */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 animate-bounce delay-200">
            <Gamepad2 className="w-12 h-12 text-purple-400/50" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-spin">
            <Target
              className="w-10 h-10 text-cyan-400/50"
              style={{ animationDuration: "8s" }}
            />
          </div>
          <div className="absolute bottom-1/4 left-1/5 animate-pulse">
            <Zap className="w-14 h-14 text-yellow-400/50" />
          </div>
          <div className="absolute top-3/4 right-1/5 animate-bounce delay-1000">
            <Star className="w-8 h-8 text-pink-400/50" />
          </div>
        </div>
        {/* Dynamic grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-black/20 backdrop-blur-md border-b border-white/10 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="gradient-bg p-4 rounded-2xl shadow-lg">
              <Gamepad2 className="text-white h-8 w-8" />
            </div>
            <h1
              className="text-3xl font-black text-white drop-shadow-lg"
              data-testid="text-app-title"
            >
              🎮 Destination Designers Quiz
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* Admin access - discrete in header only */}
            {user ? (
              <Button
                onClick={() => setCurrentView("admin")}
                className="touch-button px-4 py-2 font-semibold transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm"
                data-testid="button-admin-panel"
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => (window.location.href = "/admin/login")}
                className="touch-button px-4 py-2 font-semibold transition-all bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm"
                data-testid="button-admin-login"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {currentView === "home" && (
          <div className="min-h-screen flex flex-col p-6">
            {/* Animated Marquee Text - Full Width at Top */}
            <div className="w-full overflow-hidden mb-8 bg-black/80 rounded-lg p-4">
            <div className="whitespace-nowrap marquee text-3xl font-black animate-pulse text-white">
            🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟 FREE TO PLAY • TEST YOUR KNOWLEDGE • WIN BIG PRIZES • UNLIMITED FUN • JOIN NOW! 🌟
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">

              <div className="max-w-6xl mx-auto text-center">
                {/* Gaming Hero Section */}
                <div className="mb-16">
                  <div className="relative inline-block mb-8">
                    <div className="gradient-bg w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                      <Crown className="text-white h-16 w-16" />
                    </div>
                    <div
                      className="absolute -top-2 -right-2 animate-spin"
                      style={{ animationDuration: "3s" }}
                    >
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 animate-bounce">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>

                  <h2
                    className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-6 animate-in slide-in-from-top-4"
                    data-testid="text-welcome-title"
                  >
                    <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                      FREE QUIZ FUN!
                    </span>
                    <br />
                    <span className="text-white animate-bounce">CONQUER & WIN</span>
                  </h2>

                  <p className="text-2xl text-white/90 mb-12 drop-shadow-lg animate-in slide-in-from-top-6">
                    🎯 This quiz is FREE for you to try! Challenge yourself, conquer the questions, and climb to the top!
                  </p>

                </div>

                {/* Gaming Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Take Quiz Card */}
                  <Card
                    className="group modern-card border-0 shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md border-2 border-purple-400/30 hover:border-purple-400/60"
                    onClick={() => setCurrentView("quiz")}
                    data-testid="card-take-quiz"
                  >
                    <CardContent className="p-10 text-center">
                      <div className="relative mb-6">
                        <div className="gradient-bg w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:animate-pulse">
                          <Rocket className="text-white h-10 w-10 group-hover:animate-bounce" />
                        </div>
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Sparkles
                            className="w-6 h-6 text-yellow-400 animate-spin"
                            style={{ animationDuration: "2s" }}
                          />
                        </div>
                      </div>

                      <h3 className="text-3xl font-black text-blue-600 mb-4 group-hover:text-purple-200 transition-colors">
                        🚀 START QUEST
                      </h3>
                      <p className="text-lg text-yellow-600/80 group-hover:text-purple-200 transition-colors">
                        FREE quiz adventure awaits! Conquer questions and become a legend!
                      </p>

                      <div className="mt-6">
                        <Button className="playful-button gradient-bg text-white font-bold px-8 py-3 text-lg hover:scale-105 transition-all shadow-lg">
                          <Play className="mr-2 h-5 w-5" />
                          Begin Adventure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Leaderboard Card */}
                  <Card
                    className="group modern-card border-0 shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-md border-2 border-cyan-400/30 hover:border-cyan-400/60"
                    onClick={() => {
                      setSelectedQuizId(undefined); // Reset quiz selection
                      setCurrentView("leaderboard");
                    }}
                    data-testid="card-leaderboard"
                  >
                    <CardContent className="p-10 text-center">
                      <div className="relative mb-6">
                        <div className="gradient-bg-secondary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:animate-pulse">
                          <Trophy className="text-white h-10 w-10 group-hover:animate-bounce" />
                        </div>
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                      </div>

                      <h3 className="text-3xl font-black text-blue-600 mb-4 group-hover:text-cyan-200 transition-colors">
                        🏆 HALL OF FAME
                      </h3>
                      <p className="text-lg text-blue-600/80 group-hover:text-purple-200 transition-colors">
                        See the champions! FREE to join, unlimited glory awaits!
                      </p>

                      <div className="mt-6">
                        <Button className="playful-button gradient-bg-secondary text-white font-bold px-8 py-3 text-lg hover:scale-105 transition-all shadow-lg">
                          <Users className="mr-2 h-5 w-5" />
                          View Champions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gaming Stats/Info */}
                <div className="mt-12 text-center">
                  <p className="text-white text-2xl animate-pulse drop-shadow-2xl font-bold">
                    🌟 FREE QUIZ • UNLIMITED FUN • TEST YOUR SKILLS • JOIN THE EXCITEMENT NOW! 🌟
                  </p>
                  <p className="text-cyan-300 text-lg font-semibold mt-6 drop-shadow-lg">
                    Powered by Destination Designers
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "admin" && user && <AdminDashboard />}
        {currentView === "quiz" && <QuizSelection />}
        {currentView === "leaderboard" && (
          <LeaderboardView 
            initialQuizId={selectedQuizId} 
            onNavigateHome={() => setCurrentView("home")}
          />
        )}
      </main>
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .marquee {
            animation: marquee 10s linear infinite;
            will-change: transform;
          }
        `}
      </style>
    </div>
  );
}