# NeuroFinance Refactoring Roadmap - Phase 1: Foundations & Security

**Overall Goal:** Align the NeuroFinance project with established project rules (`00` - `19`) and industry best practices to achieve high standards of security, maintainability, scalability, and code quality.

---

## Phase 1: Critical Security & Foundational Structure (Immediate Priority)

*Objective: Address immediate security vulnerabilities and establish the correct monorepo structure.*

**Task 1.1: Secure Backend Authentication**
    *   **Finding:** Critical JWT signature verification is disabled (`verify_signature: False` in `app/backend/auth.py`). Session ID hashing (`session_id[:4]`) is weak. (Gemini, Claude)
    *   **Action:** Enable and enforce JWT signature verification using Supabase public JWKs or the shared secret per Rule `05`.
    *   **Action:** Replace truncated session ID hashing for output folders with full UUIDs or cryptographically secure hashes.
    *   **Rule Compliance:** `05_backend_architecture`, `11_error_handling`

**Task 1.2: Secure Configuration & Secrets**
    *   **Finding:** API keys/secrets potentially exposed in `.env` / `.env.local` files, configuration lacks structure, sensitive info (API key fragments) logged. (Gemini, Claude)
    *   **Action:** Audit `.gitignore` to ensure `.env*` files (except `.env.example`) are NEVER committed. Rotate any potentially exposed keys.
    *   **Action:** Implement Pydantic `BaseSettings` for backend configuration management per Rule `05`.
    *   **Action:** Remove *any* logging of secrets or sensitive fragments (e.g., API keys) from backend logs.
    *   **Rule Compliance:** `05_backend_architecture`, `19_responsible_ai`

**Task 1.3: Establish Monorepo Structure**
    *   **Finding:** Project root structure violates Rule `02`. Frontend uses `npm` instead of `pnpm`. (Gemini, Claude, o4 mini)
    *   **Action:** Create `apps/web/`, `apps/api/`, and `packages/` directories.
    *   **Action:** Move contents of `app/frontend/` to `apps/web/`.
    *   **Action:** Move contents of `app/backend/` to `apps/api/`.
    *   **Action:** Migrate `apps/web/` from `npm` to `pnpm`, generating a `pnpm-lock.yaml` file. Remove `package-lock.json`.
    *   **Action:** Initialize Turborepo (`turbo.json`) and configure `pnpm-workspace.yaml` at the root.
    *   **Action:** Update all relevant import paths in both `apps/web` and `apps/api`.
    *   **Action:** Delete the old `app/` directory once moves and imports are verified.
    *   **Rule Compliance:** `02_project_structure`

---

## Phase 2: Backend Core Refactoring

*Objective: Rebuild the backend according to modular principles and integrate the correct data layer.*

**Task 2.1: Implement Modular Backend Architecture**
    *   **Finding:** Backend is largely monolithic (`debug_main.py`), lacks separation of concerns, uses global dicts for state. (Gemini, Claude)
    *   **Action:** Refactor `apps/api/` into the structure defined in Rule `05`:
        *   `src/app/core/`: Settings, exceptions, middleware.
        *   `src/app/routers/`: Versioned API endpoints using `APIRouter`.
        *   `src/app/services/`: Business logic.
        *   `src/app/models/` or `src/app/schemas/`: Pydantic models/schemas (consider alignment with `packages/types`).
        *   `src/app/repositories/`: Data access logic (interfacing with `packages/db`).
        *   `main.py`: FastAPI app initialization.
    *   **Action:** Implement Dependency Injection (e.g., FastAPI's `Depends`) for managing dependencies like database clients and agent instances, removing global state variables.
    *   **Rule Compliance:** `05_backend_architecture`

**Task 2.2: Implement Data Layer (Supabase)**
    *   **Finding:** Backend bypasses Supabase, using local CSVs copied per session. No migrations, RLS, or type generation. (Gemini, Claude)
    *   **Action:** Create `packages/db/` for Supabase integration.
    *   **Action:** Define database schemas in `packages/db/migrations/` using SQL, following conventions in Rule `06`.
    *   **Action:** Implement Supabase migrations workflow. Enable RLS on tables handling user data. Define RLS policies in `packages/db/policies/`.
    *   **Action:** Remove CSV loading/copying logic from `apps/api/`.
    *   **Action:** Implement data access in `apps/api/src/app/repositories/` using a Supabase client (e.g., `supabase-py` or via PostgREST).
    *   **Action:** Set up automated TypeScript type generation from the DB schema into `packages/types/` using Supabase CLI (`supabase gen types typescript`) per Rule `06`.
    *   **Rule Compliance:** `06_data_layer`, `02_project_structure`

**Task 2.3: Refactor Agent Implementation**
    *   **Finding:** `smolagents` implementation lacks structure, uses global state, prompts not structured, sandboxing unclear. (Gemini, Claude)
    *   **Action:** Create `packages/agents/` per Rule `02`.
    *   **Action:** Refactor agent logic according to Rule `07`: Define tools structurally, manage prompts via structured files (YAML/JSON) within `packages/agents/prompts/`, ensure secure sandboxing.
    *   **Action:** Implement proper state persistence for agents (e.g., using the database via `packages/db`) instead of in-memory dicts.
    *   **Action:** Enhance agent logging for transparency and explainability per Rule `19`.
    *   **Rule Compliance:** `07_agent_framework`, `19_responsible_ai`, `02_project_structure`

**Task 2.4: Standardize Backend Error Handling & Logging**
    *   **Finding:** Error handling exists but isn't structured per Rule `11` schema. Logging isn't structured (JSON) and lacks context. (Gemini, Claude)
    *   **Action:** Implement global exception handlers in `apps/api/src/app/core/exceptions.py`.
    *   **Action:** Ensure API error responses strictly follow the JSON schema defined in Rule `11`. Map internal exceptions to appropriate HTTP status codes and error codes. Do not leak stack traces.
    *   **Action:** Implement structured logging (JSON format) throughout the backend. Include contextual information (timestamp, level, request ID, user ID if applicable).
    *   **Rule Compliance:** `11_error_handling`, `05_backend_architecture`

---

## Phase 3: Frontend Enhancements

*Objective: Improve frontend structure, state management, user experience, and rule compliance.*

**Task 3.1: Extract Shared Frontend Logic & Consolidate State Management**
    *   **Finding:** Numerous session-related hooks suggest complexity. Components reimplement fetch/DOM logic. (Gemini, o4 mini, Claude)
    *   **Action:** Extract reusable UI components (`ChatContainer`, `Sidebar`, etc.) into `packages/ui/`.
    *   **Action:** Extract custom hooks (`useSession*`, etc.) into `packages/hooks/`.
    *   **Action:** Extract `AuthContext` and Supabase helpers into `packages/auth/`.
    *   **Action:** Extract API client logic (`apiClient.ts`, `authenticatedApi.ts`) into `packages/api-client/`.
    *   **Action:** Move shared types (`types.ts`) to `packages/types/` (aligning with backend type generation).
    *   **Action:** Refactor components in `apps/web` to consume shared components/hooks from `packages/`.
    *   **Action:** Analyze the existing session hooks (`useSession*`). Consolidate and simplify state management. Consider `useReducer` or a lightweight state management library if context drilling becomes excessive or state logic is highly complex. Follow principles in Rule `03`.
    *   **Rule Compliance:** `03_frontend_architecture`, `02_project_structure`, React Best Practices

**Task 3.2: Implement i18n & Address Accessibility**
    *   **Finding:** Hardcoded German strings exist. Accessibility features beyond basic semantics are lacking. (Gemini, Claude)
    *   **Action:** Implement an i18n library (e.g., `next-intl`) in `apps/web`.
    *   **Action:** Extract all user-facing strings into locale files (`locales/<locale>/translation.json`). Remove hardcoded strings and German comments/variables.
    *   **Action:** Perform an accessibility audit (automated with Axe, manual checks).
    *   **Action:** Implement necessary ARIA attributes, ensure full keyboard navigation, manage focus properly, and add alt text per Rule `16`.
    *   **Rule Compliance:** `16_accessibility_i18n`

**Task 3.3: Refactor Frontend Components & Code Quality**
    *   **Finding:** Components mix concerns, direct DOM manipulation used, inconsistent naming. (Claude, o4 mini)
    *   **Action:** Refactor components like `ChatContainer` to use React state/refs instead of direct DOM manipulation.
    *   **Action:** Ensure components adhere to the Single Responsibility Principle.
    *   **Action:** Enforce consistent naming conventions (TypeScript: PascalCase for types/interfaces, camelCase for variables/functions).
    *   **Action:** Apply performance optimizations (`React.memo`, `useCallback`, `useMemo`) strategically after profiling, per Rule `10`.
    *   **Rule Compliance:** React Best Practices, `03_frontend_architecture`, `04_frontend_style`, `10_performance`, TypeScript Best Practices

**Task 3.4: Standardize Frontend Error Handling**
    *   **Finding:** Error handling relies on `console.error`, lacks user feedback and Error Boundaries. (Gemini, Claude)
    *   **Action:** Implement React Error Boundaries at appropriate levels (e.g., around routes or major UI sections) in `apps/web`.
    *   **Action:** Provide user-friendly error messages and potential retry mechanisms for API call failures.
    *   **Action:** Integrate frontend error logging with a monitoring service.
    *   **Rule Compliance:** `11_error_handling`, React Best Practices

---

## Phase 4: Testing, Documentation & Tooling

*Objective: Establish robust testing, documentation practices, and standardized tooling across the monorepo.*

**Task 4.1: Implement Comprehensive Testing**
    *   **Finding:** Lack of unit and integration tests for both frontend and backend. (Gemini, Claude, o4 mini)
    *   **Action:** Implement unit and integration tests for backend modules (`apps/api/tests/`) using `pytest`, aiming for >90% coverage per Rule `05`.
    *   **Action:** Implement unit and integration tests for frontend components and hooks (`apps/web/src/tests/` or co-located) using React Testing Library and Jest/Vitest, aiming for high coverage.
    *   **Action:** Include tests for error scenarios and edge cases.
    *   **Rule Compliance:** `05_backend_architecture`, `03_frontend_architecture`, Testing Best Practices

**Task 4.2: Establish Documentation Standards**
    *   **Finding:** No central `docs/` directory, ADRs, runbooks, or auto-generated API docs. (Gemini, Claude, o4 mini)
    *   **Action:** Create the `docs/` directory structure per Rule `15` at the repository root.
    *   **Action:** Start writing Architecture Decision Records (ADRs) in `docs/adr/` for key decisions made during this refactoring (e.g., auth fix, data layer choice, state management).
    *   **Action:** Set up automated OpenAPI documentation generation for the backend (`apps/api`) and publish it (e.g., within `docs/api/`).
    *   **Action:** Maintain a root `CHANGELOG.md`.
    *   **Action:** Enforce JSDoc/TSDoc/Python docstrings for public modules and functions.
    *   **Rule Compliance:** `15_documentation`

**Task 4.3: Consolidate Dependencies & Tooling**
    *   **Finding:** Dual backend `requirements.txt`, mixed JS/TS/CJS/ESM configs, stray scripts. (Gemini, o4 mini)
    *   **Action:** Consolidate backend dependencies into `apps/api/requirements.in` (use `pip-tools` to generate `requirements.txt`). Remove the root `requirements.txt`.
    *   **Action:** Create `packages/config/` for shared configurations (ESLint, Prettier, TypeScript base `tsconfig.json`, Tailwind base config, PostCSS base config). Apps should extend these.
    *   **Action:** Standardize on one config file type per tool (e.g., prefer `.mjs` for ESM configs like ESLint if applicable). Remove duplicates.
    *   **Action:** Move reusable development scripts into `packages/scripts/`. Remove stray test scripts (`supabase-test.*`, etc.).
    *   **Action:** Set up automated dependency updates (Dependabot/Renovate) and vulnerability scanning (Snyk/GitHub) per Rule `18`.
    *   **Rule Compliance:** `18_dependency_management`, `02_project_structure`, `04_frontend_style`

**Task 4.4: Setup CI/CD Pipeline**
    *   **Finding:** No CI configuration identified.
    *   **Action:** Implement GitHub Actions workflows (`.github/workflows/`) for:
        *   Linting (ESLint, Prettier, Pylint/Flake8/Black, SQLFluff).
        *   Type checking (TypeScript, MyPy if used).
        *   Running unit and integration tests for all affected packages/apps on PRs.
        *   Checking for Supabase type generation drift.
        *   (Optional) Lighthouse CI checks for frontend performance budgets (Rule `10`).
        *   Build checks for frontend and backend.
    *   **Action:** Gate merging PRs on CI checks passing.
    *   **Rule Compliance:** `05_backend_architecture`, `06_data_layer`, `10_performance`, `15_documentation`

---

This roadmap provides a structured approach to tackling the identified issues, starting with the most critical. Each phase builds upon the previous one, progressively bringing the NeuroFinance project into alignment with the desired quality standards and project rules. 