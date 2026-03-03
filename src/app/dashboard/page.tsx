import { formatISO } from 'date-fns';
import { getWorkoutsForDate, getWorkoutDatesForMonth } from '@/data/workouts';
import { WorkoutList } from './_components/workout-list';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();

  const [workouts, workoutDates] = await Promise.all([
    getWorkoutsForDate(date),
    getWorkoutDatesForMonth(date),
  ]);

  const workoutDateStrings = workoutDates.map((d) =>
    formatISO(d, { representation: 'date' }),
  );

  return (
    <WorkoutList
      date={date}
      workouts={workouts}
      workoutDates={workoutDateStrings}
    />
  );
}
