Purpose

Admin console for managers: assign/oversee tasks, purchases & receipts, dashboards/reports, settings, users/clients/task types; bilingual EN/AR, RTL.

Architecture & Patterns

React + TS + Vite; React Router (nested routes), TanStack Query for server state, light local state via useState/useReducer.

UI Kit: Tailwind + shadcn/ui; lucide-react icons; dark-first theming with per-tenant primary color. Pastel KPI cards; responsive grid for cards; compact inline quick filters.

i18n: i18next with EN/AR namespaces; RTL flip using dir attr & logical CSS props; date/number localization.

Routing
/ (Dashboard)
/tasks
/clients
/users
/work-structure
/purchases-receipts
/reports (operations|financial)
/settings


“Today” dashboard with KPI cards & inline quick filters (User/Client/Status, Clear). Overdue banner when applicable.

Data & Queries

api.ts wrapper adds Authorization: Bearer, X-Tenant (if needed).

Query keys by feature, e.g. ['tasks',{filters}], ['clients'].

Prefetch clients/work-structure for forms; invalidate tasks on create/complete.

Components (not exhaustive)

DashboardCards (Total, Completed, In Progress, Pending) in responsive grid.

QuickFilters row with compact Selects + “Clear”.

TaskTable (admin ops views), PurchasesReceiptsTable with footer totals.

Forms & Rules

New Task: Title (free text), Task Type, Client, Client Site, Assign To (filtered by skills/department), Priority (default Medium), Status (default Pending), Due Date, Description. Primary/Secondary actions.

Validation: required fields; duration computed automatically when started/completed.

Performance

Code-split routes; prefetch likely lists; table virtualization for large data; image thumbnails lazy-load.

Targets align with root NFRs (TTI < 3s on mid-tier Android via PWA).

Accessibility & Localization

WCAG AA, large tap targets; bilingual text; RTL mirroring; device font scaling supported.

Commands

npm run dev|build|preview|lint|test

Theming Exception (Do Not Change)

- Admin Dashboard KPI cards (Total, Completed, In Progress, Pending) must always render their text and icons in pure black, regardless of light/dark theme or tenant brand color.
- Implementation detail: these cards use a container with `text-black` applied (see `components/admin/Dashboard.tsx` around the KPI grid). Do not replace with `text-card-foreground` or any theme token.
- If refactoring or extracting these cards, preserve the `text-black` styling explicitly on the text container and inherited elements so the color does not vary with theme.
