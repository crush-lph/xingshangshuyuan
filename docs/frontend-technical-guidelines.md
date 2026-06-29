# 前端技术规范与最佳实践

本文档面向行商书苑微信小程序的日常开发、代码评审和问题排查。目标不是增加流程负担，而是把容易反复踩坑的写法提前约束清楚，保证 Taro 4 + React 18 + NutUI React Taro + Tailwind CSS v3 的实现长期稳定。

## 1. 技术基线

- 运行端：当前只验收微信小程序端。
- 技术栈：Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、Webpack5。
- 包管理器：`pnpm`。
- 代码入口：页面放在 `src/pages/`，接口放在 `src/services/`，基础能力放在 `src/shared/`。
- 文档语言：项目文档、评审结论和交接说明默认中文；代码标识、接口字段、命令保持原文。

## 2. React Hooks 与数据加载

本节依据 React 官方文档和 `eslint-plugin-react-hooks` 推荐规则整理。React 允许在 `useEffect` 中发起异步请求，但不推荐在 effect 主体同步重置状态，也不推荐通过禁用 `exhaustive-deps` 绕过依赖问题。

### 2.1 不在 `useEffect` 顶层同步 setState

React Hooks ESLint 新规则会拦截 `useEffect` 主体内的同步 `setState`。原因是 effect 本来发生在一次渲染之后，立即同步 `setState` 会制造额外级联渲染。

错误示例：

```tsx
useEffect(() => {
  setIsLoading(true)
  setHasError(false)

  void getUserCertification()
    .then((response) => setItems(response.data.list ?? []))
    .finally(() => setIsLoading(false))
}, [])
```

推荐写法：初始状态直接表达首屏加载态，effect 只负责请求和请求结果。

```tsx
const [items, setItems] = useState<ListItem[]>([])
const [isLoading, setIsLoading] = useState(true)
const [hasError, setHasError] = useState(false)

useEffect(() => {
  let isMounted = true

  void getUserCertification()
    .then((response) => {
      if (isMounted) {
        setItems(response.data.list ?? [])
      }
    })
    .catch(() => {
      if (isMounted) {
        setItems([])
        setHasError(true)
      }
    })
    .finally(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    })

  return () => {
    isMounted = false
  }
}, [])
```

### 2.2 刷新请求用事件或刷新信号驱动

当页面需要在按钮点击、提交成功、状态变更后刷新列表，可以在事件回调里设置加载态，或者使用 `refreshKey` 触发 effect。不要为了刷新把一个不稳定函数塞进 effect 依赖。

如果 effect 里要用请求函数，优先把函数定义在 effect 内部，或把稳定的业务请求放在 `src/services/`。不要通过删除依赖、禁用 `react-hooks/exhaustive-deps` 或把依赖数组留空来“压住” lint。

推荐写法：

```tsx
const [refreshKey, setRefreshKey] = useState(0)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  let isMounted = true

  async function loadList() {
    if (refreshKey > 0) {
      setIsLoading(true)
    }

    try {
      const response = await getMyOpportunities({ page: 1, page_size: 20 })
      if (isMounted) {
        setItems(response.data.list ?? [])
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  void loadList()

  return () => {
    isMounted = false
  }
}, [refreshKey])

async function handleClose(id: number) {
  await updateOpportunityStatus({ opportunity_id: id, status: 0 })
  setRefreshKey((current) => current + 1)
}
```

不推荐写法：

```tsx
useEffect(() => {
  void loadList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

### 2.3 派生数据优先计算，不落 state

能从接口数据、页面参数或已有 state 推导出来的数据，优先使用普通变量或 `useMemo`，不要额外 `setState`。

错误示例：

```tsx
const [pageTitle, setPageTitle] = useState('')

useEffect(() => {
  setPageTitle(orderId ? '提交评价' : '我的评价')
}, [orderId])
```

推荐写法：

```tsx
const pageTitle = useMemo(() => (orderId ? '提交评价' : '我的评价'), [orderId])
```

### 2.4 异步请求要处理卸载场景

页面跳转后异步请求才返回时，不应继续更新已卸载组件。首屏加载、长请求、轮询和上传都需要关注这一点。

```tsx
useEffect(() => {
  let isMounted = true

  void fetchMemberDataSnapshot().then((snapshot) => {
    if (isMounted) {
      applyMemberData(snapshot)
    }
  })

  return () => {
    isMounted = false
  }
}, [])
```

## 3. 接口与数据归一化

### 3.1 页面不直接调用 `Taro.request`

页面只调用 `src/services/` 中的业务接口方法；请求基础能力统一走 `src/shared/request.ts` 暴露的 `api`。

错误示例：

```tsx
await Taro.request({
  url: '/api/user/profile',
  method: 'GET'
})
```

推荐写法：

```ts
// src/services/user.ts
export function getUserProfile(options?: ApiRequestOptions) {
  return api.get<GetUserProfileResponse>('/api/user/profile', options)
}
```

```tsx
// page
const response = await getUserProfile()
```

### 3.2 接口字段以后台为准，页面不自造业务含义

会员等级、角色、状态、价格、按钮文案等核心业务信息优先读取接口字段。需要兼容历史字段时，在 helper 中集中归一化。

推荐写法：

```ts
export function getLevelTitle(level: VipLevelItem | null | undefined) {
  return textOf(level?.level_text ?? level?.name)
}
```

```tsx
<Text>{textOrPlaceholder(getLevelTitle(level), '会员')}</Text>
```

### 3.3 列表数据先归一化，再渲染

接口可能返回数组、分页对象或嵌套字段时，不要在 JSX 里写复杂兜底。先在 helper 中归一化为页面需要的结构。

```ts
function normalizeVipLevels(data: unknown) {
  return firstRecordList(data)
    .map(normalizeVipLevel)
    .sort((left, right) => (left.level ?? 0) - (right.level ?? 0))
}
```

## 4. 组件拆分与文件边界

- 单文件原则上不超过 500 行。
- `index.tsx` 只负责页面编排、请求调度和关键交互。
- 复杂区块放入页面私有 `components/`。
- 静态配置放 `*.data.ts`。
- 页面私有类型放 `types.ts`。
- 跨页面复用组件放 `src/components/` 或 `src/components/business/`。

推荐结构：

```text
src/pages/member/benefit
├── components
│   ├── MemberBenefitCompare.tsx
│   ├── MemberBenefitFaq.tsx
│   ├── MemberBenefitHero.tsx
│   └── MemberPlanCard.tsx
├── index.config.ts
├── index.tsx
└── member-benefit.helpers.ts
```

组件 props 必须显式声明类型，不用宽泛 `any` 承接业务数据。

```tsx
interface MemberPlanCardProps {
  level: VipLevelItem
  isPaymentLocked: boolean
  onPay: (level: VipLevelItem) => void
}
```

## 5. 样式与 UI 实现

### 5.1 优先 Tailwind 和组件库能力

- 优先使用 Tailwind className、NutUI 组件属性和项目已有业务组件。
- 尽量不写行内 `style`。
- 只有动态值、组件库变量覆盖或小程序兼容性需要时才使用行内样式。
- 重复出现的颜色、阴影、圆角、间距应沉淀为 Tailwind token 或页面样式类。

错误示例：

```tsx
<View style={{ marginTop: '28rpx', color: '#5F6A7D', fontSize: '18rpx' }} />
```

推荐写法：

```tsx
<View className="mt-3 text-muted" />
```

需要动态背景时，可以局部使用行内样式，但要集中收敛：

```tsx
const cardStyle: CSSProperties = {
  background: visual.background,
  borderColor: visual.borderColor
}
```

### 5.2 字体最小值

小程序页面字体最小值为 `20rpx`。辅助说明、标签、统计项、表格内容等小字也不得低于该尺寸。

错误示例：

```tsx
<Text className="text-xs">核心权益</Text>
```

推荐写法：

```tsx
<Text className="text-[20rpx] leading-[30rpx]">核心权益</Text>
```

### 5.3 布局间距放在稳定容器上

NutUI 组件可能有自己的内部结构，小程序端 class 不一定作用在预期节点上。按钮和列表的间距优先放在普通 `View` 容器上。

错误示例：

```tsx
<View className="grid gap-3">{perks}</View>
<Button className="mt-7">立即开通</Button>
```

推荐写法：

```tsx
<View className="mb-7 grid gap-3">{perks}</View>
<Button>立即开通</Button>
```

### 5.4 不使用 Tailwind 无法扫描的动态类名

错误示例：

```tsx
<Text className={`text-${tone}`}>{label}</Text>
```

推荐写法：

```tsx
const toneClassMap = {
  gold: 'text-gold',
  brand: 'text-brand',
  muted: 'text-muted'
} satisfies Record<string, string>

<Text className={toneClassMap[tone]}>{label}</Text>
```

## 6. Taro 与微信小程序兼容性

- 不直接使用 DOM、`window`、`document`、`localStorage` 等 Web API。
- 能用 Taro API 时优先使用 Taro API，例如 `Taro.showToast`、`Taro.chooseImage`、`Taro.scanCode`。
- 不默认开发 H5 适配；除非任务明确要求。
- 小程序端不稳定的 CSS 能力要提前降级，优先使用 flex、grid、固定宽高、明确 `lineHeight`。
- 原生能力调用前先确认权限、失败回调和取消场景。

扫码示例：

```ts
const result = await Taro.scanCode({
  onlyFromCamera: true,
  scanType: ['qrCode']
})

await verifyTicket({ code: result.result })
```

上传示例：

```ts
const selected = await Taro.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera']
})
```

## 7. 路由与页面注册

- 路由路径统一维护在 `src/shared/router.ts`。
- 页面跳转使用 `router.to(routes.xxx)`、`router.redirect(routes.xxx)` 或 `router.switchTab(routes.xxx)`。
- 新页面必须同步维护 `src/app.config.ts` 和 `src/shared/router.ts`。
- tabBar 页面不拼 query；分包页面不要依赖其他分包内部组件。

错误示例：

```tsx
Taro.navigateTo({ url: '/pages/member/benefit/index' })
```

推荐写法：

```tsx
router.to(routes.memberBenefit)
```

## 8. 静态资源与包体控制

- 微信小程序主包非 `.map` 产物必须长期控制在 2MB 以下。
- 新增图片、字体、图标、依赖前先评估主包影响。
- 身份、徽章、tabBar 等小图标必须按实际展示尺寸压缩，单个小图标原则上控制在 50KB 以内。
- 大型运营图优先远程或分包，不放主包。
- 构建后重点检查 `dist` 中大文件，尤其是 `app.js`、`vendors.js`、`taro.js` 和 `src/assets/**`。

检查命令：

```sh
pnpm build:weapp
find dist -type f ! -name '*.map' -exec ls -lh {} \; | sort -k5 -hr | head
```

## 9. Lint、类型与提交前验证

日常修改至少运行相关文件检查；准备提交或大范围改动时运行组合检查。

```sh
pnpm typecheck
pnpm lint
pnpm format:check
```

项目脚本：

- `pnpm typecheck`：TypeScript 类型检查。
- `pnpm lint`：ESLint 全量检查，当前配置 `--max-warnings=0`。
- `pnpm format:check`：Prettier 格式检查。
- `pnpm check`：类型、lint、格式组合检查。
- `pnpm build:weapp`：微信小程序构建验证。

常见 ESLint 问题和处理方式：

| 问题                              | 根因                           | 推荐处理                                                    |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `react-hooks/set-state-in-effect` | effect 顶层同步 `setState`     | 初始状态前置；请求结果回调里更新；刷新用事件或 `refreshKey` |
| `react-hooks/exhaustive-deps`     | effect 依赖不完整或函数不稳定  | 补依赖、用 `useCallback`，或改为刷新信号                    |
| `no-unused-vars`                  | 未使用变量、参数或 catch error | 删除变量；确实占位用 `_` 前缀                               |
| Tailwind 动态类不生效             | className 运行时拼接，扫描不到 | 使用枚举映射                                                |

## 10. Code Review 清单

提交或自测前逐项确认：

- 是否直接调用了 `Taro.request`？如果是，应改到 `src/services/`。
- 是否新增裸路由字符串？如果是，应改用 `routes`。
- 是否在 `useEffect` 顶层同步 `setState`？如果是，应重构加载流程。
- 是否新增低于 `20rpx` 的字体？如果是，应调整。
- 是否大量使用行内样式？如果是，应优先改成 Tailwind 或样式类。
- 是否新增主包图片、字体或依赖？如果是，应检查包体。
- 是否新增页面但没同步 `app.config.ts` 和 `router.ts`？
- 是否文件接近 500 行或 JSX 过长？如果是，应拆组件。
- 是否通过 `pnpm typecheck`、`pnpm lint`、`pnpm format:check`？

## 11. 本次 ESLint 问题复盘

这次报错不是接口或页面逻辑错误，而是 React Hooks 规则升级后暴露了老式加载写法：

```tsx
useEffect(() => {
  setIsLoading(true)
  setHasError(false)
  void request().finally(() => setIsLoading(false))
}, [])
```

这类写法过去能运行，但会产生额外渲染，并且在严格 lint 下会失败。后续新页面统一使用以下原则：

1. 首屏加载态用 `useState(true)` 表达。
2. effect 里只发起请求，不同步重置状态。
3. 请求成功、失败、结束的回调中更新状态。
4. 用户主动刷新或状态变更后的重新加载，用事件回调或 `refreshKey` 驱动。
5. 异步请求返回前页面可能卸载时，加 `isMounted` 防护。
