"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

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
