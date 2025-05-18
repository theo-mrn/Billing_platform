"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, ArrowRight, Brain, PenLine, BookOpen, Folder } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { createFlashcard, deleteFlashcard, updateFlashcard, updateFlashcardProgress } from "@/app/_actions/flashcards";
import { createDeck, deleteDeck, getProjectDecks, updateDeck } from "@/app/_actions/decks";

interface Deck {
  id: string;
  name: string;
  description?: string;
  flashcards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  deckId: string;
  progress?: FlashcardProgress[];
}

interface FlashcardProgress {
  id: string;
  userId: string;
  flashcardId: string;
  lastReviewed: Date;
  nextReview: Date;
  easeFactor: number;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FlashcardFormProps {
  initialData?: Flashcard;
  onSubmit: (data: Flashcard) => void;
  onCancel: () => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      question,
      answer,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: initialData?.projectId || "",
      deckId: initialData?.deckId || "",
      progress: initialData?.progress,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="question" className="text-sm font-medium">
          Question
        </label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          required
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="answer" className="text-sm font-medium">
          Answer
        </label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer"
          required
          className="min-h-[100px]"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  flashcard,
  onEdit,
  onDelete,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Flashcard</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(flashcard.id)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this flashcard? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(flashcard.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div className="mb-4 flex-grow">
          <p className="font-medium">Question:</p>
          <p className="mt-1 text-muted-foreground">{flashcard.question}</p>
        </div>
        {showAnswer ? (
          <div className="mt-auto">
            <p className="font-medium">Answer:</p>
            <p className="mt-1 text-muted-foreground">{flashcard.answer}</p>
          </div>
        ) : (
          <div className="mt-auto flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAnswer(true)}
              className="w-full"
            >
              Show Answer
            </Button>
          </div>
        )}
      </CardContent>
      {showAnswer && (
        <CardFooter className="pt-0 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnswer(false)}
          >
            Hide Answer
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

interface StudySessionStats {
  total: number;
  failed: number;
  hard: number;
  good: number;
  completed: boolean;
}

interface StudyCardProps {
  flashcard: Flashcard;
  onNext: (quality: number) => void;
  onMarkDifficulty: (id: string, quality: number) => void;
  sessionStats: StudySessionStats;
}

const StudyCard: React.FC<StudyCardProps> = ({
  flashcard,
  onNext,
  onMarkDifficulty,
  sessionStats,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleResponse = (quality: number) => {
    onMarkDifficulty(flashcard.id, quality);
    setShowAnswer(false);
    onNext(quality);
  };

  if (sessionStats.completed) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Session terminée !</CardTitle>
          <CardDescription>
            Voici vos résultats pour cette session d&apos;étude
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-600">Difficile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{sessionStats.failed}</p>
                <p className="text-sm text-red-600/70">cartes</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-yellow-600">À revoir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{sessionStats.hard}</p>
                <p className="text-sm text-yellow-600/70">cartes</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-green-600">Maîtrisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{sessionStats.good}</p>
                <p className="text-sm text-green-600/70">cartes</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted-foreground mb-4">
              Score total : {Math.round((sessionStats.good / sessionStats.total) * 100)}%
            </p>
            <Button onClick={() => window.location.reload()}>
              Recommencer la session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Study Mode</CardTitle>
        <CardDescription>
          Review your flashcards and rate how well you remembered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Question:</h3>
          <p>{flashcard.question}</p>
        </div>

        {!showAnswer ? (
          <Button
            className="w-full"
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-2">Answer:</h3>
              <p>{flashcard.answer}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-center">How well did you know this?</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  onClick={() => handleResponse(0)}
                >
                  Failed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-950/30"
                  onClick={() => handleResponse(3)}
                >
                  Hard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
                  onClick={() => handleResponse(5)}
                >
                  Good
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {showAnswer && (
          <Button variant="ghost" onClick={() => setShowAnswer(false)}>
            Hide Answer
          </Button>
        )}
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => {
            setShowAnswer(false);
            onNext(0);
          }}
        >
          Skip <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const DeckForm: React.FC<{
  initialData?: Deck;
  onSubmit: (data: { name: string; description?: string }) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter deck description"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

interface PrismaDeck {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  flashcards: Flashcard[];
}

const FlashcardManager: React.FC = () => {
  const params = useParams();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeckDialogOpen, setIsDeckDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>(undefined);
  const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [studySessionStats, setStudySessionStats] = useState<StudySessionStats>({
    total: 0,
    failed: 0,
    hard: 0,
    good: 0,
    completed: false,
  });

  const convertToDeck = (deck: PrismaDeck): Deck => ({
    id: deck.id,
    name: deck.name,
    description: deck.description || undefined,
    flashcards: deck.flashcards,
    createdAt: deck.createdAt instanceof Date ? deck.createdAt : new Date(deck.createdAt),
    updatedAt: deck.updatedAt instanceof Date ? deck.updatedAt : new Date(deck.updatedAt),
  });

  const loadDecks = useCallback(async () => {
    try {
      const { decks: projectDecks } = await getProjectDecks(params.id as string);
      setDecks(projectDecks.map(convertToDeck));
      if (projectDecks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(projectDecks[0].id);
      }
    } catch (err) {
      console.error('Failed to load decks:', err);
      toast.error('Failed to load decks');
    }
  }, [params.id, selectedDeckId]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleCreateDeck = async (data: { name: string; description?: string }) => {
    try {
      const { deck } = await createDeck(params.id as string, data);
      setDecks([...decks, convertToDeck(deck)]);
      setIsDeckDialogOpen(false);
      toast.success('Deck created successfully!');
    } catch (err) {
      console.error('Error creating deck:', err);
      toast.error('Failed to create deck');
    }
  };

  const handleUpdateDeck = async (data: { name: string; description?: string }) => {
    try {
      if (!editingDeck) return;
      const { deck } = await updateDeck(params.id as string, editingDeck.id, data);
      setDecks(decks.map(d => d.id === deck.id ? convertToDeck(deck) : d));
      setEditingDeck(undefined);
      toast.success('Deck updated successfully!');
    } catch (err) {
      console.error('Error updating deck:', err);
      toast.error('Failed to update deck');
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await deleteDeck(params.id as string, id);
      setDecks(decks.filter(d => d.id !== id));
      if (selectedDeckId === id) {
        setSelectedDeckId(decks[0]?.id || null);
      }
      toast.success('Deck deleted successfully!');
    } catch (err) {
      console.error('Error deleting deck:', err);
      toast.error('Failed to delete deck');
    }
  };

  const handleCreateFlashcard = async (data: Flashcard) => {
    try {
      if (!selectedDeckId) {
        toast.error('Please select a deck first');
        return;
      }

      const { flashcard: newCard } = await createFlashcard(
        params.id as string,
        selectedDeckId,
        {
          question: data.question.trim(),
          answer: data.answer.trim(),
        }
      );
      
      setDecks(decks.map(deck => 
        deck.id === selectedDeckId
          ? { ...deck, flashcards: [...deck.flashcards, newCard] }
          : deck
      ));
      setIsDialogOpen(false);
      toast.success('Flashcard created successfully!');
    } catch (err) {
      console.error('Error creating flashcard:', err);
      toast.error(err instanceof Error ? err.message : 'Error creating flashcard');
    }
  };

  const handleUpdateFlashcard = async (data: Flashcard) => {
    try {
      const { flashcard: updatedCard } = await updateFlashcard(params.id as string, data.id, {
        question: data.question.trim(),
        answer: data.answer.trim(),
      });

      setDecks(decks.map(deck => 
        deck.id === updatedCard.deckId
          ? { ...deck, flashcards: deck.flashcards.map(card => card.id === updatedCard.id ? updatedCard : card) }
          : deck
      ));
      setEditingCard(undefined);
      toast.success('Flashcard updated successfully!');
    } catch (err) {
      console.error('Error updating flashcard:', err);
      toast.error('Failed to update flashcard');
    }
  };

  const handleDeleteFlashcard = async (id: string, deckId: string) => {
    try {
      await deleteFlashcard(params.id as string, id);
      setDecks(decks.map(deck => 
        deck.id === deckId
          ? { ...deck, flashcards: deck.flashcards.filter(card => card.id !== id) }
          : deck
      ));
      toast.success('Flashcard deleted successfully!');
    } catch (err) {
      console.error('Error deleting flashcard:', err);
      toast.error('Failed to delete flashcard');
    }
  };

  const handleMarkDifficulty = async (id: string, quality: number) => {
    try {
      await updateFlashcardProgress(params.id as string, id, quality);
      
      // Update session stats
      setStudySessionStats(prev => {
        const newStats = { ...prev };
        if (quality === 0) newStats.failed++;
        else if (quality === 3) newStats.hard++;
        else if (quality === 5) newStats.good++;
        return newStats;
      });

      toast.success('Progress updated successfully!');
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Failed to update progress');
    }
  };

  const handleEditFlashcard = (id: string) => {
    const card = decks.flatMap(deck => deck.flashcards).find((c) => c.id === id);
    if (card) {
      setEditingCard(card);
    }
  };

  const getProgressStats = () => {
    const allFlashcards = decks.flatMap(deck => deck.flashcards);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewedToday = allFlashcards.filter(card => 
      card.progress?.some(p => {
        const reviewDate = new Date(p.lastReviewed);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === today.getTime();
      })
    ).length;

    const masteredCards = allFlashcards.filter(card =>
      card.progress?.some(p => p.easeFactor >= 2.5 && p.interval >= 21)
    ).length;

    const masteryPercentage = allFlashcards.length > 0
      ? Math.round((masteredCards / allFlashcards.length) * 100)
      : 0;

    const needsReview = allFlashcards.filter(card =>
      card.progress?.some(p => new Date(p.nextReview) <= new Date())
    ).length;

    const wellKnown = allFlashcards.filter(card =>
      card.progress?.some(p => p.easeFactor >= 2.5)
    ).length;

    const learning = allFlashcards.filter(card =>
      card.progress?.some(p => p.easeFactor >= 1.3 && p.easeFactor < 2.5)
    ).length;

    const difficult = allFlashcards.filter(card =>
      card.progress?.some(p => p.easeFactor < 1.3)
    ).length;

    const notStudied = allFlashcards.filter(card =>
      !card.progress || card.progress.length === 0
    ).length;

    return {
      reviewedToday,
      masteryPercentage,
      needsReview,
      wellKnown,
      learning,
      difficult,
      notStudied,
      totalCards: allFlashcards.length,
    };
  };

  const stats = getProgressStats();
  const currentDeck = selectedDeckId ? decks.find(d => d.id === selectedDeckId) : null;
  const currentFlashcards = currentDeck?.flashcards || [];
  const filteredFlashcards = currentFlashcards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNextCard = (quality: number) => {
    // Update session stats based on quality
    if (quality === 0) {
      setStudySessionStats(prev => ({ ...prev, failed: prev.failed + 1 }));
    } else if (quality === 3) {
      setStudySessionStats(prev => ({ ...prev, hard: prev.hard + 1 }));
    } else if (quality === 5) {
      setStudySessionStats(prev => ({ ...prev, good: prev.good + 1 }));
    }

    const nextIndex = currentStudyIndex + 1;
    if (nextIndex >= currentFlashcards.length) {
      // Session completed
      setStudySessionStats(prev => ({
        ...prev,
        total: currentFlashcards.length,
        completed: true,
      }));
    } else {
      setCurrentStudyIndex(nextIndex);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Flashcard Manager</h1>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1">
          <select
            className="w-full p-2 border rounded-md"
            value={selectedDeckId || ""}
            onChange={(e) => setSelectedDeckId(e.target.value || null)}
          >
            <option value="">Select a Deck</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name} ({deck.flashcards.length} cards)
              </option>
            ))}
          </select>
        </div>
        <Dialog open={isDeckDialogOpen} onOpenChange={setIsDeckDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Folder className="mr-2 h-4 w-4" /> Create Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <DeckForm
              onSubmit={handleCreateDeck}
              onCancel={() => setIsDeckDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        {selectedDeckId && (
          <>
            <Button onClick={() => currentDeck && setEditingDeck(currentDeck)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Deck
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Deck
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this deck? This will also delete all flashcards in this deck.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteDeck(selectedDeckId)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {editingDeck && (
        <Dialog open={!!editingDeck} onOpenChange={() => setEditingDeck(undefined)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deck</DialogTitle>
            </DialogHeader>
            <DeckForm
              initialData={editingDeck}
              onSubmit={handleUpdateDeck}
              onCancel={() => setEditingDeck(undefined)}
            />
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            <span>My Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Study</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            {selectedDeckId && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Create Flashcard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Flashcard</DialogTitle>
                  </DialogHeader>
                  <FlashcardForm
                    onSubmit={handleCreateFlashcard}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!selectedDeckId ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Please select a deck or create a new one to manage flashcards.
              </p>
              <Button
                onClick={() => setIsDeckDialogOpen(true)}
                variant="outline"
                className="mx-auto"
              >
                <Folder className="mr-2 h-4 w-4" /> Create Deck
              </Button>
            </div>
          ) : filteredFlashcards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No flashcards found in this deck. Create your first flashcard to get started!
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Flashcard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map((card) => (
                <FlashcardItem
                  key={card.id}
                  flashcard={card}
                  onEdit={handleEditFlashcard}
                  onDelete={(id) => handleDeleteFlashcard(id, card.deckId)}
                />
              ))}
            </div>
          )}

          {editingCard && (
            <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(undefined)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Flashcard</DialogTitle>
                </DialogHeader>
                <FlashcardForm
                  initialData={editingCard}
                  onSubmit={handleUpdateFlashcard}
                  onCancel={() => setEditingCard(undefined)}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="study">
          {!selectedDeckId ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Please select a deck to start studying.
              </p>
            </div>
          ) : currentFlashcards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No flashcards to study in this deck. Create some flashcards first!
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Flashcard
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-muted-foreground">
                  Card {currentStudyIndex + 1} of {currentFlashcards.length}
                </p>
              </div>
              <StudyCard
                flashcard={currentFlashcards[currentStudyIndex]}
                onNext={handleNextCard}
                onMarkDifficulty={handleMarkDifficulty}
                sessionStats={studySessionStats}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Flashcard Statistics</CardTitle>
              <CardDescription>
                Track your progress and see how well you&apos;re doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Cards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.totalCards}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Reviewed Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.reviewedToday}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Needs Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.needsReview}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Learning Progress</h3>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {stats.totalCards > 0 ? (
                      <>
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(stats.wellKnown / stats.totalCards) * 100}%` }}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${(stats.learning / stats.totalCards) * 100}%` }}
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(stats.difficult / stats.totalCards) * 100}%` }}
                        />
                        <div 
                          className="bg-gray-300" 
                          style={{ width: `${(stats.notStudied / stats.totalCards) * 100}%` }}
                        />
                      </>
                    ) : (
                      <div className="bg-gray-300 w-full" />
                    )}
                  </div>
                  <div className="flex text-sm justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Well Known: {stats.wellKnown}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Learning: {stats.learning}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Difficult: {stats.difficult}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <span>Not Studied: {stats.notStudied}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Decks Overview</h3>
                  <div className="grid gap-2">
                    {decks.map(deck => (
                      <Card key={deck.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{deck.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {deck.flashcards.length} cards
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDeckId(deck.id)}
                          >
                            View Deck
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlashcardManager; 