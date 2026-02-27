import { Suspense } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { DatePicker } from '@/components/date-picker';
import { getWorkoutsByDate } from '@/lib/actions/workouts';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;

  const dateStr =
    dateParam && isValid(parseISO(dateParam)) ? dateParam : todayStr();

  // Parse for display only (local noon to avoid any off-by-one)
  const displayDate = parseISO(dateStr);

  const workouts = await getWorkoutsByDate(dateStr);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Workouts</h1>
        <Suspense>
          <DatePicker selected={displayDate} />
        </Suspense>
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No workouts logged for {format(displayDate, 'PPPP')}.
        </p>
      ) : (
        <ul className="space-y-6">
          {workouts.map((workout) => (
            <li key={workout.id} className="rounded-lg border p-4">
              <h2 className="mb-3 text-lg font-medium">{workout.name}</h2>
              {workout.workoutExercises.length === 0 ? (
                <p className="text-muted-foreground text-sm">No exercises recorded.</p>
              ) : (
                <ul className="space-y-4">
                  {workout.workoutExercises.map((we) => (
                    <li key={we.id}>
                      <p className="mb-1 font-medium capitalize">{we.exercise.name}</p>
                      {we.sets.length > 0 && (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground border-b text-left">
                              <th className="pb-1 pr-4 font-normal">Set</th>
                              <th className="pb-1 pr-4 font-normal">Reps</th>
                              <th className="pb-1 font-normal">Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {we.sets.map((set) => (
                              <tr key={set.id} className="border-b last:border-0">
                                <td className="py-1 pr-4">{set.setNumber}</td>
                                <td className="py-1 pr-4">{set.reps ?? '—'}</td>
                                <td className="py-1">
                                  {set.weight != null
                                    ? `${set.weight} ${set.weightUnit}`
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
