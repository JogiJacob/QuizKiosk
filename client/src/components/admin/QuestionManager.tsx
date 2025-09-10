import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollection, createDocument, updateDocument, deleteDocument } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { Quiz, Question, insertQuestionSchema } from '@shared/schema';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

export function QuestionManager() {
  const { data: quizzes } = useCollection<Quiz>('quizzes');
  const { data: questions, loading } = useCollection<Question>('questions');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    quizId: '',
    text: '',
    imageUrl: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });

  const resetForm = () => {
    setFormData({
      quizId: '',
      text: '',
      imageUrl: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Filter out empty options
      const validOptions = formData.options.filter(opt => opt.text.trim() !== '');
      
      // Ensure at least one correct answer
      const hasCorrectAnswer = validOptions.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        throw new Error('At least one option must be marked as correct');
      }

      const questionData = {
        ...formData,
        options: validOptions.map((opt, index) => ({
          id: `option_${Date.now()}_${index}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
        imageUrl: formData.imageUrl || undefined,
      };

      const validatedData = insertQuestionSchema.parse(questionData);
      
      if (editingQuestion) {
        await updateDocument('questions', editingQuestion.id, validatedData);
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        await createDocument('questions', validatedData);
        toast({
          title: "Success",
          description: "Question created successfully",
        });
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save question",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      quizId: question.quizId,
      text: question.text,
      imageUrl: question.imageUrl || '',
      options: [
        ...question.options,
        ...Array(4 - question.options.length).fill({ text: '', isCorrect: false })
      ].slice(0, 4),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (question: Question) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deleteDocument('questions', question.id);
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
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
          <CardTitle data-testid="text-question-management">Question Bank</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-new-question">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Create New Question'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz">Quiz</Label>
                  <Select value={formData.quizId} onValueChange={(value) => setFormData({ ...formData, quizId: value })}>
                    <SelectTrigger data-testid="select-quiz">
                      <SelectValue placeholder="Select a quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter your question"
                    required
                    data-testid="input-question-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-question-image"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Answer Options</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="flex-1"
                        data-testid={`input-option-${index}`}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={option.isCorrect}
                          onCheckedChange={(checked) => updateOption(index, 'isCorrect', checked as boolean)}
                          data-testid={`checkbox-correct-${index}`}
                        />
                        <Label className="text-sm">Correct</Label>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" data-testid="button-save-question">
                    {editingQuestion ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-question"
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
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-questions">
              No questions created yet. Add your first question to get started.
            </div>
          ) : (
            questions.map((question) => {
              const quiz = quizzes.find(q => q.id === question.quizId);
              const correctOption = question.options.find(opt => opt.isCorrect);
              
              return (
                <div key={question.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2" data-testid={`text-question-${question.id}`}>
                        {question.text}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quiz: {quiz?.title || 'Unknown'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {question.options.map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <span className="text-muted-foreground">
                              {String.fromCharCode(65 + index)})
                            </span>
                            <span className={option.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {option.text}
                            </span>
                            {option.isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(question)}
                        data-testid={`button-edit-question-${question.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(question)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-question-${question.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
