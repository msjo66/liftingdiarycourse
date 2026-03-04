# Data Mutations

## Rules

### 1. Use Helper Functions in `/data`

All database mutations MUST be done via helper functions located in the `src/data/` directory using Drizzle ORM.

**NEVER:**
- Write raw SQL strings
- Call Drizzle ORM methods directly from server actions, pages, or components
- Mutate data outside of `src/data/` helper functions

**ALWAYS:**
- Create a helper function in `src/data/` that performs the mutation via Drizzle ORM
- Import and call that helper from your server action

**Example pattern:**

```ts
// src/data/workouts.ts
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(name: string, date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();

  return workout;
}
```

### 2. Server Actions Only

All data mutations MUST be triggered via Next.js Server Actions. Server actions must live in colocated `actions.ts` files, placed alongside the component or page that uses them.

**NEVER:**
- Mutate data from route handlers (`src/app/api/`)
- Mutate data from client components directly
- Place server actions in component files or page files

**ALWAYS:**
- Create an `actions.ts` file colocated with the feature (e.g., `src/app/dashboard/actions.ts`)
- Mark the file with `"use server"` at the top

**Example pattern:**

```ts
// src/app/dashboard/actions.ts
"use server";

import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(name: string, date: Date) {
  // ...
}
```

### 3. Typed Parameters — No FormData

Server action parameters MUST be explicitly typed. Using the `FormData` type is strictly forbidden.

**NEVER:**
```ts
// BAD — untyped, uses FormData
export async function createWorkoutAction(formData: FormData) { ... }
```

**ALWAYS:**
```ts
// GOOD — explicitly typed parameters
export async function createWorkoutAction(name: string, date: Date) { ... }
```

### 4. Validate All Arguments with Zod

Every server action MUST validate its arguments using Zod before doing anything else. Do not trust inputs passed to server actions.

**NEVER:**
- Pass arguments directly to data helpers without validation
- Assume inputs are safe or correctly typed at runtime

**ALWAYS:**
- Define a Zod schema for the action's inputs
- Parse and validate inputs at the top of the action
- Throw or return an error if validation fails

**Example pattern:**

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const parsed = createWorkoutSchema.parse({ name, date });
  return createWorkout(parsed.name, parsed.date);
}
```

### 5. User Data Isolation

Data helper functions in `src/data/` MUST enforce user ownership. Mutations must always be scoped to the currently authenticated user.

**Every mutation helper in `src/data/` must:**
1. Retrieve the current user's ID from the session
2. Scope the mutation to that user's ID
3. Never accept a `userId` as an external parameter

**Example pattern:**

```ts
// src/data/workouts.ts
export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Passing Dates to Drizzle ORM

When inserting or querying dates via Drizzle ORM, always convert a `Date` object to a UTC-safe date string first using `formatISO` from `date-fns`. This prevents timezone off-by-one bugs where a local midnight date gets stored as the previous day in UTC.

```ts
import { formatISO } from 'date-fns';

new Date(formatISO(date, { representation: 'date' }))
// e.g. new Date("2026-03-04") — always UTC midnight, correct date regardless of server timezone
```

**NEVER** pass a raw `Date` object with a local time component directly to Drizzle for date-only columns.

## Summary

| Concern | Rule |
|---|---|
| Where to write DB mutations | `src/data/` helpers using Drizzle ORM |
| Where to call mutations from | Server actions in colocated `actions.ts` files |
| Server action params | Explicitly typed — no `FormData` |
| Input validation | Always validate with Zod before proceeding |
| User data scoping | Always filter by authenticated user ID from session |
| Raw SQL | Never |
