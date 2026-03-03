'use client';

import { format, formatISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkoutsForDate } from '@/data/workouts';

interface WorkoutListProps {
  date: Date;
  workouts: WorkoutsForDate;
}

export function WorkoutList({ date, workouts }: WorkoutListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', formatISO(newDate, { representation: 'date' }));
    router.push(`?${params.toString()}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Workouts</h1>
      <div className="flex gap-8">
        <div className="shrink-0">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={handleDateSelect}
          />
        </div>

        <div className="flex-1">
          <p className="text-muted-foreground mb-4 text-sm">
            {format(date, 'do MMM yyyy')}
          </p>

          {workouts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No workouts logged for {format(date, 'do MMM yyyy')}.
            </p>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workout.exercises.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No exercises recorded.</p>
                    ) : (
                      <div className="space-y-4">
                        {workout.exercises.map((exercise) => (
                          <div key={exercise.id}>
                            <div className="mb-2 flex items-center gap-2">
                              <p className="font-medium capitalize">{exercise.name}</p>
                              <Badge variant="secondary">{exercise.sets.length} sets</Badge>
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-muted-foreground border-b text-left">
                                  <th className="pb-1 pr-4 font-normal">Set</th>
                                  <th className="pb-1 pr-4 font-normal">Reps</th>
                                  <th className="pb-1 font-normal">Weight</th>
                                </tr>
                              </thead>
                              <tbody>
                                {exercise.sets.map((set) => (
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
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
