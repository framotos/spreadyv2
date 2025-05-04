# o4 mini

```markdown

## A. Complete Frontend `src` Audit  

src/app  
- page.tsx (landing)  
- layout.tsx  
- /login/page.tsx  
- /signup/page.tsx  
- /reset-password/page.tsx  

src/components  
- ChatContainer.tsx  
- ChatInput.tsx  
- ChatMessage.tsx  
- Sidebar.tsx  
- NavbarItem.tsx  
- auth/… (likely login/logout UI)  

src/lib  
- apiClient.ts  → bare axios/fetch wrapper  
- authenticatedApi.ts → Supabase + `/sessions` + `/ask` calls  
- supabase/  
  • client.ts (init Supabase JS client)  
- test scripts (supabase-test.js, supabase-test.cjs, test-connection.js)  
- types.ts, utils.ts  
- hooks/  
  • useSession.ts  
  • useSessionManagement.ts  
  • useSessionStorage.ts  
  • useSessionData.ts  
  • useLocalStorage.ts  
  • useHtmlFileSelection.ts  
  • useSessionMessages.ts  
- auth/  
  • AuthContext.tsx  

src/styles  
- globals.css  
- fonts.css  

Extras & anomalies  
- A stray PNG under src/lib  
- Duplicate config files: `next.config.js` + `next.config.ts`; two PostCSS configs (`.js` & `.mjs`).  
- No tests or CI config in this folder.  

**Strengths**  
- Good use of custom hooks for session state & messages.  
- Centralized AuthContext.  
- Dedicated API wrappers.  

**Pain points**  
- Components (e.g. ChatContainer) bypass hooks and re-implement data-fetch/DOM logic inline.  
- Mixed JS/TS, CJS/ESM, stray assets and scripts not in CI.  
- Folder naming/layout doesn’t match our monorepo**02_project_structure** style.  
- Duplication of config and assets creates confusion.  

—  
## B. Refactoring Plan to Enforce the Rules  

Below is a 4-phase plan (move, extract, consolidate, remove) to get to a clean `apps/` + `packages/` monorepo that obeys **02_project_structure**, **03_frontend_architecture**, **04_frontend_style**, etc.:

1. Restructure into apps/ & packages/  
   a. Create `apps/web/` and move everything in `app/frontend` → `apps/web/`  
   b. Create `apps/api/` and move `app/backend` → `apps/api/`  
   c. Delete the old `app/` folder once all imports are updated.  

2. Surface shared logic into packages/  
   a. `packages/ui/` → all presentational React components (`ChatContainer`, `Sidebar`, …).  
   b. `packages/hooks/` → the entire `src/lib/hooks` suite, with proper index barrel exports.  
   c. `packages/auth/` → `AuthContext.tsx`, plus supabase auth helpers.  
   d. `packages/api-client/` → `apiClient.ts` + `authenticatedApi.ts`, so both apps can call services.  
   e. `packages/types/` → move `types.ts` and any new shared TS interfaces here.  
   f. `packages/utils/` → `utils.ts`, small helpers (or fold into `packages/hooks` if minimal).  

3. Consolidate configuration & tooling  
   a. `packages/config/` → central `tsconfig.json`, `eslint.config.mjs`, `prettier.config.js`, `tailwind.config.js`, `postcss.config.js`. Apps extend this.  
   b. Root `pnpm-workspace.yaml` + Turborepo `turbo.json` to orchestrate build/test pipelines.  
   c. Move env examples: `.env.example` into each app.  

4. Clean up cruft & enforce policies  
   a. Remove stray test scripts (`supabase-test.*`, `test-connection.js`) or migrate them into a proper `packages/scripts/` CLI if still needed.  
   b. Pick one config per tool (e.g. drop either `.js` or `.mjs` version).  
   c. Add `.gitignore` entries for `debug.log`, large CSVs, `archive/`.  
   d. Wire up CI:  
      - Frontend: Next lint, TypeScript check, Jest/React Testing Library, Lighthouse CI.  
      - Backend: Black/Flake8 or `pylint`, Pytest, SQL migration lint, Supabase type generation.  
   e. Set up GitHub workflows under `.github/` for build/test gating.  

**After this “skeleton” is in place**, we can iteratively:  
- Refactor each component to consume hooks from `packages/hooks` (instead of direct axios).  
- Enforce coding standards via ESLint/Prettier.  
- Build out proper backend routers/services under `apps/api/src/…` instead of a monolithic file.  
- Introduce a true data layer (Supabase tables + migrations in `packages/db`).  
- Add ADRs, documentation, observability, and fill in performance/error-handling rules.  

This roadmap will:

- Align your repo with our **02 Project Structure** and **03/04** frontend rules.  
- Ensure shared code isn’t duplicated.  
- Give each domain (UI, hooks, auth, API) its own package, improving reusability and testability.  

Let me know if you’d like to start with the file-move refactor (phase 1) or dive straight into consolidating config (phase 3)!

```