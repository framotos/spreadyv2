# NeuroFinance Refactoring Roadmap - v2 (Updated)

**Overall Goal:** Align the NeuroFinance project with established project rules (`00` - `19`) and industry best practices to achieve high standards of security, maintainability, scalability, and code quality.

**Status as of:** [Current Date/Time - User to fill in]

---

## Phase 1: Critical Security & Foundational Structure (Mostly Complete)

*Objective: Address immediate security vulnerabilities and establish the correct monorepo structure.*

**Task 1.1: Secure Backend Authentication**
    *   [✅ Done] Enable JWT signature verification (`verify_signature: True` in `core/auth.py`).
    *   [✅ Done] Replace truncated session ID hashing for output folders with full session ID.
    *   [🚧 Partial] Further JWT validation (e.g., using Supabase JWKs) per Rule `05` could be added.

**Task 1.2: Secure Configuration & Secrets**
    *   [✅ Done] Audit and update `.gitignore` for `.env*` files.
    *   [✅ Done] Implement Pydantic `BaseSettings` for backend configuration (`core/config.py`).
    *   [✅ Done] Remove logging of secrets/API key fragments.
    *   [⚠️ Action Needed] Rotate any potentially exposed keys (manual step recommended).

**Task 1.3: Establish Monorepo Structure**
    *   [✅ Done] Create `apps/web/`, `apps/api/`, and `packages/` directories.
    *   [✅ Done] Move contents of `app/frontend/` to `apps/web/`.
    *   [✅ Done] Move contents of `app/backend/` to `apps/api/`.
    *   [✅ Done] Migrate `apps/web/` from `npm` to `pnpm`.
    *   [✅ Done] Initialize Turborepo (`turbo.json`) and configure `pnpm-workspace.yaml`.
    *   [🚧 Partial] Update relevant import paths (basic checks done, further review might be needed).
    *   [✅ Done] Delete the old `app/` directory.

---

## Phase 2: Backend Core Refactoring (In Progress)

*Objective: Rebuild the backend according to modular principles and integrate the correct data layer.*

**Task 2.1: Implement Modular Backend Architecture**
    *   [✅ Done] Create `src/app/` structure (`core`, `routers`, `services`, `models`).
    *   [✅ Done] Move `config.py` and `auth.py` to `src/app/core/`.
    *   [✅ Done] Create `main.py` app factory.
    *   [✅ Done] Extract `sessions` and `ask` endpoints to `src/app/routers/`.
    *   [✅ Done] Extract initial `agent_service.py` to `src/app/services/`.
    *   [❌ Pending] Implement proper Dependency Injection (remove global state: `sessions`, `session_messages`, `user_agents` from routers/services).
    *   [❌ Pending] Create repository layer (`src/app/repositories/`) for data access.
    *   [❌ Pending] Move Pydantic models to `src/app/models/` or `src/app/schemas/`.

**Task 2.2: Implement Data Layer (Supabase)**
    *   [✅ Done] Create `packages/db/` structure (`migrations`, `policies`, `seeds`).
    *   [✅ Done] Define database schema (3 tables) in migration file (`...create_financial_tables.sql`).
    *   [✅ Done] Define initial RLS policies (`...financial_tables_policies.sql`).
    *   [✅ Done] Create data preprocessing script (`preprocess_companies.py`).
    *   [✅ Done] Create seed script (`seed.sql`) using `\copy`.
    *   [🚧 Blocked/Parked] Apply migrations/policies and seed data (manual `psql` step encountered foreign key errors - needs debugging).
    *   [❌ Pending] Generate TypeScript types from DB schema (`supabase gen types typescript...`).
    *   [❌ Pending] Remove CSV loading logic entirely from `agent_service.py`.
    *   [❌ Pending] Implement data access in `repositories` using a Supabase client.

**Task 2.3: Refactor Agent Implementation**
    *   [❌ Pending] Create `packages/agents/`.
    *   [❌ Pending] Refactor agent logic per Rule `07` (structured tools, prompts).
    *   [❌ Pending] Implement proper agent state persistence (via DB).
    *   [❌ Pending] Enhance agent logging per Rule `19`.

**Task 2.4: Standardize Backend Error Handling & Logging**
    *   [❌ Pending] Implement global exception handlers (`core/exceptions.py`).
    *   [❌ Pending] Ensure API error responses follow Rule `11` schema.
    *   [❌ Pending] Implement structured JSON logging.

---

## Phase 3: Frontend Enhancements (Pending)

*Objective: Improve frontend structure, state management, user experience, and rule compliance.*

**Task 3.1: Extract Shared Frontend Logic & Consolidate State Management**
    *   [❌ Pending] Extract reusable UI components to `packages/ui/`.
    *   [❌ Pending] Extract custom hooks to `packages/hooks/`.
    *   [❌ Pending] Extract AuthContext/helpers to `packages/auth/`.
    *   [❌ Pending] Extract API client logic to `packages/api-client/`.
    *   [❌ Pending] Move shared types to `packages/types/`.
    *   [❌ Pending] Refactor `apps/web` components to use shared packages.
    *   [❌ Pending] Analyze and consolidate session state management.

**Task 3.2: Implement i18n & Address Accessibility**
    *   [❌ Pending] Implement i18n library.
    *   [❌ Pending] Extract strings to locale files.
    *   [❌ Pending] Perform accessibility audit and implement fixes.

**Task 3.3: Refactor Frontend Components & Code Quality**
    *   [❌ Pending] Refactor components (e.g., `ChatContainer`) to avoid direct DOM manipulation.
    *   [❌ Pending] Ensure Single Responsibility Principle.
    *   [❌ Pending] Enforce consistent naming conventions.
    *   [❌ Pending] Apply performance optimizations.

**Task 3.4: Standardize Frontend Error Handling**
    *   [❌ Pending] Implement React Error Boundaries.
    *   [❌ Pending] Provide user-friendly API error messages.
    *   [❌ Pending] Integrate frontend error logging.

---

## Phase 4: Testing, Documentation & Tooling (Pending)

*Objective: Establish robust testing, documentation practices, and standardized tooling across the monorepo.*

**Task 4.1: Implement Comprehensive Testing**
    *   [❌ Pending] Implement backend unit/integration tests.
    *   [❌ Pending] Implement frontend unit/integration tests.

**Task 4.2: Establish Documentation Standards**
    *   [❌ Pending] Create `docs/` structure.
    *   [❌ Pending] Write ADRs for refactoring decisions.
    *   [❌ Pending] Set up automated OpenAPI documentation.
    *   [❌ Pending] Maintain `CHANGELOG.md`.
    *   [❌ Pending] Enforce code docstrings.

**Task 4.3: Consolidate Dependencies & Tooling**
    *   [❌ Pending] Consolidate backend dependencies (`requirements.in`).
    *   [❌ Pending] Create `packages/config/` for shared configs.
    *   [❌ Pending] Standardize config file types.
    *   [❌ Pending] Move scripts to `packages/scripts/`.
    *   [❌ Pending] Set up automated dependency updates/scanning.

**Task 4.4: Setup CI/CD Pipeline**
    *   [❌ Pending] Implement GitHub Actions workflows (lint, test, type check, build).
    *   [❌ Pending] Gate merging PRs on CI checks.

---

This updated roadmap reflects the progress made and highlights the next steps. 