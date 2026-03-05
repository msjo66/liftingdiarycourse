import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { exercises, workoutExercises, workouts, sets } from '@/db/schema';
import { eq, and, isNull, or, ilike, max, sql } from 'drizzle-orm';

export type WorkoutExerciseWithSets = {
  workoutExerciseId: string;
  order: number;
  notes: string | null;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  sets: { id: string; setNumber: number; reps: number | null; weight: string | null; weightUnit: 'lbs' | 'kg' }[];
};

export async function getExercises(search?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const conditions = [or(isNull(exercises.userId), eq(exercises.userId, userId))];

  if (search) {
    conditions.push(ilike(exercises.name, `%${search}%`));
  }

  return db
    .select({ id: exercises.id, name: exercises.name, category: exercises.category })
    .from(exercises)
    .where(and(...conditions));
}

export async function getWorkoutExercisesWithSets(workoutId: string): Promise<WorkoutExerciseWithSets[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout.length) throw new Error('Not found');

  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      order: workoutExercises.order,
      notes: workoutExercises.notes,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseCategory: exercises.category,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      weightUnit: sets.weightUnit,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order, sets.setNumber);

  const exerciseMap = new Map<string, WorkoutExerciseWithSets>();

  for (const row of rows) {
    if (!exerciseMap.has(row.workoutExerciseId)) {
      exerciseMap.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        order: row.order,
        notes: row.notes,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        exerciseCategory: row.exerciseCategory,
        sets: [],
      });
    }
    const we = exerciseMap.get(row.workoutExerciseId)!;
    if (row.setId) {
      we.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
        weightUnit: row.weightUnit as 'lbs' | 'kg',
      });
    }
  }

  return Array.from(exerciseMap.values()).sort((a, b) => a.order - b.order);
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout.length) throw new Error('Not found');

  const [maxOrderResult] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const order = (maxOrderResult?.maxOrder ?? 0) + 1;

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();

  return workoutExercise;
}

export async function removeWorkoutExercise(workoutExerciseId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        sql`${workoutExercises.workoutId} IN (SELECT id FROM workouts WHERE user_id = ${userId})`
      )
    );
}

export async function addSet(
  workoutExerciseId: string,
  reps: number | null,
  weight: string | null,
  weightUnit: 'lbs' | 'kg'
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const weRows = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)))
    .limit(1);

  if (!weRows.length) throw new Error('Not found');

  const [maxSetResult] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const setNumber = (maxSetResult?.maxSetNumber ?? 0) + 1;

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weight, weightUnit })
    .returning();

  return set;
}

export async function updateSet(
  setId: string,
  reps: number | null,
  weight: string | null,
  weightUnit: 'lbs' | 'kg'
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [set] = await db
    .update(sets)
    .set({ reps, weight, weightUnit })
    .where(
      and(
        eq(sets.id, setId),
        sql`${sets.workoutExerciseId} IN (
          SELECT we.id FROM workout_exercises we
          INNER JOIN workouts w ON w.id = we.workout_id
          WHERE w.user_id = ${userId}
        )`
      )
    )
    .returning();

  return set;
}

export async function removeSet(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db
    .delete(sets)
    .where(
      and(
        eq(sets.id, setId),
        sql`${sets.workoutExerciseId} IN (
          SELECT we.id FROM workout_exercises we
          INNER JOIN workouts w ON w.id = we.workout_id
          WHERE w.user_id = ${userId}
        )`
      )
    );
}
