---
name: taro-weapp-project-standards
description: Reusable architecture and coding standards for Taro 4 + React + TypeScript WeChat mini-program projects, especially projects using NutUI React Taro, Tailwind CSS v3, Webpack5, pnpm, subpackages, centralized routing, and service-layer API calls. Use when creating a new mini-program project, adding pages or features, reviewing implementation plans, organizing project structure, setting up route/request conventions, or checking WeChat mini-program compatibility and package-size constraints.
---

# Taro Weapp Project Standards

## Core Workflow

1. Confirm the target is the WeChat mini-program runtime. Do not assume H5, DOM APIs, browser-only CSS, or web-only third-party packages are available.
2. Read the project-local instructions first when they exist: `AGENTS.md`, `docs/architecture.md`, `docs/frontend-technical-guidelines.md`, route config, request utilities, and design references.
3. Keep the implementation conservative: reuse existing components, service modules, route helpers, theme tokens, and build conventions before adding new abstractions.
4. For library, framework, SDK, API, CLI, or cloud-service usage, fetch current documentation with Context7 before answering or changing code.
5. Apply the detailed checklist in [references/miniapp-standards.md](references/miniapp-standards.md) when creating pages, services, components, assets, or validation steps.

## Architecture Defaults

- Use `pnpm`.
- Prefer Taro 4, React 18, TypeScript, NutUI React Taro, Tailwind CSS v3, and Webpack5 unless the target project explicitly chooses otherwise.
- Keep user-facing project documentation, reviews, and handoff notes in Chinese by default. Keep code identifiers, commands, paths, API fields, and commit messages in their original language.
- Use Tailwind `className` first for page styling. Use inline styles only for dynamic values, component-library variable overrides, or mini-program compatibility needs.
- Prefer NutUI React Taro and existing project components over custom equivalents.
- Avoid heavyweight architecture, state machines, or broad abstractions unless there is clear business value.

## Project Shape

Use this structure unless the target project already has a better-established convention:

```text
src
├── app.config.ts
├── app.ts
├── app.scss
├── assets
│   └── tabbar
├── components
│   └── business
├── pages
├── services
├── shared
│   ├── request.ts
│   └── router.ts
└── types
```

- Put cross-business infrastructure in `src/shared/`.
- Put business API wrappers in `src/services/`; pages should not call `Taro.request` directly.
- Put cross-page reusable components in `src/components/`.
- Put page-private components in `src/pages/<page>/components/`.
- Keep static page data and local types in `*.data.ts` and `types.ts`.
- Split files before they grow past roughly 500 lines or mix unrelated responsibilities.

## Routing And Subpackages

- Keep only tabBar and first-screen pages in the main package.
- Put non-first-screen business pages into subpackages by business domain.
- When adding or moving pages, update both `src/app.config.ts` and `src/shared/router.ts`.
- Use route constants and helpers such as `router.to(routes.xxx)` and `router.switchTab(...)`; do not scatter raw route strings through pages.
- Do not add query strings to tabBar page navigation.
- Do not make one subpackage depend on another subpackage's internal page components.
- Keep the WeChat mini-program main package under 2 MB; evaluate new main-package assets and dependencies before adding them.

## Request And Data Rules

- Route all business requests through `src/services/<domain>.ts`.
- Wrap low-level requests through `src/shared/request.ts` with helpers like `api.get`, `api.post`, `api.put`, and `api.delete`.
- Keep API field meaning aligned with backend contracts. Normalize compatibility or fallback fields in helpers, not inside JSX.
- Normalize list and pagination responses before rendering.

## UI And Styling Rules

- Use NutUI React Taro components and `@nutui/icons-react-taro` for common UI.
- Use project theme tokens such as `brand`, `gold`, `tech`, `ink`, `muted`, `line`, and `canvas` when available.
- Avoid Tailwind classes that are assembled dynamically at runtime, such as `text-${color}`. Use explicit enum maps.
- Keep `preflight: false` for Tailwind in mini-program projects unless there is a proven reason to change it.
- Keep text no smaller than `20rpx` in mini-program pages.
- Prefer stable `flex`, `grid`, `gap`, spacing, radius, and shadow utilities that compile well through `weapp-tailwindcss`.

## Assets And Icons

- Use PNG assets for native tabBar icons and keep paths in `src/app.config.ts`.
- Compress local PNG/WebP/SVG assets to their actual display size before putting them into the main package.
- Keep small UI icons, badges, identity marks, and tabBar icons below roughly 50 KB each.
- Use local SVG/images plus an `AppIcon` wrapper for custom business icons when needed.
- Avoid remote iconfont by default. If required, account for HTTPS, CORS, load failure, and mini-program compatibility.

## Validation

- Run `pnpm typecheck` for normal feature work.
- Run `pnpm lint` or `pnpm check` when touching broader shared code or before handoff.
- Run `pnpm build:weapp` when changing build config, app entry config, dependencies, package layout, or release-sensitive flows.
- Do not run H5 validation unless the task explicitly targets H5.
- If assets, fonts, dependencies, main-package pages, or build config change, inspect the built mini-program package size.
