'use client';

import { useState, useTransition } from 'react';
import { format, formatISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DayButton } from 'react-day-picker';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getWorkoutDatesForMonthAction } from '@/lib/actions/workouts';
import type { WorkoutsForDate } from '@/data/workouts';

interface WorkoutListProps {
  date: Date;
  workouts: WorkoutsForDate;
  workoutDates: string[];
}

function WorkoutDayButton(
  workoutDateSet: Set<string>,
  props: React.ComponentProps<typeof DayButton>,
) {
  const dateStr = formatISO(props.day.date, { representation: 'date' });
  const hasWorkout = workoutDateSet.has(dateStr);

  return (
    <CalendarDayButton {...props}>
      {props.children}
      {hasWorkout && (
        <span className="bg-primary mx-auto size-1 rounded-full" />
      )}
    </CalendarDayButton>
  );
}

export function WorkoutList({ date, workouts, workoutDates }: WorkoutListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workoutDateSet, setWorkoutDateSet] = useState(
    () => new Set(workoutDates),
  );
  const [, startTransition] = useTransition();

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', formatISO(newDate, { representation: 'date' }));
    router.push(`?${params.toString()}`);
  }

  function handleMonthChange(month: Date) {
    const monthIso = formatISO(month, { representation: 'date' }).slice(0, 7);
    startTransition(async () => {
      const dates = await getWorkoutDatesForMonthAction(monthIso);
      setWorkoutDateSet((prev) => {
        const next = new Set(prev);
        for (const d of dates) next.add(d);
        return next;
      });
    });
  }

  const modifierDates = [...workoutDateSet].map((d) => new Date(d + 'T00:00:00'));

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
            onMonthChange={handleMonthChange}
            modifiers={{ hasWorkout: modifierDates }}
            components={{
              DayButton: (props) => WorkoutDayButton(workoutDateSet, props),
            }}
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
