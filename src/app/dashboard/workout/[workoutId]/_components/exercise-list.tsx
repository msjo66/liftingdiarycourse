import { WorkoutExerciseWithSets } from "@/data/exercises";
import { ExerciseCard } from "./exercise-card";

interface ExerciseListProps {
  workoutExercises: WorkoutExerciseWithSets[];
  workoutId: string;
}

export function ExerciseList({ workoutExercises }: ExerciseListProps) {
  if (workoutExercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No exercises yet. Add your first exercise.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {workoutExercises.map((we) => (
        <ExerciseCard
          key={we.workoutExerciseId}
          workoutExerciseId={we.workoutExerciseId}
          exerciseName={we.exerciseName}
          exerciseCategory={we.exerciseCategory}
          sets={we.sets}
        />
      ))}
    </div>
  );
}
