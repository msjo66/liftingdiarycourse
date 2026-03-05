"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addExerciseToWorkoutAction } from "../actions";

interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface AddExerciseDialogProps {
  workoutId: string;
  exercises: Exercise[];
}

export function AddExerciseDialog({ workoutId, exercises }: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return exercises;
    const lower = search.toLowerCase();
    return exercises.filter((e) => e.name.toLowerCase().includes(lower));
  }, [exercises, search]);

  async function handleSelect(exerciseId: string) {
    setAdding(exerciseId);
    await addExerciseToWorkoutAction(workoutId, exerciseId);
    setAdding(null);
    setOpen(false);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Exercise</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">No exercises found.</p>
          )}
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex justify-between items-center disabled:opacity-50"
              onClick={() => handleSelect(exercise.id)}
              disabled={adding === exercise.id}
            >
              <span>{exercise.name}</span>
              <span className="text-muted-foreground text-xs">{exercise.category}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
