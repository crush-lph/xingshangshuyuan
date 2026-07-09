# Mini-Program Standards Checklist

## Context To Read In A Target Project

Read only the files that exist and are relevant to the request:

- `AGENTS.md` or equivalent project agent instructions.
- `docs/architecture.md` for boundaries and module ownership.
- `docs/frontend-technical-guidelines.md` for local React, request, and styling rules.
- `docs/api.md` for backend contracts.
- `docs/reference/` and design-system docs for prototype and visual requirements.
- `src/app.config.ts` for routes, subpackages, tabBar, and window config.
- `src/shared/router.ts` for route constants and navigation helpers.
- `src/shared/request.ts` for request shape and service expectations.
- `tailwind.config.js` for theme tokens, content scanning, and mini-program Tailwind setup.

## Page Creation Checklist

1. Decide whether the page belongs in the main package or a business subpackage.
2. Create `src/pages/<domain>/<page>/index.tsx`.
3. Add `index.config.ts` when the page needs title, navigation style, pull-down behavior, or other page config.
4. Register the page in `src/app.config.ts`.
5. Add or update a route constant in `src/shared/router.ts`.
6. Use `router.to`, `router.switchTab`, or other existing helpers for navigation.
7. Split complex sections into `components/`, data into `*.data.ts`, and page-local types into `types.ts`.
8. Run at least `pnpm typecheck`.

## Component Checklist

- Keep props explicitly typed.
- Avoid `any` for business data.
- Keep page-private display components inside the page directory first.
- Move components to `src/components/` or `src/components/business/` only after real cross-page reuse appears.
- Prefer existing NutUI and project components before writing custom controls.
- Keep page `index.tsx` focused on orchestration instead of dense JSX details.

## Request Checklist

- Add endpoint wrappers under `src/services/<domain>.ts`.
- Import `api` from `src/shared/request.ts`; do not call `Taro.request` in pages.
- Type request payloads and responses.
- Normalize backend shape changes in service/helper functions.
- Avoid encoding backend fallback logic directly in JSX.

## React And State Checklist

- Do not synchronously reset multiple states at the top of `useEffect`.
- Express initial loading state through `useState` defaults when possible.
- Protect async effects from updating unmounted components.
- Prefer derived variables or `useMemo` for values computed from existing state or params.
- Refresh data through explicit events or a stable refresh signal such as `refreshKey`.
- Do not silence `react-hooks/exhaustive-deps` to hide unstable dependencies.

## Tailwind And Mini-Program Styling Checklist

- Prefer Tailwind `className` and project theme tokens.
- Keep dynamic styles out of Tailwind class construction; use explicit class maps.
- Add new source paths to `tailwind.config.js` `content` when needed.
- Keep Tailwind `preflight: false`.
- Use mini-program-friendly layout utilities first: `flex`, `grid`, `gap`, `px`, `py`, `rounded-lg`, and known project shadows.
- Avoid fragile browser CSS assumptions such as DOM selectors, fixed viewport hacks, unsupported pseudo-elements, and web-only layout APIs.
- Keep small text at or above `20rpx`.

## Package And Asset Checklist

- Keep tabBar icons in `src/assets/tabbar/` and reference them from `src/app.config.ts`.
- Compress local images to their display size.
- Avoid adding large assets or dependencies to the main package without measuring impact.
- Move non-critical pages and assets into subpackages when appropriate.
- After relevant changes, inspect `dist` non-map files and keep the main package under 2 MB.

## Review Checklist

- Page registration and route constants are synchronized.
- No raw duplicate route strings are scattered through pages.
- No direct page-level `Taro.request` calls were added.
- No Tailwind classes are built through unscannable runtime string interpolation.
- NutUI component styles are imported as required by the target project.
- No H5-only APIs, DOM access, or browser-only packages were introduced for WeChat mini-program flows.
- TypeScript passes.
- Build validation is run when build configuration, dependencies, app entry config, package structure, assets, or release-sensitive behavior changes.

## Context7 Rule

Use Context7 before answering or changing code for questions involving library, framework, SDK, API, CLI, cloud-service usage, setup, configuration, debugging, or migration.

Recommended sequence:

```bash
npx ctx7@latest library "<official-library-name>" "<full user question>"
npx ctx7@latest docs "<selected-/org/project-id>" "<full user question>"
```

Use the official library name when possible. If the result is weak, try one alternate name or add `--research` to the docs command. Do not include secrets in Context7 queries.
