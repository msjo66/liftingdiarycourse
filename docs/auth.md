# Authentication

## Provider

**This app uses Clerk for all authentication.**

Do not implement custom auth logic, sessions, JWTs, or any other authentication mechanism. Clerk handles everything — sign up, sign in, session management, and user identity.

## Getting the Current User

Always use Clerk's server-side helpers to retrieve the authenticated user. Never trust client-supplied user IDs.

**In server components and `/data` helper functions:**

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

**In middleware or route protection, use Clerk's `clerkMiddleware`:**

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## Rules

### 1. Clerk is the only auth provider

Never install or use `next-auth`, `lucia`, `better-auth`, or any other auth library. Clerk is the sole source of truth for authentication.

### 2. Always guard data access with auth checks

Every `/data` helper function that accesses user data MUST retrieve the `userId` from Clerk and scope all queries to that user. See `data-fetching.md` for the full pattern.

### 3. Never accept userId as an external parameter

Helper functions must never accept a `userId` argument that could be spoofed. Always derive the user's identity internally from Clerk's `auth()` helper.

### 4. Protect pages via middleware

Use Clerk's middleware to protect routes. Do not roll custom redirect logic in individual page components.

## Summary

| Concern | Rule |
|---|---|
| Auth provider | Clerk only |
| Get current user | `auth()` from `@clerk/nextjs/server` |
| Route protection | Clerk middleware |
| Custom auth logic | Never |
| User ID source | Always from Clerk, never from external input |
