# Admin Closure Visible States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make P0 admin pages honest and operationally clear with current APIs: real data, explicit loading/error/empty states, and visible interface-gap notices for actions that cannot yet be performed.

**Architecture:** Add a small reusable business component for interface-gap notices, then update admin order, certification, resource, and opportunity pages to use `AdminGuard`, `StateNotice`, real list loading states, and gap copy. Do not add fake backend actions for confirmation, approval, assignment, or matchmaking.

**Tech Stack:** Taro 4, React 18, TypeScript, Tailwind CSS, existing `@/services`, `PageShell`, and `business` components.

---

### Task 1: Add Interface Gap Notice Component

**Files:**

- Create: `src/components/business/InterfaceGapNotice.tsx`
- Modify: `src/components/business/index.ts`

- [x] **Step 1: Create `InterfaceGapNotice`**

Implement a small card component accepting `title`, `desc`, and `items`. It renders a `SectionCard` with muted explanatory text and a bullet list of missing interface capabilities.

- [x] **Step 2: Export the component**

Add `export * from './InterfaceGapNotice'` to `src/components/business/index.ts`.

### Task 2: Update Admin Order Confirmation Page

**Files:**

- Modify: `src/pages/admin/orders/index.tsx`

- [x] **Step 1: Add guarded content structure**

Wrap page content with `AdminGuard`, track `isLoading` and `hasError`, and use `StateNotice` for loading/error/empty states.

- [x] **Step 2: Add interface gap notice**

Show that backend confirmation, voucher rejection, and membership/resource activation interfaces are not available yet.

### Task 3: Update Admin Certification Page

**Files:**

- Modify: `src/pages/admin/cert/index.tsx`

- [x] **Step 1: Add guarded content structure**

Wrap with `AdminGuard`, track loading/error, and keep the current real certification data source.

- [x] **Step 2: Add interface gap notice**

Show that backend certification list, approval, rejection, and supplement-material interfaces are not available yet.

### Task 4: Update Admin Resource Demand Page

**Files:**

- Modify: `src/pages/admin/resource/index.tsx`

- [x] **Step 1: Add guarded content structure**

Wrap with `AdminGuard`, preserve real customer/contract reads, and add loading/error/empty states.

- [x] **Step 2: Add interface gap notice**

Show that backend resource-demand queue, assignment, status update, and delivery progress interfaces are not available yet.

### Task 5: Update Admin Opportunity Matchmaking Page

**Files:**

- Modify: `src/pages/admin/opportunity/index.tsx`

- [x] **Step 1: Add guarded content structure**

Wrap with `AdminGuard`, preserve real opportunity reads, and add loading/error/empty states.

- [x] **Step 2: Keep only real status action**

Keep the existing close action through `updateOpportunityStatus`, refresh the list after success, and show missing matchmaking interfaces separately.

### Task 6: Verify

**Files:**

- Check changed TypeScript files and docs.

- [x] **Step 1: Format changed files**

Run Prettier on changed TSX and markdown files.

- [x] **Step 2: Typecheck**

Run `pnpm typecheck`.
