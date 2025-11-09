Keplr Task – Engineering Guidance
Scope & Philosophy

Keplr Task is a multi-tenant field-service PWA for technicians and managers. MVP covers auth/multi-tenancy, task lifecycle (start → complete), geo capture, before/after photos, signatures, PDF job sheets, dashboard & reports, purchases & receipts, EN/AR with RTL, offline-first. Phase-outs: inventory, route optimization, SLA/billing, in-app payments, complex analytics. Phase-2 ideas: STT (EN/AR/HI), AI triage/autofill/dedup, web push, advanced exports.

Overrides

Per-tenant branding & locale (logo, primary color, default language, RTL). UI reads tenant from JWT/subdomain and applies runtime theme/locale. Server enforces tenant isolation in all queries.

Tech vs Admin: technician app (mobile-first) prioritizes speed, offline; admin console focuses on control, visibility, reports.

Stack (versions)

Frontend (Admin + Technician): React + TypeScript, Vite, React Router, Tailwind. State/query with TanStack Query; IndexedDB for offline cache; PWA install & background sync.

Backend: ASP.NET Core 8 Web API, EF Core 8 (PostgreSQL), MediatR (CQRS), FluentValidation, Serilog, Redis (cache, Hangfire storage), Hangfire for jobs, S3-compatible object storage, QuestPDF (or wkhtmltopdf) for PDFs, Swagger/NSwag clients.

Node/TS/.NET

Node ≥ 20.x, PNPM or NPM 10.x; TypeScript ≥ 5.4

.NET 8 SDK

Monorepo structure (suggested)
/ (root)
  AGENTS.md
  .editorconfig
  .github/workflows/ci.yml
  /src                # Admin (React/Vite)
/userapp             # Technician (React/Vite mobile-first)
/backend             # ASP.NET Core 8 Web API
  /docs /scripts

Env Vars (root convention)

VITE_API_URL (frontend base URL)

VITE_TENANT_HINT (optional, for dev subdomain-less)

DATABASE_URL (Postgres URI) or ConnectionStrings__Default

JWT_SECRET (for dev only; prod uses Identity keys)

REDIS_URL, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY

PDF_ENGINE = questpdf|wkhtmltopdf

Commands

Admin: cd src && npm i && npm run dev|build|preview

Technician: cd userapp && npm i && npm run dev|build|preview

Backend: cd backend && dotnet restore && dotnet run

Tests: frontend npm run test, backend dotnet test

API & Auth (high-level)

JWT bearer; all routes tenant-scoped (resolver via subdomain/header/claim). ProblemDetails for errors. Standard CRUD + task actions (/tasks/start, /tasks/complete, media upload, PDF).

Data access patterns

Frontend: central src/lib/api.ts and userapp/lib/api.ts (fetch wrapper with auth, tenant header). TanStack Query for caching/invalidation. IndexedDB for offline entity caches (clients/task types) and queued writes (tasks/media/signature).

Backend: CQRS handlers per use case; EF Core contexts with global query filters by TenantId. Background jobs for media/PDF.

Code style / Lint / Test / CI

Prettier + ESLint (React/TS), Stylelint for Tailwind class ordering (optional).

Backend analyzers + nullable enabled; unit tests for handlers, integration tests for endpoints.

CI: build, lint, test; block on coverage threshold; PR templates with checklist below.

KPI / NFR targets

PWA TTI < 3s on mid-tier Android; task save RTT < 500ms (excl. media). Sync success ≥ 99% post-offline. ≥95% completed tasks have start/end+geo; ≥80% have signature. API p95 < 500ms. 99.9% availability target.

Quick Reviewer Checklist

Tenancy enforced? (query filters/middleware)

AuthZ (roles/policies) on endpoints & UI routes

ProblemDetails errors mapped to UI toasts

Query invalidation & optimistic updates correct

Offline queue conflict handling

PDF contains tenant branding & signed media URLs

EN/AR + RTL covered, WCAG AA contrast
Frontend Form System

Use the shared, schema-driven form system for Admin and Technician UIs. See docs/FORM_GUIDELINES.md for conventions, schema shape, field types, and examples. Keep entity schemas in src/components/forms/*Schema.ts and thin wrappers in *Form.tsx.

Forms/Actions Convention

- Use FormBuilder's built-in actions for submit/cancel in dialogs and pages. Do not add duplicate external buttons in DialogFooter unless there is a strong UX reason (e.g., persistent sticky footer across long content).
- Prefer:
  - `<FormBuilder onSave={...} onCancel={...} submitLabel="..." />` with default `showSubmit` (true).
  - Avoid setting `showSubmit={false}` and creating ad-hoc buttons in the parent.
- Scrolling: FormBuilder provides a sensible default scroll (`overflow-auto` with `maxHeight: calc(100dvh - 10rem)`). Avoid wrapping it with extra ScrollArea/overflow containers to prevent nested scrollbars. If a view needs page-level scrolling instead, override via `style={{ maxHeight: 'unset' }}`.

Theme & Card Guidelines (Light/Dark)

- Always use theme tokens for surfaces and text:
  - Cards and panels: `bg-card text-card-foreground`.
  - Borders: `border-border` or semantic variants.
  - Avoid `bg-white`/`text-black` and raw gray utilities on surfaces.
- Icons inside KPI/summary cards: `text-muted-foreground`.
- Buttons:
  - Solid action: `bg-primary text-primary-foreground hover:bg-primary/90`.
  - Outline secondary: `bg-card text-primary border border-primary hover:bg-primary/10`.
- Do not set `--background`/`--card` via JS at runtime. Brand/pastel accents should not override theme surfaces.
- Apply the same rules in Admin and Technician apps.

Responsive Tables & Cards (Admin)

- Use the shared `ResponsiveCardTable` for list views (Users, Clients, Work Structure, etc.).
- Behavior:
  - Desktop (md ≥ 768px): render the full table.
  - Mobile (< md): render a stack of cards with the same data.
- Cards: `rounded-xl border border-border bg-card p-4 shadow-sm`, text uses `text-card-foreground`; status via `Badge` (`default`/`secondary`).
- Actions: right-aligned buttons on both table rows and cards; keep labels icon-only or concise.
- Spacing: section headers `px-6 pt-6 pb-4`; section bodies `px-6 py-6`; sections separated with `mt-6`.
- Edit/Create flows: do not inline-expand rows; open a `Dialog` with `FormBuilder` using built-in submit/cancel.
- Import helper from the admin app: `import { ResponsiveCardTable } from "./ResponsiveCardTable";` and pass `table={...}` and `cards={...}`.
