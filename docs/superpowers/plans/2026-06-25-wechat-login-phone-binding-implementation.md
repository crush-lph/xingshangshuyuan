# WeChat Login Phone Binding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement confirmed WeChat login flow with mandatory phone binding after login.

**Architecture:** Keep the existing Taro/Zustand auth structure. Extend the auth service payload to accept the new WeChat phone `code`, expose phone-bound state from `useUserInfo`, add a phone-bound guard for protected business actions, and update the profile header to submit `event.detail.code` first.

**Tech Stack:** Taro 4, React 18, TypeScript, Zustand, NutUI React Taro, WeChat Mini Program `openType="getPhoneNumber"`.

---

## File Structure

- Modify `src/services/auth.ts`: add `code?: string` to `BindPhonePayload`.
- Modify `src/stores/user-info.ts`: add `isPhoneBound`, compute it from `userInfo.phone` or `profile.phone`, and support phone binding with new `code`.
- Modify `src/shared/auth-guard.ts`: add `ensurePhoneBound()` for core business actions.
- Create `src/pages/user/login/index.tsx`: dedicated WeChat login page.
- Create `src/pages/user/login/index.config.ts`: login page navigation title.
- Create `src/pages/user/bind-phone/index.tsx`: dedicated phone binding page.
- Create `src/pages/user/bind-phone/index.config.ts`: phone binding page navigation title.
- Create `src/pages/user/components/AuthShell.tsx`: restrained auth-page shell without decorative circles.
- Modify `src/shared/router.ts`: parse redirect URLs into structured `{ path, query }` routes and drop query for tabBar redirects.
- Modify `src/app.config.ts` and `src/shared/router.ts`: register the auth page route.
- Modify `src/pages/profile/components/ProfileHeader.tsx`: read `event.detail.code` from `onGetPhoneNumber` and pass it to `bindWechatPhone`.
- Modify selected core action pages already using `ensureLoggedIn()`: switch actions that require a contact phone to `ensurePhoneBound()`.
- Verify with `pnpm typecheck` and `pnpm build:weapp`.

## Tasks

### Task 1: Service Contract

**Files:**

- Modify: `src/services/auth.ts`

- [ ] **Step 1: Extend bind phone payload**

Change `BindPhonePayload` to:

```ts
export interface BindPhonePayload {
  code?: string
  encrypted_data?: string
  iv?: string
}
```

- [ ] **Step 2: Verify TypeScript accepts the service contract**

Run: `pnpm typecheck`

Expected: if it fails, failures should be from later unimplemented call sites or existing workspace issues, not from `BindPhonePayload`.

### Task 2: User Store Phone-Bound State

**Files:**

- Modify: `src/stores/user-info.ts`

- [ ] **Step 1: Add phone-bound helper**

Add:

```ts
function getIsPhoneBound(userInfo: GetUserInfoData | null, profile: GetUserProfileData | null) {
  return Boolean(userInfo?.phone || profile?.phone)
}
```

- [ ] **Step 2: Add state property**

Add to `UserInfoState`:

```ts
isPhoneBound: boolean
```

Initialize it from current empty state:

```ts
isPhoneBound: false
```

- [ ] **Step 3: Update all state transitions**

Whenever `userInfo` or `profile` are set, also set:

```ts
isPhoneBound: getIsPhoneBound(userInfo, profile)
```

For clear/unauthorized/logout states, set:

```ts
isPhoneBound: false
```

- [ ] **Step 4: Support phone code in bindWechatPhone**

Change signature to:

```ts
bindWechatPhone: (payload: { code?: string; encryptedData?: string; iv?: string }) => Promise<void>
```

Build request data with `code` first:

```ts
const requestPayload = payload.code ? { code: payload.code } : { encrypted_data: payload.encryptedData, iv: payload.iv }
```

Reject when neither `code` nor legacy encrypted data exists.

- [ ] **Step 5: Verify store types**

Run: `pnpm typecheck`

Expected: no new errors from `src/stores/user-info.ts`.

### Task 3: Phone-Bound Guard

**Files:**

- Modify: `src/shared/auth-guard.ts`

- [ ] **Step 1: Import user store**

Add:

```ts
import { useUserInfo } from '@/stores/user-info'
```

- [ ] **Step 2: Add ensurePhoneBound**

Add:

```ts
export async function ensurePhoneBound(message = '绑定手机号后才能继续操作') {
  if (!getAuthToken()) {
    return ensureLoggedIn('请先登录并绑定手机号后继续操作')
  }

  const state = useUserInfo.getState()

  if (!state.userInfo && !state.profile) {
    await state.loadUserInfo().catch(() => undefined)
  }

  if (useUserInfo.getState().isPhoneBound) {
    return true
  }

  const result = await Taro.showModal({
    title: '需要绑定手机号',
    content: message,
    confirmText: '去绑定',
    cancelText: '取消'
  })

  if (result.confirm) {
    router.to(routes.profile)
  }

  return false
}
```

- [ ] **Step 3: Verify guard types**

Run: `pnpm typecheck`

Expected: no new errors from `src/shared/auth-guard.ts`.

### Task 4: Profile Header Binding UI

**Files:**

- Modify: `src/pages/profile/components/ProfileHeader.tsx`

- [ ] **Step 1: Read new getPhoneNumber code**

Change event typing to include `code`:

```ts
async function handleBindPhone(event: { detail?: { code?: string; encryptedData?: string; iv?: string } }) {
  await bindWechatPhone({
    code: event.detail?.code,
    encryptedData: event.detail?.encryptedData,
    iv: event.detail?.iv
  })
}
```

- [ ] **Step 2: Use explicit phone-bound state**

Read `isPhoneBound` from `useUserInfo()` and use it to choose the bound/unbound branch instead of duplicating phone checks.

- [ ] **Step 3: Improve unbound copy**

For logged-in unbound users, keep the WeChat phone button as the primary action and show copy that explains why binding is required.

- [ ] **Step 4: Verify component types**

Run: `pnpm typecheck`

Expected: no new errors from `ProfileHeader.tsx`.

### Task 5: Core Action Guards

**Files:**

- Modify pages that currently import `ensureLoggedIn` for phone-required actions:
  - `src/pages/resource/purchase/index.tsx`
  - `src/pages/resource/submit/index.tsx`
  - `src/pages/event/signup/index.tsx`
  - `src/pages/member/confirm/index.tsx`
  - `src/pages/member/payment-transfer/index.tsx`
  - `src/pages/opportunity/apply/index.tsx`
  - `src/pages/opportunity/publish/index.tsx`
  - `src/pages/user/cert/index.tsx`

- [ ] **Step 1: Replace imports**

Change:

```ts
import { ensureLoggedIn } from '@/shared/auth-guard'
```

to:

```ts
import { ensurePhoneBound } from '@/shared/auth-guard'
```

- [ ] **Step 2: Replace guarded calls**

Change calls such as:

```ts
if (!(await ensureLoggedIn())) return
```

to:

```ts
if (!(await ensurePhoneBound())) return
```

Use a more specific message only when the existing page already has contextual wording.

- [ ] **Step 3: Verify guard usage**

Run:

```bash
rg -n "ensureLoggedIn|ensurePhoneBound" src/pages src/shared
```

Expected: core phone-required pages use `ensurePhoneBound`; lower-risk read-only flows can still use `ensureLoggedIn`.

### Task 6: Final Verification

**Files:**

- All modified source files.

- [ ] **Step 1: Typecheck**

Run: `pnpm typecheck`

Expected: passes.

- [ ] **Step 2: WeChat build**

Run: `pnpm build:weapp`

Expected: passes because this touches WeChat-specific auth UI and page guards.

- [ ] **Step 3: Review diff**

Run:

```bash
git diff -- src/services/auth.ts src/stores/user-info.ts src/shared/auth-guard.ts src/pages/profile/components/ProfileHeader.tsx src/pages/resource/purchase/index.tsx src/pages/resource/submit/index.tsx src/pages/event/signup/index.tsx src/pages/member/confirm/index.tsx src/pages/member/payment-transfer/index.tsx src/pages/opportunity/apply/index.tsx src/pages/opportunity/publish/index.tsx src/pages/user/cert/index.tsx
```

Expected: diff only contains login, phone binding, and guard changes.
