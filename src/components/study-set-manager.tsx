"use client";

/**
 * Study Set Manager Component
 * 
 * This component allows users to create and manage custom study sets
 * by selecting specific questions or topics.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Domain, Question } from '@/lib/types';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

interface StudySetManagerProps {
  questions: Question[];
  userId: string;
}

interface StudySet {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
}

export default function StudySetManager({ questions, userId }: StudySetManagerProps) {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [selectedStudySet, setSelectedStudySet] = useState<StudySet | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Filter questions based on selected domain and difficulty
  const filteredQuestions = questions.filter(question => {
    const domainMatch = filterDomain === 'all' || question.domain === filterDomain;
    const difficultyMatch = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    return domainMatch && difficultyMatch;
  });

  // Handle creating a new study set
  const handleCreateStudySet = () => {
    if (!newSetName.trim()) return;

    const newStudySet: StudySet = {
      id: `set-${Date.now()}`,
      name: newSetName,
      description: newSetDescription,
      questionIds: selectedQuestions
    };

    setStudySets([...studySets, newStudySet]);
    resetForm();
  };

  // Handle updating an existing study set
  const handleUpdateStudySet = () => {
    if (!selectedStudySet || !newSetName.trim()) return;

    const updatedStudySets = studySets.map(set => 
      set.id === selectedStudySet.id 
        ? { ...set, name: newSetName, description: newSetDescription, questionIds: selectedQuestions }
        : set
    );

    setStudySets(updatedStudySets);
    resetForm();
  };

  // Handle deleting a study set
  const handleDeleteStudySet = (id: string) => {
    setStudySets(studySets.filter(set => set.id !== id));
    if (selectedStudySet?.id === id) {
      setSelectedStudySet(null);
    }
  };

  // Handle selecting a study set for editing
  const handleEditStudySet = (studySet: StudySet) => {
    setSelectedStudySet(studySet);
    setNewSetName(studySet.name);
    setNewSetDescription(studySet.description);
    setSelectedQuestions(studySet.questionIds);
    setIsEditing(true);
  };

  // Reset form state
  const resetForm = () => {
    setNewSetName('');
    setNewSetDescription('');
    setSelectedQuestions([]);
    setSelectedStudySet(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  // Handle question selection
  const handleQuestionSelection = (checked: boolean, questionId: string) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    }
  };

  // Handle selecting all questions
  const handleSelectAll = () => {
    setSelectedQuestions(filteredQuestions.map(q => q.id));
  };

  // Handle deselecting all questions
  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Study Sets</CardTitle>
              <CardDescription>Create and manage custom study sets</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setIsCreating(true); resetForm(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Set
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Study Set' : 'Create New Study Set'}</DialogTitle>
                  <DialogDescription>
                    {isEditing 
                      ? 'Update your study set details and selected questions.' 
                      : 'Create a custom study set by selecting specific questions or topics.'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={newSetName} 
                      onChange={(e) => setNewSetName(e.target.value)} 
                      placeholder="e.g., AWS CloudFormation Questions"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newSetDescription} 
                      onChange={(e) => setNewSetDescription(e.target.value)} 
                      placeholder="Describe what this study set focuses on"
                    />
                  </div>
                  
                  <div className="grid gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Select Questions</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Label htmlFor="domain-filter" className="mb-2 block">Filter by Domain</Label>
                        <Select 
                          value={filterDomain} 
                          onValueChange={setFilterDomain}
                        >
                          <SelectTrigger id="domain-filter">
                            <SelectValue placeholder="Select Domain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            {Object.values(Domain).map(domain => (
                              <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1">
                        <Label htmlFor="difficulty-filter" className="mb-2 block">Filter by Difficulty</Label>
                        <Select 
                          value={filterDifficulty} 
                          onValueChange={setFilterDifficulty}
                        >
                          <SelectTrigger id="difficulty-filter">
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                      <div className="space-y-2">
                        {filteredQuestions.map(question => (
                          <div key={question.id} className="flex items-start space-x-3 py-2 border-b">
                            <Checkbox
                              id={`question-${question.id}`}
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={(checked) => 
                                handleQuestionSelection(checked as boolean, question.id)
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={`question-${question.id}`}
                                className="text-sm font-medium leading-tight"
                              >
                                {question.text.length > 100 
                                  ? `${question.text.substring(0, 100)}...` 
                                  : question.text}
                              </Label>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>{question.domain}</span>
                                <span>•</span>
                                <span>{question.difficulty}</span>
                                {question.isMultipleAnswer && (
                                  <>
                                    <span>•</span>
                                    <span>Multiple Answers</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button 
                    onClick={isEditing ? handleUpdateStudySet : handleCreateStudySet}
                    disabled={!newSetName.trim() || selectedQuestions.length === 0}
                  >
                    {isEditing ? 'Update Set' : 'Create Set'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {studySets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven't created any study sets yet.</p>
              <Button 
                onClick={() => { setIsCreating(true); }}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Study Set
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studySets.map(studySet => (
                <Card key={studySet.id} className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{studySet.name}</CardTitle>
                    <CardDescription>
                      {studySet.questionIds.length} questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {studySet.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditStudySet(studySet)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteStudySet(studySet.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
