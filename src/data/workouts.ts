import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const dateStr = date.toISOString().slice(0, 10);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutExerciseId: workoutExercises.id,
      workoutExerciseOrder: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      weightUnit: sets.weightUnit,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), eq(workouts.date, new Date(dateStr))));

  // Group rows into nested structure
  const workoutMap = new Map<
    string,
    {
      id: string;
      name: string;
      exercises: Map<
        string,
        {
          id: string;
          name: string;
          order: number;
          sets: { id: string; setNumber: number; reps: number | null; weight: string | null; weightUnit: string }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, { id: row.workoutId, name: row.workoutName, exercises: new Map() });
    }
    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId && row.exerciseId && row.exerciseName) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.exerciseId,
          name: row.exerciseName,
          order: row.workoutExerciseOrder!,
          sets: [],
        });
      }
      const exercise = workout.exercises.get(row.workoutExerciseId)!;

      if (row.setId) {
        exercise.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weight: row.weight,
          weightUnit: row.weightUnit!,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()).sort((a, b) => a.order - b.order),
  }));
}

export type WorkoutsForDate = Awaited<ReturnType<typeof getWorkoutsForDate>>;

export async function createWorkout(name: string, date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  const [workout] = await db.insert(workouts).values({ userId, name, date: new Date(formatISO(date, { representation: 'date' })) }).returning();
  return workout;
}

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}

export async function updateWorkout(workoutId: string, name: string, date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .update(workouts)
    .set({ name, date: new Date(formatISO(date, { representation: 'date' })) })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function getWorkoutDatesForMonth(month: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const rows = await db
    .selectDistinct({ date: workouts.date })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.date, startOfMonth(month)),
        lte(workouts.date, endOfMonth(month)),
      ),
    );

  return rows.map((r) => r.date);
}
