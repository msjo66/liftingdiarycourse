"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { removeWorkoutExerciseAction, addSetAction } from "../actions";

interface SetData {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
  weightUnit: 'lbs' | 'kg';
}

interface ExerciseCardProps {
  workoutExerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  sets: SetData[];
}

export function ExerciseCard({ workoutExerciseId, exerciseName, exerciseCategory, sets }: ExerciseCardProps) {
  const [removing, setRemoving] = useState(false);
  const [addingSet, setAddingSet] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await removeWorkoutExerciseAction(workoutExerciseId);
  }

  async function handleAddSet() {
    setAddingSet(true);
    await addSetAction(workoutExerciseId, null, null, 'lbs');
    setAddingSet(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{exerciseName}</CardTitle>
          <Badge variant="secondary">{exerciseCategory}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRemove} disabled={removing}>
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {sets.map((set) => (
          <SetRow
            key={set.id}
            setId={set.id}
            setNumber={set.setNumber}
            initialReps={set.reps}
            initialWeight={set.weight}
            initialWeightUnit={set.weightUnit}
          />
        ))}
        <Button size="sm" variant="outline" onClick={handleAddSet} disabled={addingSet}>
          {addingSet ? "Adding..." : "Add Set"}
        </Button>
      </CardContent>
    </Card>
  );
}
