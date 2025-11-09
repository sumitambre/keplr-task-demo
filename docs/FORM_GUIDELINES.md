# Frontend Form System Guidelines

This document defines how forms are built in the Admin and Technician UIs to ensure consistency, accessibility, and maintainability across entities (User, Client, Task, etc.). It covers the shared FormBuilder, schema patterns, data sources, and conventions used in this repo.

## Goals
- Single, schema‑driven form system for Admin + Technician.
- Consistent UX (layout, labels, actions) across entities.
- Ready for i18n/RTL, accessible, and offline‑friendly.
- Easy to wire to mock data now, and API later.

## Core Pieces

- Form renderer: `src/components/forms/FormBuilder.tsx`
  - Props:
    - `schema`: `{ title?: string; sections: Section[] }`
    - `value`: plain object holding current form values
    - `onChange(next)`: updates parent state with new values
    - `onSave()`: invoked on submit
    - `onCancel?()`: optional cancel handler
    - `submitLabel?`: button label (default "Save")
    - `dataSources?`: record of arrays used by combobox fields (e.g., `clients`, `sites`, `taskTypes`, `serviceTypes`, `users`)
    - `renderExtras?(local, helpers)`: render custom content (e.g., complex pickers) inside the form
    - `extrasAfterFieldKey?`: interleave `renderExtras` immediately after a specific field key within a non‑repeat section

- Schema shape
  - Section: `{ key: string; title?: string; fields: Field[]; repeatable?: boolean }`
  - Field variants:
    - `text | tel | email | number`
    - `select` with `options: { value: string; label: string }[]`
    - `combobox` with `dataSourceKey: string` and optional `multiple: boolean`
    - `textarea`

## Conventions

- Location
  - Keep schemas per entity in `src/components/forms/*Schema.ts`
    - Examples: `userSchema.ts`, `clientSchema.ts`, `taskSchema.ts`
  - Keep thin wrappers in `src/components/forms/*Form.tsx` that import the schema and pass props to `FormBuilder`

- Data sources
  - `combobox` fields read from `dataSources[dataSourceKey]` (array of strings)
  - Supported keys today: `clients`, `sites`, `taskTypes`, `serviceTypes`, `users`, plus any entity‑specific lists
  - Note: The current `FormBuilder` may mutate `dataSources` locally on "Add New" inside combobox. Prefer updating `dataSources` in the parent when possible to keep immutability; this may be refactored to a callback later.

- Values and mapping
  - UI state favors human‑readable names for easier selection (e.g., task type names)
  - Map names → IDs at submit time when building DTOs for the API

- Layout and actions
  - Use the `Card` layout and grid provided by `FormBuilder`
  - `onCancel` renders a Cancel button when provided; `submitLabel` controls the Save button label
  - When embedding forms in dialogs, keep actions consistent (one set of primary actions)

- i18n/RTL/accessibility
  - Labels should be translatable (avoid hard‑coded strings when wiring i18n)
  - Use neutral spacing classes compatible with RTL; avoid directional assumptions
  - Ensure `Label` is linked to inputs (`htmlFor`/`id`), keyboard navigation works in comboboxes, and contrast meets WCAG AA

## Behavior Patterns

- Tasks (example)
  - Client selection filters available `sites`, allowed `taskTypes`, and `serviceTypes`
  - Changing `taskTypes` can derive read‑only info (e.g., required skills) shown via `renderExtras`

- Repeatable sections (Clients → Sites)
  - Use `repeatable: true` for sections like `sites`
  - Values are stored in arrays under `value[sectionKey]`

## Example: Task Schema (keys only)

```ts
export const taskFormSchema = {
  title: 'Task',
  sections: [
    {
      key: 'root',
      title: 'Task',
      fields: [
        { key: 'client', label: 'Client', type: 'combobox', dataSourceKey: 'clients' },
        { key: 'clientSite', label: 'Client Site', type: 'combobox', dataSourceKey: 'sites' },
        { key: 'onsiteContactName', label: 'On-Site Contact Name', type: 'text' },
        { key: 'contactNumber', label: 'Contact Number', type: 'tel' },
        { key: 'taskTypes', label: 'Task Types', type: 'combobox', dataSourceKey: 'taskTypes', multiple: true },
        { key: 'serviceTypes', label: 'Service Types', type: 'combobox', dataSourceKey: 'serviceTypes', multiple: true },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'Low', label: 'Low' },
          { value: 'Medium', label: 'Medium' },
          { value: 'High', label: 'High' }
        ] },
        { key: 'dueDate', label: 'Due Date', type: 'text' },
        { key: 'titleTemplate', label: 'Title Template', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' }
      ]
    }
  ]
};
```

## Adding a New Form
1) Create `src/components/forms/<entity>Schema.ts` with sections and fields
2) Create `src/components/forms/<Entity>Form.tsx` that imports the schema and renders `FormBuilder`
3) Provide any needed `dataSources` arrays to the form (e.g., via page container)
4) On submit, map UI names to server IDs in one place before hitting the API

## Quick Checklist
- Uses `FormBuilder` with a schema file in `src/components/forms`
- Consistent labels and layout; accessible `Label`/`id` pairs
- Comboboxes backed by `dataSources`; avoid mutating props where possible
- Names → IDs mapping handled on submit
- i18n/RTL ready; avoid LTR‑only assumptions
- Dialogs avoid duplicate action bars; keep one primary action set

