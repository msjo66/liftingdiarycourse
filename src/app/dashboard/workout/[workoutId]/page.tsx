import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getWorkoutExercisesWithSets, getExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { ExerciseList } from "./_components/exercise-list";
import { AddExerciseDialog } from "./_components/add-exercise-dialog";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;

  const [workout, workoutExercises, allExercises] = await Promise.all([
    getWorkoutById(workoutId),
    getWorkoutExercisesWithSets(workoutId),
    getExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name}
        initialDate={workout.date}
      />
      <ExerciseList workoutExercises={workoutExercises} workoutId={workoutId} />
      <AddExerciseDialog workoutId={workoutId} exercises={allExercises} />
    </div>
  );
}
