import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection } from "@/hooks/useFirestore";
import { Quiz, QuizSession } from "@shared/schema";
import { LeaderboardEntry } from "@/types/quiz";
import {
  Trophy,
  Download,
  Medal,
  Award,
  Crown,
  Star,
  Zap,
  Target,
  Clock,
  Home,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardViewProps {
  initialQuizId?: string;
  onNavigateHome?: () => void;
}

export function LeaderboardView({ initialQuizId, onNavigateHome }: LeaderboardViewProps = {}) {
  const { data: quizzes } = useCollection<Quiz>("quizzes");
  const { data: sessions, loading } =
    useCollection<QuizSession>("quizSessions");
  const [selectedQuizId, setSelectedQuizId] = useState<string>(initialQuizId || "all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );

  // React to prop changes to handle runtime navigation
  useEffect(() => {
    if (initialQuizId) {
      setSelectedQuizId(initialQuizId);
    }
  }, [initialQuizId]);
  const [currentUserEntry, setCurrentUserEntry] =
    useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (!sessions.length) return;

    // Filter sessions by selected quiz
    const filteredSessions =
      selectedQuizId === "all"
        ? sessions
        : sessions.filter((s) => s.quizId === selectedQuizId);

    // Convert sessions to leaderboard entries
    const entries: LeaderboardEntry[] = filteredSessions.map((session) => {
      const quiz = quizzes.find((q) => q.id === session.quizId);
      return {
        id: session.id,
        participantName: session.participantName,
        participantEmail: undefined, // Would need to join with participants collection
        participantOrganization: undefined, // Would need to join with participants collection
        quizTitle: quiz?.title || "Unknown Quiz",
        score: session.score,
        totalQuestions: session.totalQuestions,
        accuracy: Math.round((session.score / session.totalQuestions) * 100),
        timeUsed: session.timeUsed,
        completedAt: session.completedAt,
        rank: 0, // Will be set below
      };
    });

    // Sort by score (desc), then by time (asc) for ties
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeUsed - b.timeUsed;
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboardData(entries);

    // Find current user's entry (from session storage)
    const currentParticipant = sessionStorage.getItem("currentParticipant");
    if (currentParticipant) {
      const participant = JSON.parse(currentParticipant);
      const userEntry = entries.find(
        (e) => e.participantName === participant.name,
      );
      setCurrentUserEntry(userEntry || null);
    }
  }, [sessions, quizzes, selectedQuizId]);

  const handleExport = () => {
    if (!leaderboardData.length) return;

    const csvData = [
      ["Rank", "Name", "Quiz", "Score", "Accuracy", "Time", "Date"],
      ...leaderboardData.map((entry) => [
        entry.rank,
        entry.participantName,
        entry.quizTitle,
        `${entry.score}/${entry.totalQuestions}`,
        `${entry.accuracy}%`,
        formatTime(entry.timeUsed),
        entry.completedAt.toLocaleDateString(),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard-${selectedQuizId === "all" ? "all-quizzes" : selectedQuizId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading leaderboard...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header Section with Decorative Elements */}
      <div className="relative">
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-16 h-16 bg-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-secondary/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-accent/10 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          {/* Back Button */}
          {onNavigateHome && (
            <div className="absolute top-4 left-4">
              <Button 
                onClick={onNavigateHome}
                variant="outline" 
                className="bg-white/20 backdrop-blur-md border-white/30 text-foreground hover:bg-white/40 transition-all duration-300 shadow-lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          )}
          
          {/* Modern Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 gradient-bg rounded-full mb-6 shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2
              className="text-5xl font-bold text-foreground mb-4"
              data-testid="text-leaderboard-title"
            >
              🏆 Hall of Fame 🏆
            </h2>
            <p className="text-xl text-muted-foreground">
              Celebrating our destination design champions!
            </p>
          </div>

          {/* Quiz Filter Card */}
          <Card className="modern-card mb-8 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  <label className="text-lg font-semibold text-foreground">
                    Filter by Quiz:
                  </label>
                </div>
                <Select
                  value={selectedQuizId}
                  onValueChange={setSelectedQuizId}
                >
                  <SelectTrigger
                    className="w-[280px] h-12 rounded-2xl border-2 border-muted focus:border-primary transition-colors"
                    data-testid="select-quiz-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌟 All Quizzes</SelectItem>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        📚 {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="modern-card border-0 shadow-xl overflow-hidden">
            <CardHeader className="gradient-bg-secondary text-white p-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8" />
                  <CardTitle
                    className="text-3xl font-bold"
                    data-testid="text-rankings-title"
                  >
                    Top Performers
                  </CardTitle>
                </div>
                <Button
                  onClick={handleExport}
                  variant="secondary"
                  disabled={!leaderboardData.length}
                  className="playful-button bg-white text-primary hover:bg-white/90"
                  data-testid="button-export"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboardData.length === 0 ? (
                <div className="p-16 text-center" data-testid="text-no-results">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    No Champions Yet!
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Be the first to take a quiz and claim your spot! 🚀
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-6">
                  {leaderboardData.slice(0, 3).map((entry, index) => (
                    // Top 3 Special Cards
                    <div
                      key={entry.id}
                      className={cn(
                        "relative overflow-hidden rounded-3xl p-6 transition-all hover:scale-[1.02]",
                        index === 0 && "gradient-bg text-white shadow-2xl",
                        index === 1 &&
                          "gradient-bg-secondary text-white shadow-xl",
                        index === 2 &&
                          "gradient-bg-accent text-white shadow-lg",
                        currentUserEntry?.id === entry.id &&
                          "ring-4 ring-accent/50",
                      )}
                      data-testid={`row-participant-${entry.id}`}
                    >
                      {/* Podium number */}
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            #{entry.rank}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          {getRankIcon(entry.rank)}
                          <div>
                            <h3
                              className="text-2xl font-bold flex items-center gap-2"
                              data-testid={`text-participant-name-${entry.id}`}
                            >
                              {entry.participantName}
                              {currentUserEntry?.id === entry.id && (
                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                  (You)
                                </span>
                              )}
                            </h3>
                            {entry.participantOrganization && (
                              <p className="text-white/80 text-lg">
                                {entry.participantOrganization}
                              </p>
                            )}
                            <p
                              className="text-white/90"
                              data-testid={`text-quiz-title-${entry.id}`}
                            >
                              📚 {entry.quizTitle}
                            </p>
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-8">
                          <div className="text-center">
                            <div
                              className="text-3xl font-bold"
                              data-testid={`text-score-${entry.id}`}
                            >
                              {entry.score}/{entry.totalQuestions}
                            </div>
                            <div className="text-white/80 text-sm">Score</div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              data-testid={`text-accuracy-${entry.id}`}
                            >
                              {entry.accuracy}%
                            </div>
                            <div className="text-white/80 text-sm">
                              Accuracy
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-xl font-bold flex items-center gap-1"
                              data-testid={`text-time-${entry.id}`}
                            >
                              <Clock className="w-5 h-5" />
                              {formatTime(entry.timeUsed)}
                            </div>
                            <div className="text-white/80 text-sm">Time</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Remaining entries in clean list format */}
                  {leaderboardData.slice(3).map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-all",
                        currentUserEntry?.id === entry.id &&
                          "ring-2 ring-accent/30 bg-accent/5",
                      )}
                      data-testid={`row-participant-${entry.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-bold text-lg text-foreground">
                            #{entry.rank}
                          </div>
                          <div>
                            <h4
                              className="text-lg font-semibold text-foreground flex items-center gap-2"
                              data-testid={`text-participant-name-${entry.id}`}
                            >
                              {entry.participantName}
                              {currentUserEntry?.id === entry.id && (
                                <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                                  (You)
                                </span>
                              )}
                            </h4>
                            {entry.participantOrganization && (
                              <p className="text-muted-foreground">
                                {entry.participantOrganization}
                              </p>
                            )}
                            <p
                              className="text-sm text-muted-foreground"
                              data-testid={`text-quiz-title-${entry.id}`}
                            >
                              {entry.quizTitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div
                              className="text-xl font-bold text-foreground"
                              data-testid={`text-score-${entry.id}`}
                            >
                              {entry.score}/{entry.totalQuestions}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Score
                            </div>
                          </div>
                          <div>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-sm font-semibold",
                                entry.accuracy >= 90
                                  ? "bg-success/20 text-success"
                                  : entry.accuracy >= 70
                                    ? "bg-info/20 text-info"
                                    : entry.accuracy >= 50
                                      ? "bg-warning/20 text-warning"
                                      : "bg-destructive/20 text-destructive",
                              )}
                              data-testid={`text-accuracy-${entry.id}`}
                            >
                              {entry.accuracy}%
                            </span>
                          </div>
                          <div
                            className="text-sm text-muted-foreground"
                            data-testid={`text-time-${entry.id}`}
                          >
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatTime(entry.timeUsed)}
                          </div>
                          <div
                            className="text-xs text-muted-foreground"
                            data-testid={`text-date-${entry.id}`}
                          >
                            {entry.completedAt
                              ? new Date(entry.completedAt).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
