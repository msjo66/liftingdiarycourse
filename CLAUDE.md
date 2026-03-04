# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Documentation

**IMPORTANT:** Before generating any code, always check the `/docs` directory for relevant documentation files first. Use those docs as the primary reference for implementation details, patterns, and conventions specific to this project.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md
- /docs/routing.md

## Architecture

This is a Next.js 15 app using the App Router (`src/app/`). Pages and layouts live under `src/app/`, with `layout.tsx` as the root layout and `page.tsx` as the home page.

**Stack:**
- Next.js 15 + React 19 (App Router)
- TypeScript with path alias `@/*` → `./src/*`
- Tailwind CSS v4 (configured via PostCSS, no `tailwind.config.js`)
- ESLint v9 flat config (`eslint.config.mjs`)
