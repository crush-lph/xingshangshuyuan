# Member Purchase Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved lightweight member purchase flow: benefit page opens confirmation, confirmation page creates a VIP order, launches WeChat Pay, and confirms payment through an inline polling component.

**Architecture:** Keep payment-status polling out of the page by adding a reusable `PaymentStatusPoller` business component. Keep VIP API paths in `src/services/vip.ts`, with a small normalized query helper so pages and components do not parse backend status fields. Do not add a separate payment-result page.

**Tech Stack:** Taro 4, React 18, TypeScript, NutUI React Taro, Tailwind CSS v3, existing `api` request wrapper, existing `router`, existing `useUserInfo` store.

---

## File Structure

- Modify `src/services/vip.ts`: add `/api/vip/query_pay` payload, response types, raw API function, status normalizer, and normalized query helper.
- Create `src/components/business/PaymentStatusPoller.tsx`: reusable inline polling UI and timer lifecycle.
- Modify `src/components/business/index.ts`: export `PaymentStatusPoller`.
- Modify `src/pages/member/confirm/index.tsx`: remove success redirect immediately after `Taro.requestPayment`, render `PaymentStatusPoller` after WeChat Pay success, refresh user info after backend confirms payment.
- Modify `docs/api.md`: add `/api/vip/query_pay` to the member-upgrade API section.

The member benefit page already only navigates to `routes.memberConfirm`, so it does not need code changes unless button copy is adjusted later.

## Task 1: Add VIP Payment Query Service

**Files:**

- Modify: `src/services/vip.ts`
- Verify: `pnpm typecheck`

- [ ] **Step 1: Add query types and normalizer to `src/services/vip.ts`**

Append this code after `payVipOrder`:

```ts
export interface QueryVipPayPayload {
  order_no?: string
}

export interface QueryVipPayData {
  order_no?: string
  status?: number | string
  status_text?: string
  pay_status?: number | string
  pay_status_text?: string
  is_paid?: boolean
  paid?: boolean
  vip_level?: number
  vip_level_text?: string
  expire_at?: string
}

export type QueryVipPayResponse = ApiResponse<QueryVipPayData>

export type VipPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface NormalizedVipPaymentStatus {
  status: VipPaymentStatus
  message: string
  data: QueryVipPayData
}

export function queryVipPay(data: QueryVipPayPayload, options?: ApiBodyRequestOptions<QueryVipPayPayload>) {
  return api.post<QueryVipPayResponse, QueryVipPayPayload>('/api/vip/query_pay', data, options)
}

export function normalizeVipPaymentStatus(data: QueryVipPayData): NormalizedVipPaymentStatus {
  const rawStatus = data.pay_status ?? data.status
  const statusText = data.pay_status_text ?? data.status_text ?? ''
  const normalizedText = statusText.trim()

  if (data.is_paid || data.paid || rawStatus === 1 || rawStatus === '1' || normalizedText.includes('已支付')) {
    return { status: 'paid', message: normalizedText || '支付成功', data }
  }

  if (rawStatus === 2 || rawStatus === '2' || normalizedText.includes('取消')) {
    return { status: 'cancelled', message: normalizedText || '支付已取消', data }
  }

  if (rawStatus === -1 || rawStatus === 'failed' || rawStatus === 'fail' || normalizedText.includes('失败')) {
    return { status: 'failed', message: normalizedText || '支付失败', data }
  }

  return { status: 'pending', message: normalizedText || '支付结果确认中', data }
}

export async function queryVipPaymentStatus(orderNo: string) {
  const response = await queryVipPay({ order_no: orderNo })
  return normalizeVipPaymentStatus(response.data)
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: passes. If the local Codex runtime uses the wrong pnpm version, use the project-local command:

```bash
/bin/zsh -c 'source "$HOME/.nvm/nvm.sh" && ./node_modules/.bin/tsc --noEmit'
```

- [ ] **Step 3: Commit service change**

```bash
git add src/services/vip.ts
git commit -m "feat: add vip payment status query"
```

## Task 2: Add Reusable PaymentStatusPoller Component

**Files:**

- Create: `src/components/business/PaymentStatusPoller.tsx`
- Modify: `src/components/business/index.ts`
- Verify: `pnpm typecheck`

- [ ] **Step 1: Create `PaymentStatusPoller.tsx`**

Create `src/components/business/PaymentStatusPoller.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar } from './ActionBar'
import { SectionCard } from './SectionCard'

export type PaymentPollResultStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface PaymentPollResult<TData = unknown> {
  status: PaymentPollResultStatus
  message?: string
  data?: TData
}

export interface PaymentStatusPollerProps<TData = unknown> {
  orderNo: string
  queryStatus: (orderNo: string) => Promise<PaymentPollResult<TData>>
  intervalMs?: number
  timeoutMs?: number
  onSuccess: (result: PaymentPollResult<TData>) => void | Promise<void>
  onRetryPayment?: () => void | Promise<void>
  onBack?: () => void | Promise<void>
}

type PollViewStatus = 'polling' | 'paid' | 'timeout' | 'failed'

const DEFAULT_INTERVAL_MS = 2000
const DEFAULT_TIMEOUT_MS = 30000

function getStatusTitle(status: PollViewStatus) {
  if (status === 'paid') {
    return '支付成功'
  }

  if (status === 'failed') {
    return '支付确认失败'
  }

  if (status === 'timeout') {
    return '支付结果仍在确认中'
  }

  return '正在确认支付结果'
}

function getStatusDescription(status: PollViewStatus, message?: string) {
  if (message) {
    return message
  }

  if (status === 'paid') {
    return '已确认支付成功，正在为你更新会员权益。'
  }

  if (status === 'failed') {
    return '暂未确认支付成功，可以重新查询或重新发起支付。'
  }

  if (status === 'timeout') {
    return '支付结果可能有延迟，请稍后重新查询，避免重复支付。'
  }

  return '请稍候，系统正在同步微信支付结果。'
}

export function PaymentStatusPoller<TData = unknown>({
  intervalMs = DEFAULT_INTERVAL_MS,
  orderNo,
  onBack,
  onRetryPayment,
  onSuccess,
  queryStatus,
  timeoutMs = DEFAULT_TIMEOUT_MS
}: PaymentStatusPollerProps<TData>) {
  const [status, setStatus] = useState<PollViewStatus>('polling')
  const [message, setMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [attemptId, setAttemptId] = useState(0)
  const startedAtRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    let isActive = true

    async function checkStatus() {
      if (!isActive) {
        return
      }

      setIsChecking(true)

      try {
        const result = await queryStatus(orderNo)

        if (!isActive) {
          return
        }

        if (result.status === 'paid') {
          setStatus('paid')
          setMessage(result.message ?? '')
          await onSuccess(result)
          return
        }

        if (result.status === 'failed' || result.status === 'cancelled') {
          setStatus('failed')
          setMessage(result.message ?? '')
          return
        }

        if (Date.now() - startedAtRef.current >= timeoutMs) {
          setStatus('timeout')
          setMessage(result.message ?? '')
          return
        }

        timerRef.current = setTimeout(checkStatus, intervalMs)
      } catch {
        if (!isActive) {
          return
        }

        if (Date.now() - startedAtRef.current >= timeoutMs) {
          setStatus('timeout')
          setMessage('支付结果暂未同步，请稍后重新查询。')
          return
        }

        timerRef.current = setTimeout(checkStatus, intervalMs)
      } finally {
        if (isActive) {
          setIsChecking(false)
        }
      }
    }

    startedAtRef.current = Date.now()
    setStatus('polling')
    setMessage('')
    void checkStatus()

    return () => {
      isActive = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [attemptId, intervalMs, onSuccess, orderNo, queryStatus, timeoutMs])

  function handleRetryQuery() {
    setAttemptId((value) => value + 1)
  }

  const canRetry = status === 'timeout' || status === 'failed'

  return (
    <SectionCard title={getStatusTitle(status)}>
      <View className="grid gap-3">
        <Text className="block text-sm leading-6 text-muted">{getStatusDescription(status, message)}</Text>
        <Text className="block text-xs text-muted">订单号：{orderNo}</Text>
        {status === 'polling' ? (
          <Text className="block text-xs font-semibold text-brand">
            {isChecking ? '正在查询支付状态...' : '等待下一次查询...'}
          </Text>
        ) : null}
        {canRetry ? (
          <ActionBar
            actions={[
              {
                label: '返回权益页',
                variant: 'outline',
                onClick: onBack
              },
              {
                label: '重新查询',
                onClick: handleRetryQuery
              },
              {
                label: '重新支付',
                variant: 'gold',
                onClick: onRetryPayment
              }
            ]}
          />
        ) : null}
      </View>
    </SectionCard>
  )
}
```

- [ ] **Step 2: Export the component**

Modify `src/components/business/index.ts`:

```ts
export * from './PaymentStatusPoller'
```

Place it with the other component exports.

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: passes.

- [ ] **Step 4: Commit component**

```bash
git add src/components/business/PaymentStatusPoller.tsx src/components/business/index.ts
git commit -m "feat: add payment status poller"
```

## Task 3: Integrate Inline Polling Into Member Confirmation Page

**Files:**

- Modify: `src/pages/member/confirm/index.tsx`
- Verify: `pnpm typecheck`

- [ ] **Step 1: Update imports**

Modify the imports in `src/pages/member/confirm/index.tsx`:

```tsx
import { ActionBar, FieldList, PaymentStatusPoller, SectionCard } from '@/components/business'
import {
  createVipOrder,
  getUserProfile,
  getVipLevelPerks,
  payVipOrder,
  queryVipPaymentStatus,
  type CreateVipOrderData
} from '@/services'
import { useUserInfo } from '@/stores/user-info'
```

- [ ] **Step 2: Add polling state and user refresh hook**

Inside `MemberConfirmPage`, add:

```tsx
const refreshUserInfo = useUserInfo((state) => state.refreshUserInfo)
const [pollingOrderNo, setPollingOrderNo] = useState('')
```

- [ ] **Step 3: Change WeChat Pay success handling**

Replace the success section in `handleWechatPayment`:

```tsx
await requestWechatPayment(payResult.data.pay_params)

Taro.showToast({ title: '支付成功', icon: 'success' })
router.redirect(routes.userBenefits)
```

with:

```tsx
await requestWechatPayment(payResult.data.pay_params)

setPollingOrderNo(nextOrder.order_no)
Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
```

Keep the catch block unchanged so cancel and failure stay on the confirmation page.

- [ ] **Step 4: Add poller callbacks**

Add these functions inside `MemberConfirmPage`:

```tsx
async function handlePaymentConfirmed() {
  await refreshUserInfo()
  Taro.showToast({ title: '会员权益已更新', icon: 'success' })
  router.redirect(routes.userBenefits)
}

function handleRetryPayment() {
  setPollingOrderNo('')
  void handleWechatPayment()
}

function handleBackToBenefit() {
  router.redirect(routes.memberBenefit)
}
```

- [ ] **Step 5: Disable duplicate actions while polling**

Add:

```tsx
const isPaymentLocked = isPaying || Boolean(pollingOrderNo)
```

Use `isPaymentLocked` for both action buttons:

```tsx
disabled: isPaymentLocked
```

Keep the WeChat button label:

```tsx
label: isPaymentLocked ? '支付处理中' : '微信支付升级'
```

- [ ] **Step 6: Render the inline poller**

Render this block above `ActionBar`:

```tsx
{
  pollingOrderNo ? (
    <PaymentStatusPoller
      orderNo={pollingOrderNo}
      queryStatus={queryVipPaymentStatus}
      onBack={handleBackToBenefit}
      onRetryPayment={handleRetryPayment}
      onSuccess={handlePaymentConfirmed}
    />
  ) : null
}
```

- [ ] **Step 7: Run typecheck and lint**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both pass. Do not run `pnpm build:weapp` unless build output needs validation.

- [ ] **Step 8: Commit page integration**

```bash
git add src/pages/member/confirm/index.tsx
git commit -m "feat: poll vip payment status inline"
```

## Task 4: Update API Documentation

**Files:**

- Modify: `docs/api.md`
- Verify: `pnpm format:check` or targeted Prettier

- [ ] **Step 1: Add `/api/vip/query_pay` to the overview table**

In the “接口总览” table, add this row near the existing member-upgrade rows:

```md
| 会员升级 | 查询会员升级支付状态 | POST | `/api/vip/query_pay` | 是 | `vip.queryVipPay` |
```

- [ ] **Step 2: Add endpoint details to the 会员升级 section**

Add this section after “发起会员升级订单支付”:

```md
### 查询会员升级支付状态

- 方法：`POST`
- 路径：`/api/vip/query_pay`
- 认证：是
- Service：`vip.queryVipPay`

请求 Query：

无。

请求 Body：

| 字段     | 类型   | 必填 | 说明     | 示例 |
| -------- | ------ | ---- | -------- | ---- |
| order_no | string | 是   | 订单编号 |      |

响应 Data：

| 字段            | 类型             | 必填 | 说明           | 示例 |
| --------------- | ---------------- | ---- | -------------- | ---- |
| order_no        | string           | 否   | 订单编号       |      |
| status          | number \| string | 否   | 订单或支付状态 |      |
| status_text     | string           | 否   | 状态文字       |      |
| pay_status      | number \| string | 否   | 支付状态       |      |
| pay_status_text | string           | 否   | 支付状态文字   |      |
| is_paid         | boolean          | 否   | 是否已支付     |      |
| vip_level       | number(integer)  | 否   | 会员等级       |      |
| vip_level_text  | string           | 否   | 会员等级文字   |      |
| expire_at       | string           | 否   | 会员到期时间   |      |
```

- [ ] **Step 3: Format docs**

Run:

```bash
pnpm exec prettier --write docs/api.md
```

If the Codex pnpm version is incompatible, run:

```bash
/bin/zsh -c 'source "$HOME/.nvm/nvm.sh" && ./node_modules/.bin/prettier --write docs/api.md'
```

- [ ] **Step 4: Commit docs**

```bash
git add docs/api.md
git commit -m "docs: document vip payment query"
```

## Task 5: Final Verification

**Files:**

- Verify all changed files from Tasks 1-4.

- [ ] **Step 1: Run required checks**

Run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both pass.

- [ ] **Step 2: Manual WeChat mini-program flow check**

In WeChat DevTools or a real device:

1. Open the member benefits page.
2. Tap “开通/升级领航”.
3. Confirm no order is created before tapping “微信支付升级”.
4. Tap “微信支付升级”.
5. Verify order creation calls `/api/vip/order`.
6. Verify payment params call `/api/vip/pay`.
7. Cancel WeChat Pay and verify the page stays on confirmation with cancel feedback.
8. Repeat and complete WeChat Pay.
9. Verify the confirmation page shows inline payment confirmation status.
10. Verify `/api/vip/query_pay` is called every 2 seconds.
11. Verify polling stops after success and navigates to “我的权益”.
12. Force query timeout and verify retry actions appear after about 30 seconds.

- [ ] **Step 3: Check git scope**

Run:

```bash
git status --short
```

Expected: only intentional unrelated pre-existing workspace changes remain. Do not revert unrelated files.

- [ ] **Step 4: Final commit if needed**

If previous tasks were not committed individually, stage exact files only:

```bash
git add src/services/vip.ts src/components/business/PaymentStatusPoller.tsx src/components/business/index.ts src/pages/member/confirm/index.tsx docs/api.md
git commit -m "feat: confirm vip payment status inline"
```
