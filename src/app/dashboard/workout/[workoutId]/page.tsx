import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./_components/edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="p-6">
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name}
        initialDate={workout.date}
      />
    </div>
  );
}
