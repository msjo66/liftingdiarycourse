# Data Fetching

## Rules

### 1. Server Components ONLY

All data fetching MUST be done exclusively via React Server Components.

**NEVER fetch data via:**
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- Any other mechanism

This is non-negotiable. If you need data in a client component, fetch it in a server component parent and pass it down as props.

### 2. Use Helper Functions in `/data`

Database queries MUST always be done via helper functions located in the `/data` directory.

**NEVER:**
- Write raw SQL strings
- Query the database directly from a page or component
- Use any ORM method outside of `/data` helper functions

**ALWAYS:**
- Create a helper function in `/data` that uses Drizzle ORM
- Import and call that helper from your server component

### 3. User Data Isolation

Every database query MUST be scoped to the currently authenticated user. A logged-in user must NEVER be able to access another user's data.

**Every helper function in `/data` must:**
1. Retrieve the current user's session/ID
2. Filter all queries by that user's ID
3. Never accept a `userId` as an external parameter that could be manipulated

**Example pattern:**

```ts
// src/data/workouts.ts
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkouts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to fetch data | Server components only |
| How to query the database | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| User data scoping | Always filter by authenticated user ID from session |
