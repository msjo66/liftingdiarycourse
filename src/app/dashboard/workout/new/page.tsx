import { NewWorkoutForm } from "./_components/new-workout-form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const initialDate = date ? new Date(date + 'T00:00:00') : new Date();
  return (
    <div className="p-6">
      <NewWorkoutForm initialDate={initialDate} />
    </div>
  );
}
