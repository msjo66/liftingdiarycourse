"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeWorkoutExercise, addSet, updateSet, removeSet } from "@/data/exercises";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const updateWorkoutSchema = z.object({
  workoutId: z.uuid(),
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function updateWorkoutAction(workoutId: string, name: string, date: Date) {
  const parsed = updateWorkoutSchema.parse({ workoutId, name, date });
  await updateWorkout(parsed.workoutId, parsed.name, parsed.date);
  redirect("/dashboard");
}

const addExerciseSchema = z.object({
  workoutId: z.uuid(),
  exerciseId: z.uuid(),
});

export async function addExerciseToWorkoutAction(workoutId: string, exerciseId: string): Promise<void> {
  const parsed = addExerciseSchema.parse({ workoutId, exerciseId });
  await addExerciseToWorkout(parsed.workoutId, parsed.exerciseId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
}

export async function removeWorkoutExerciseAction(workoutExerciseId: string): Promise<void> {
  z.uuid().parse(workoutExerciseId);
  await removeWorkoutExercise(workoutExerciseId);
  revalidatePath('/dashboard/workout/[workoutId]', 'page');
}

const setSchema = z.object({
  workoutExerciseId: z.uuid(),
  reps: z.number().int().positive().nullable(),
  weight: z.string().nullable(),
  weightUnit: z.enum(['lbs', 'kg']),
});

export async function addSetAction(
  workoutExerciseId: string,
  reps: number | null,
  weight: string | null,
  weightUnit: 'lbs' | 'kg'
): Promise<void> {
  const parsed = setSchema.parse({ workoutExerciseId, reps, weight, weightUnit });
  await addSet(parsed.workoutExerciseId, parsed.reps, parsed.weight, parsed.weightUnit);
  revalidatePath('/dashboard/workout/[workoutId]', 'page');
}

const updateSetSchema = z.object({
  setId: z.uuid(),
  reps: z.number().int().positive().nullable(),
  weight: z.string().nullable(),
  weightUnit: z.enum(['lbs', 'kg']),
});

export async function updateSetAction(
  setId: string,
  reps: number | null,
  weight: string | null,
  weightUnit: 'lbs' | 'kg'
): Promise<void> {
  const parsed = updateSetSchema.parse({ setId, reps, weight, weightUnit });
  await updateSet(parsed.setId, parsed.reps, parsed.weight, parsed.weightUnit);
  revalidatePath('/dashboard/workout/[workoutId]', 'page');
}

export async function removeSetAction(setId: string): Promise<void> {
  z.uuid().parse(setId);
  await removeSet(setId);
  revalidatePath('/dashboard/workout/[workoutId]', 'page');
}
