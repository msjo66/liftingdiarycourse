# Routing

## Structure

All application routes live under `/dashboard`. There are no public-facing pages beyond the root `/`.

```
src/app/
├── page.tsx                          # Root page (public)
├── layout.tsx                        # Root layout
└── dashboard/
    ├── page.tsx                      # /dashboard
    └── workout/
        ├── new/
        │   └── page.tsx              # /dashboard/workout/new
        └── [workoutId]/
            └── page.tsx              # /dashboard/workout/[workoutId]
```

## Rules

### 1. All app routes live under /dashboard

Every page that is part of the application must be nested under `src/app/dashboard/`. Do not create top-level routes for app functionality.

### 2. /dashboard routes are protected

All routes under `/dashboard` are accessible only to authenticated users. This is enforced via Next.js middleware — do not add redirect logic inside individual page components.

### 3. Route protection via middleware only

Use Clerk's `clerkMiddleware` in `src/middleware.ts` to protect routes. The middleware must mark `/dashboard` and all sub-paths as protected using `auth.protect()`.

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### 4. Dynamic segments use descriptive names

Use `[workoutId]` not `[id]` for dynamic route segments so the intent is clear from the folder name.

### 5. Private components stay co-located

Route-specific components live in a `_components/` folder inside their route directory. The underscore prefix prevents Next.js from treating them as routes.

```
dashboard/workout/[workoutId]/
├── page.tsx
├── actions.ts
└── _components/
    └── edit-workout-form.tsx
```

## Summary

| Concern | Rule |
|---|---|
| App routes | Always under `/dashboard` |
| Route protection | Clerk middleware only, not in page components |
| Protected paths | `/dashboard` and all sub-paths |
| Dynamic segments | Use descriptive names (e.g. `[workoutId]`) |
| Route-local components | Co-locate in `_components/` |
