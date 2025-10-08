# Repository Guidelines

## Project Structure & Module Organization
cuda-indexer is a Next.js app using the App Router. Application code lives in `src/app`, with `layout.tsx` defining shared chrome and `page.tsx` hosting the current landing view. Add new routes by creating folders under `src/app/<route>/page.tsx`, and group shared UI in `src/app/(components)` or a future `src/components` directory. Global styles live in `src/app/globals.css`, while static assets belong in `public/`. Use the `@/` alias (configured in `tsconfig.json`) to import from `src/` without long relative paths.

## Build, Test, and Development Commands
`npm run dev` starts the Turbopack-powered dev server on http://localhost:3000. `npm run build` produces an optimized production bundle; run it before opening a PR to catch build regressions. `npm run start` serves the built app locally (uses `.next`). `npm run lint` executes the Next.js ESLint preset; fix violations before submitting changes.

## Coding Style & Naming Conventions
TypeScript is required (`strict: true`). Follow Prettier-style 2-space indentation and keep JSX multi-line props sorted logically. Name React components with PascalCase (`FileList.tsx`), hooks/utilities with camelCase (`useIndexing`). Favor Tailwind utility classes for styling; place shared theme tokens in `globals.css`. Prefer named exports and co-locate component-specific helpers.

## Testing Guidelines
Automated tests are not yet configured. When you introduce coverage, favor Jest or Vitest with React Testing Library. Place files as `*.test.ts(x)` adjacent to the component or in `src/app/__tests__/`. Document how to execute the suite (`npm run test`) inside your PR and ensure `npm run lint` passes as a minimum gate. Include manual QA notes or screenshots when UI changes cannot be exercised automatically.

## Commit & Pull Request Guidelines
Existing history only contains the scaffold commit, so establish a clear pattern: use short, imperative subjects (`Add hero section`) and reference issues in the body. Group related changes per commit to keep diffs reviewable. Pull requests should describe the problem, the solution, and validation steps. Link tracking issues, attach screenshots or screen recordings for UI updates, and mention any follow-up work or config changes reviewers need to know.
