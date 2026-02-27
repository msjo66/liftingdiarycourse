# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

Do not create custom components. Every UI element — buttons, inputs, cards, tables, dialogs, badges, etc. — must be sourced from the shadcn/ui library. If a needed component is not yet installed, add it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

All installed components live in `src/components/ui/` and must not be modified.

## Date Formatting

Use `date-fns` for all date formatting. No other date libraries should be used.

Dates displayed to the user must follow this format:

| Example      |
|--------------|
| 1st Sep 2025 |
| 2nd Aug 2025 |
| 3rd Jan 2026 |
| 4th Jun 2024 |

Use the `do MMM yyyy` format token from `date-fns`:

```ts
import { format } from 'date-fns';

format(date, 'do MMM yyyy'); // "1st Sep 2025"
```
