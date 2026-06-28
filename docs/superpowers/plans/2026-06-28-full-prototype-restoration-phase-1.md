# Phase 1 入口与核心列表收口计划

> **给 agentic workers：** 必须使用 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 完成首页、服务商城、行商书苑入口，以及资源、活动、商机核心列表的第一轮功能收口，让用户能从一级入口进入三条主业务发现路径，并用统一状态组件解释真实接口结果。

**架构：** 不重写现有页面结构，不引入新状态机。复用 `PageShell`、`ItemList`、`SectionCard`、`StatGrid`、`ActionBar`、`StateNotice`，新增少量页面内加载/错误状态。真实接口字段优先，接口缺字段时展示空态或隐藏非核心模块。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `routes` / `router` / `services` / `components/business`。

---

## 实施计划总览

| 顺序 | 任务                       | 交付物                                                                   | 页面范围           |
| ---- | -------------------------- | ------------------------------------------------------------------------ | ------------------ |
| 1    | 统一入口页状态表达         | `src/pages/services/index.tsx`、`src/pages/shuyuan/index.tsx`            | 服务商城、行商书苑 |
| 2    | 资源核心列表收口           | `src/pages/resource/home/index.tsx`、`src/pages/resource/list/index.tsx` | 资源首页、资源列表 |
| 3    | 活动核心列表收口           | `src/pages/event/home/index.tsx`、`src/pages/event/list/index.tsx`       | 活动首页、活动列表 |
| 4    | 商机核心列表收口           | `src/pages/opportunity/home/index.tsx`                                   | 商机首页           |
| 5    | 首页入口分发收口           | `src/pages/home/index.tsx`                                               | 首页               |
| 6    | Phase 1 验证与文档状态更新 | `docs/product/prototype-restoration-map.md`、验证命令                    | Phase 1 页面       |

## Phase 1 验收总览

- 一级入口可用：首页、服务商城、行商书苑能进入资源、活动、商机、会员或认证等主路径。
- 核心列表真实：资源、活动、商机列表只展示真实接口字段，不新增假统计、假订单、假活动。
- 状态统一：加载、错误、空列表使用 `StateNotice` 或统一文案，不继续散落“当前接口没有返回”等临时话术。
- 错误可解释：接口失败时展示“加载失败/请稍后重试”，而不是静默空白。
- 状态边界清楚：接口失败、接口成功但无数据、未登录/未认证/无权限、字段缺失导致模块隐藏必须使用不同文案，不把所有情况都写成“暂无数据”。
- 部分失败可降级：首页任一业务接口失败时，其它成功模块仍可见；失败模块单独展示错误/空态，不影响整页。
- 筛选可用：资源分类、活动城市、商机类型基于真实返回生成；无数据时给空态。
- 筛选入口兜底：分类、城市、类型为空时保留“全部”或展示清晰空态，不能让筛选区域看起来失效。
- 入口不死链：新增或保留跳转必须使用 `routes` 和 `router`。
- 权限入口可解释：需要登录、认证或会员的入口，在 Phase 1 不强制完整拦截，但不能把用户直接带到语义错误页面。
- 文档同步：`docs/product/prototype-restoration-map.md` 中 Phase 1 页面仍保持 `部分实现`，但主要验收点应反映本轮已接入状态统一。
- 小程序端验收：本阶段只验收 weapp 相关 TypeScript 和格式，不做 H5 验收。
- 验证通过：本地 `./node_modules/.bin/tsc --noEmit` 和针对改动文件的 Prettier check 通过；`pnpm` 环境问题如仍存在则记录。

## Task 1：统一服务商城和书苑入口状态表达

**文件：**

- 修改：`src/pages/services/index.tsx`
- 修改：`src/pages/shuyuan/index.tsx`

- [ ] **Step 1：为服务商城增加加载和错误状态**

在 `ServicesPage` 增加：

```ts
const [isLoading, setIsLoading] = useState(true)
const [hasError, setHasError] = useState(false)
```

在 `loadServiceData()` 开始前设置 `setIsLoading(true)`、`setHasError(false)`；`Promise.allSettled` 后如果两个接口都失败，设置 `hasError`；最后 `setIsLoading(false)`。

- [ ] **Step 2：替换服务商城空态**

从 `@/components/business` 引入 `StateNotice`。当加载中展示：

```tsx
<StateNotice state="loading" />
```

当两个接口都失败展示：

```tsx
<StateNotice state="error" />
```

分类空态使用：

```tsx
<StateNotice state="empty" copy={{ title: '暂无服务分类', desc: '当前接口没有返回服务分类。' }} />
```

商品空态使用：

```tsx
<StateNotice state="empty" copy={{ title: '暂无服务商品', desc: '当前接口没有返回可展示服务。' }} />
```

- [ ] **Step 3：为书苑增加加载和错误状态**

在 `ShuyuanPage` 增加同样的 `isLoading`、`hasError`。四个接口都失败时展示错误态；加载中展示 `StateNotice state="loading"`。

- [ ] **Step 4：替换书苑空态**

把推荐活动、学习统计、学习分类、课程列表空态替换为 `StateNotice`，文案要说明真实接口未返回对应内容。

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/services/index.tsx src/pages/shuyuan/index.tsx
```

预期：类型检查和格式检查通过。

## Task 2：资源首页和资源列表收口

**文件：**

- 修改：`src/pages/resource/home/index.tsx`
- 修改：`src/pages/resource/list/index.tsx`

- [ ] **Step 1：资源首页增加加载/错误状态**

引入 `StateNotice`。给资源首页增加 `isLoading`、`hasError`。当分类和商品接口都失败时展示错误态；加载中展示加载态。

- [ ] **Step 2：资源首页替换空态**

资源分类空态使用“暂无资源分类 / 当前接口没有返回资源分类。”；战略供应商推荐空态使用“暂无资源 / 当前接口没有返回推荐资源。”。

- [ ] **Step 3：资源列表增加加载/错误状态**

`ResourceListPage` 的分类和商品接口都失败时展示错误态；加载中展示加载态。搜索建议失败继续静默处理，不影响列表主状态。

- [ ] **Step 4：资源列表替换空态**

无筛选结果时保留业务含义：

```tsx
<StateNotice state="empty" copy={{ title: '暂无资源', desc: '当前接口或筛选条件没有返回可展示资源。' }} />
```

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/resource/home/index.tsx src/pages/resource/list/index.tsx
```

预期：类型检查和格式检查通过。

## Task 3：活动首页和活动列表收口

**文件：**

- 修改：`src/pages/event/home/index.tsx`
- 修改：`src/pages/event/list/index.tsx`

- [ ] **Step 1：活动首页增加加载/错误状态**

`getEvents` 请求开始时进入加载态；catch 时设置错误态；finally 关闭加载态。

- [ ] **Step 2：活动首页替换空态**

活动统计、活动城市、活动列表都使用 `StateNotice`，文案分别说明统计、城市、活动接口未返回内容。

- [ ] **Step 3：活动列表增加加载/错误状态**

`EventListPage` 增加 `isLoading`、`hasError`；请求失败时展示错误态，不再仅清空列表。

- [ ] **Step 4：活动列表替换空态**

无筛选结果使用：

```tsx
<StateNotice state="empty" copy={{ title: '暂无活动', desc: '当前接口或筛选条件没有返回活动。' }} />
```

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/event/home/index.tsx src/pages/event/list/index.tsx
```

预期：类型检查和格式检查通过。

## Task 4：商机首页收口

**文件：**

- 修改：`src/pages/opportunity/home/index.tsx`

- [ ] **Step 1：商机首页增加加载/错误状态**

`getOpportunityStats`、`getOpportunities`、`getUserApplications` 三个接口都失败时展示错误态；加载中展示加载态。

- [ ] **Step 2：替换商机空态**

商机统计、商机类型、商机列表空态使用 `StateNotice`。`我的申请` 模块在无数据时继续隐藏，避免制造假记录。

- [ ] **Step 3：修正“我的申请”入口**

当前 “我的申请” 按钮指向 `routes.userReviews`，语义错误。Phase 1 不新增申请列表页，改为点击后展示轻提示“我的申请列表暂未开放”，不跳转到错误页面；页面内已有申请数据时继续展示 `我的申请` 模块。

- [ ] **Step 4：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/opportunity/home/index.tsx
```

预期：类型检查和格式检查通过。

## Task 5：首页入口分发收口

**文件：**

- 修改：`src/pages/home/index.tsx`

- [ ] **Step 1：增加首页加载和错误状态**

首页多接口并行加载时，不要求任何单个接口失败就整页错误。只有 banner、核心业务、资源、活动、商机和用户信息全部失败时，展示错误态。部分接口失败时，其它成功模块继续展示，失败模块单独展示错误/空态。加载中不遮挡沉浸式头图，只在内容区展示 `StateNotice state="loading"`。

- [ ] **Step 2：首页空态统一**

热门资源、近期活动、推荐商机使用 `StateNotice` 替换 `EmptyState`，文案与字段覆盖表一致。

- [ ] **Step 3：保留真实数据策略**

不新增平台假统计、不新增假活动/商机/资源。`systemStatus` 仍只展示接口返回或既有安全文案。

- [ ] **Step 4：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/home/index.tsx
```

预期：类型检查和格式检查通过。

## Task 6：Phase 1 验证与文档状态更新

**文件：**

- 修改：`docs/product/prototype-restoration-map.md`
- 检查：所有 Phase 1 修改文件

- [ ] **Step 1：更新原型映射表**

在 `docs/product/prototype-restoration-map.md` 中，把 Phase 1 页面主要验收点补充为“已接入统一状态表达”。当前状态仍保持 `部分实现`，因为详情和转化闭环属于后续阶段。

- [ ] **Step 2：运行最终验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/home/index.tsx src/pages/services/index.tsx src/pages/shuyuan/index.tsx src/pages/resource/home/index.tsx src/pages/resource/list/index.tsx src/pages/event/home/index.tsx src/pages/event/list/index.tsx src/pages/opportunity/home/index.tsx docs/product/prototype-restoration-map.md
```

预期：类型检查和格式检查通过。

- [ ] **Step 3：记录 pnpm 环境**

如果 `pnpm typecheck` 或 `pnpm format:check` 仍因 pnpm 11 与项目 `pnpm@8.14.1` lockfile 不兼容失败，不修改依赖目录，只在最终说明中记录。

- [ ] **Step 4：提交**

```bash
git add src/pages/home/index.tsx src/pages/services/index.tsx src/pages/shuyuan/index.tsx src/pages/resource/home/index.tsx src/pages/resource/list/index.tsx src/pages/event/home/index.tsx src/pages/event/list/index.tsx src/pages/opportunity/home/index.tsx docs/product/prototype-restoration-map.md
git commit -m "feat: restore phase 1 entry and list states"
```

## 自检清单

- Phase 1 没有引入假业务数据。
- 首页、服务商城、书苑、资源、活动、商机入口仍使用 `routes` / `router`。
- 空态、错误态、加载态优先使用 `StateNotice`。
- 接口失败、接口成功但无数据、权限/认证限制、字段缺失隐藏模块分别使用不同说明。
- 首页部分接口失败时，其它成功模块仍可见。
- “我的申请”不再跳转到评价页。
- 无接口字段时不新增硬编码运营数字。
- 不修改 H5 构建范围。
