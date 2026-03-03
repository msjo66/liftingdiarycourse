import { getWorkoutsForDate } from '@/data/workouts';
import { WorkoutList } from './_components/workout-list';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();
  const workouts = await getWorkoutsForDate(date);

  return <WorkoutList date={date} workouts={workouts} />;
}
