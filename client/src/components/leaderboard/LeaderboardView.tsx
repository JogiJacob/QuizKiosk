import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/hooks/useFirestore';
import { Quiz, QuizSession } from '@shared/schema';
import { LeaderboardEntry } from '@/types/quiz';
import { Trophy, Download, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeaderboardView() {
  const { data: quizzes } = useCollection<Quiz>('quizzes');
  const { data: sessions, loading } = useCollection<QuizSession>('quizSessions');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (!sessions.length) return;

    // Filter sessions by selected quiz
    const filteredSessions = selectedQuizId === 'all' 
      ? sessions 
      : sessions.filter(s => s.quizId === selectedQuizId);

    // Convert sessions to leaderboard entries
    const entries: LeaderboardEntry[] = filteredSessions.map(session => {
      const quiz = quizzes.find(q => q.id === session.quizId);
      return {
        id: session.id,
        participantName: session.participantName,
        participantEmail: undefined, // Would need to join with participants collection
        participantOrganization: undefined, // Would need to join with participants collection
        quizTitle: quiz?.title || 'Unknown Quiz',
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
    const currentParticipant = sessionStorage.getItem('currentParticipant');
    if (currentParticipant) {
      const participant = JSON.parse(currentParticipant);
      const userEntry = entries.find(e => e.participantName === participant.name);
      setCurrentUserEntry(userEntry || null);
    }
  }, [sessions, quizzes, selectedQuizId]);

  const handleExport = () => {
    if (!leaderboardData.length) return;

    const csvData = [
      ['Rank', 'Name', 'Quiz', 'Score', 'Accuracy', 'Time', 'Date'],
      ...leaderboardData.map(entry => [
        entry.rank,
        entry.participantName,
        entry.quizTitle,
        `${entry.score}/${entry.totalQuestions}`,
        `${entry.accuracy}%`,
        formatTime(entry.timeUsed),
        entry.completedAt.toLocaleDateString(),
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${selectedQuizId === 'all' ? 'all-quizzes' : selectedQuizId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500";
      case 2: return "bg-gray-400";
      case 3: return "bg-orange-500";
      default: return "bg-primary";
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-leaderboard-title">
          Leaderboard
        </h2>
        <p className="text-muted-foreground">Top performers across all quizzes</p>
      </div>

      {/* Quiz Filter */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="font-medium text-foreground">Filter by Quiz:</label>
            <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
              <SelectTrigger className="w-[200px]" data-testid="select-quiz-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map(quiz => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle data-testid="text-rankings-title">Rankings</CardTitle>
            <Button 
              onClick={handleExport}
              variant="secondary"
              disabled={!leaderboardData.length}
              data-testid="button-export"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leaderboardData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground" data-testid="text-no-results">
              No quiz results found. Be the first to take a quiz!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Rank</th>
                    <th className="text-left p-4 font-semibold text-foreground">Participant</th>
                    <th className="text-left p-4 font-semibold text-foreground">Quiz</th>
                    <th className="text-left p-4 font-semibold text-foreground">Score</th>
                    <th className="text-left p-4 font-semibold text-foreground">Accuracy</th>
                    <th className="text-left p-4 font-semibold text-foreground">Time</th>
                    <th className="text-left p-4 font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry) => (
                    <tr
                      key={entry.id}
                      className={cn(
                        "border-b border-border hover:bg-muted/20 transition-colors",
                        currentUserEntry?.id === entry.id && "bg-accent/5 ring-2 ring-accent/20"
                      )}
                      data-testid={`row-participant-${entry.id}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3",
                            getRankBadgeColor(entry.rank)
                          )}>
                            {entry.rank}
                          </div>
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-foreground" data-testid={`text-participant-name-${entry.id}`}>
                            {entry.participantName}
                            {currentUserEntry?.id === entry.id && (
                              <span className="ml-2 text-accent font-normal">(You)</span>
                            )}
                          </div>
                          {entry.participantOrganization && (
                            <div className="text-sm text-muted-foreground">
                              {entry.participantOrganization}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-foreground" data-testid={`text-quiz-title-${entry.id}`}>
                        {entry.quizTitle}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-lg text-foreground" data-testid={`text-score-${entry.id}`}>
                          {entry.score}/{entry.totalQuestions}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-semibold",
                          entry.accuracy >= 90 ? "bg-green-100 text-green-700" :
                          entry.accuracy >= 70 ? "bg-blue-100 text-blue-700" :
                          entry.accuracy >= 50 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )} data-testid={`text-accuracy-${entry.id}`}>
                          {entry.accuracy}%
                        </span>
                      </td>
                      <td className="p-4 text-foreground" data-testid={`text-time-${entry.id}`}>
                        {formatTime(entry.timeUsed)}
                      </td>
                      <td className="p-4 text-muted-foreground" data-testid={`text-date-${entry.id}`}>
                        {entry.completedAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
