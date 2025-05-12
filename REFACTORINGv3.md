# NeuroFinance Refactoring Roadmap - v3 (Updated)

**Overall Goal:** Align the NeuroFinance project with established project rules (`00` - `19`) and industry best practices to achieve high standards of security, maintainability, scalability, and code quality.

**Status as of:** July 2024

---

## Phase 1: Critical Security & Foundational Structure (Complete)

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
    *   [✅ Done] Update relevant import paths.
    *   [✅ Done] Delete the old `app/` directory.

---

## Phase 2: Backend Core Refactoring (Complete)

*Objective: Rebuild the backend according to modular principles while continuing to use static CSV files as the data source.*

**Task 2.1: Implement Modular Backend Architecture**
    *   [✅ Done] Create `src/app/` structure (`core`, `routers`, `services`, `models`).
    *   [✅ Done] Move `config.py` and `auth.py` to `src/app/core/`.
    *   [✅ Done] Create `main.py` app factory.
    *   [✅ Done] Extract `sessions` and `ask` endpoints to `src/app/routers/`.
    *   [✅ Done] Extract initial `agent_service.py` to `src/app/services/`.
    *   [✅ Done] Implement proper Dependency Injection (remove global state: `sessions`, `session_messages`, `user_agents` from routers/services).
    *   [✅ Done] Create repository layer (`src/app/repositories/`) for session and message management.
    *   [✅ Done] Move Pydantic models to `src/app/models/` or `src/app/schemas/`.

**Task 2.2: Refactor CSV Data Access**
    *   [✅ Done] Create a dedicated data service in `src/app/services/data_service.py`.
    *   [✅ Done] Implement proper error handling for CSV file access.
    *   [✅ Done] Update agent service to use the data service.

**Task 2.3: Refactor Agent Implementation**
    *   [✅ Done] Create `packages/agents/`.
    *   [✅ Done] Refactor agent logic per Rule `07` (structured tools, prompts).
    *   [✅ Done] Implement proper agent state persistence.
    *   [✅ Done] Enhance agent logging per Rule `19`.
    *   [✅ Done] Integrate FinanceAgent into API service layer.

**Task 2.4: Standardize Backend Error Handling & Logging**
    *   [✅ Done] Implement global exception handlers (`core/exceptions.py`).
    *   [✅ Done] Ensure API error responses follow Rule `11` schema.
    *   [✅ Done] Implement structured JSON logging.

---

## Phase 3: Frontend Enhancements (In Progress)

*Objective: Improve frontend structure, state management, user experience, and rule compliance.*

**Task 3.1: Extract Shared Frontend Logic & Consolidate State Management**
    *   [✅ Done] Extract reusable UI components to `packages/ui/`.
    *   [✅ Done] Extract custom hooks to `packages/hooks/`.
    *   [✅ Done] Extract AuthContext/helpers to `packages/auth/`.
    *   [✅ Done] Extract API client logic to `packages/api-client/`.
    *   [✅ Done] Move shared types to `packages/types/`.
    *   [✅ Done] Refactor `apps/web` components to use shared packages.
    *   [✅ Done] Analyze and consolidate session state management.

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

This updated roadmap reflects the completion of Phase 2, with the implementation of proper dependency injection, repository layer, data service, model organization, and agent implementation. The application now follows a more maintainable and testable architecture while continuing to use static CSV files as the data source. 

The FinanceAgent has been successfully refactored into a separate package in `packages/agents/neurofinance_agents` and integrated with the API service layer, providing a cleaner separation of concerns and better reusability across the application.

Error handling and logging have been standardized according to Rule 11, with global exception handlers, consistent API error responses, and structured JSON logging. 

Recent updates also include fixing critical JWT authentication issues:
- Fixed JWT signature verification using the correct Supabase JWT secret
- Modified JWT verification to disable audience validation while maintaining signature verification
- Added proper environment variable configuration for JWT secrets in the backend
- Resolved issues with auth token passing between frontend and backend services

Additionally, Task 3.1 is now complete with the consolidation of session state management. This included:
- Moving shared types to `packages/types/`
- Extracting API client logic to `packages/api-client/`
- Ensuring consistent React versions across packages
- Implementing proper TailwindCSS configuration to handle UI components from packages
- Fixing component styling issues by ensuring CSS classes are properly processed 