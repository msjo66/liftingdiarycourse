"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.parse({ name, date });
  await createWorkout(parsed.name, parsed.date);
  redirect("/dashboard");
}
