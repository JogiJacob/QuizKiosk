import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, createDocument, updateDocument, deleteQuizAndLeaderboard, clearLeaderboardForQuiz } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { Quiz, insertQuizSchema } from '@shared/schema';
import { Plus, Edit, Trash2, Eraser } from 'lucide-react';

export function QuizManager() {
  const { data: quizzes, loading } = useCollection<Quiz>('quizzes');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 10,
    isActive: true,
    customSuccessMessage: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 10,
      isActive: true,
      customSuccessMessage: '',
    });
    setEditingQuiz(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = insertQuizSchema.parse(formData);
      
      if (editingQuiz) {
        await updateDocument('quizzes', editingQuiz.id, validatedData);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else {
        await createDocument('quizzes', validatedData);
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      isActive: quiz.isActive,
      customSuccessMessage: quiz.customSuccessMessage || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm('Are you sure you want to delete this quiz and its leaderboard?')) return;
    
    try {
      await deleteQuizAndLeaderboard(quiz.id);
      toast({
        title: "Success",
        description: "Quiz and its leaderboard deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quiz and leaderboard",
        variant: "destructive",
      });
    }
  };

  const handleClearLeaderboard = async (quiz: Quiz) => {
    if (!confirm('Are you sure you want to clear all leaderboard entries for this quiz?')) return;
    try {
      const deletedCount = await clearLeaderboardForQuiz(quiz.id);
      toast({
        title: "Leaderboard cleared",
        description: `${deletedCount} entries removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear leaderboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-quiz-management">Quiz Management</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-new-quiz">
                <Plus className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter quiz title"
                    required
                    data-testid="input-quiz-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter quiz description"
                    required
                    data-testid="input-quiz-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customSuccessMessage">Custom 100% Success Message (Optional)</Label>
                  <Textarea
                    id="customSuccessMessage"
                    value={formData.customSuccessMessage}
                    onChange={(e) => setFormData({ ...formData, customSuccessMessage: e.target.value })}
                    placeholder="E.g., 'Wow, you're a genius!'"
                    data-testid="input-quiz-custom-success-message"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="1"
                    required
                    data-testid="input-quiz-duration"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" data-testid="button-save-quiz">
                    {editingQuiz ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-quiz"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-quizzes">
              No quizzes created yet. Create your first quiz to get started.
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-semibold text-foreground" data-testid={`text-quiz-title-${quiz.id}`}>
                    {quiz.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {quiz.duration} min timer • {quiz.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(quiz)}
                    data-testid={`button-edit-quiz-${quiz.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleClearLeaderboard(quiz)}
                    data-testid={`button-clear-leaderboard-${quiz.id}`}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(quiz)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-quiz-${quiz.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}