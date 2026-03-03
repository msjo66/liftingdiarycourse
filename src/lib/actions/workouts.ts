'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatISO } from 'date-fns';
import { getWorkoutDatesForMonth } from '@/data/workouts';

/**
 * Fetch all workouts for the logged-in user on the given date string (YYYY-MM-DD).
 */
export async function getWorkoutsByDate(dateStr: string) {
  const { userId } = await auth();
  if (!userId) return [];

  // Build a UTC midnight Date so Drizzle's date column comparison is unambiguous
  const date = new Date(`${dateStr}T00:00:00.000Z`);

  const rows = await db.query.workouts.findMany({
    where: and(eq(workouts.userId, userId), eq(workouts.date, date)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.setNumber)],
          },
        },
      },
    },
  });

  return rows;
}

export async function getWorkoutDatesForMonthAction(monthIso: string) {
  const month = new Date(`${monthIso}-01T00:00:00.000Z`);
  const dates = await getWorkoutDatesForMonth(month);
  return dates.map((d) => formatISO(d, { representation: 'date' }));
}
