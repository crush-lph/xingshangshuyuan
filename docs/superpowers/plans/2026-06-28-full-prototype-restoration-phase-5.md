# Phase 5 视觉与组件系统收口计划

> **给 agentic workers：** 必须使用 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 完成原型补齐后的组件系统和视觉一致性收口。重点解决页面标题/副标题未渲染、旧空态组件残留、状态组件表达不统一、接口缺口文案散落等问题。继续使用现有组件库和项目业务组件，不做大规模视觉重构。

**架构：** 优先增强 `PageShell`、`StateNotice` 等基础组件；页面侧只做必要替换。保留 `EmptyState` 作为兼容组件，但新页面和本阶段触达页面统一使用 `StateNotice`。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `components/business`。

---

## 实施计划总览

| 顺序 | 任务                   | 交付物                                                        |
| ---- | ---------------------- | ------------------------------------------------------------- |
| 1    | PageShell 信息层级收口 | `src/components/PageShell.tsx`                                |
| 2    | 剩余空态统一           | `member/benefit`、`resource/standard-detail`、`user/settings` |
| 3    | 文案与负向扫描         | 后台负向文案、票号/核销码、接口缺口文案、动态 class 扫描      |
| 4    | 最终文档与验收         | `docs/product/prototype-restoration-map.md`、验证命令         |

## Phase 5 验收总览

- 页面标题可见：所有使用 `PageShell` 的业务页都能在页面内容区看到标题；有 `subtitle` 时展示副标题。
- 首屏不重复：已有强视觉头图或自定义主标题的页面，需要避免出现重复标题；必要时通过 `PageShell` 参数关闭内容区头部。
- 状态表达统一：本阶段触达页面不再使用页面级旧 `EmptyState`；统一使用 `StateNotice`。
- 不引入假数据：收口只改展示层，不新增假订单、假票号、假核销码、假审核状态。
- 设计系统友好：`PageShell` 使用统一背景、间距、标题层级，不引入页面级嵌套卡片。
- 小程序兼容：只使用稳定 Tailwind className，不新增不可扫描的动态类。
- 负向扫描通过：后台页面无 `EVENT-`、假核销、假审核、假确认、假分配、假撮合等文案。
- 验证通过：本地 `./node_modules/.bin/tsc --noEmit`、目标文件 Prettier check、关键文案 `rg` 扫描通过；`pnpm` 环境问题如仍存在则记录。

## Task 1：PageShell 信息层级收口

**文件：**

- 修改：`src/components/PageShell.tsx`

- [ ] **Step 1：渲染标题和副标题**

当前 `PageShell` 只设置导航栏标题，没有在内容区渲染 `title/subtitle/eyebrow`。需要增加页面头部，并提供可选参数让已有强视觉头图页面关闭内容区头部：

- `eyebrow` 可选，小号品牌色。
- `title` 显示为页面主标题。
- `subtitle` 显示为说明文案。
- `showHeader={false}` 时只设置导航栏标题，不渲染内容区头部。

- [ ] **Step 2：保持首屏和小程序稳定**

页面头部使用非卡片布局，不包成浮层卡片。间距统一为 `px-4 pb-6 pt-4` 或接近现有设计，不影响各页面主体布局。

- [ ] **Step 3：检查强视觉头图页面**

检查 `member/benefit` 等使用满宽头图或自定义主标题的页面，必要时设置 `showHeader={false}` 或调整局部负 margin，避免 PageShell 标题和页面自定义标题重复。

## Task 2：剩余空态统一

**文件：**

- 修改：`src/pages/member/benefit/index.tsx`
- 修改：`src/pages/resource/standard-detail/index.tsx`
- 修改：`src/pages/user/settings/index.tsx`

- [ ] **Step 1：会员权益页空态替换**

将“暂无会员配置”从 `EmptyState` 替换为 `StateNotice state="empty"`。

- [ ] **Step 2：资源详情局部空态替换**

将“暂无规格”“暂无评价”从 `EmptyState` 替换为 `StateNotice`，保持局部文案。

- [ ] **Step 3：设置页未登录空态替换**

将设置页未登录状态改为 `StateNotice state="loginRequired"`，保留已有登录/退出动作语义，不新增假状态。

## Task 3：文案与动态 class 扫描

**文件：**

- 不限，按扫描结果最小修改。

- [ ] **Step 1：负向文案扫描**

运行：

```bash
rg "EVENT-|核销成功|审核通过|确认到账|确认开通|分配完成|撮合成功|推荐服务商|状态接口已调用" src/pages
```

预期：无页面命中。文档中允许作为负向验收描述出现。

- [ ] **Step 2：页面级 EmptyState 扫描**

运行：

```bash
rg -n "EmptyState" src/pages
```

预期：`src/pages` 无页面级 `EmptyState` 使用；`src/components/business/EmptyState.tsx` 和导出兼容可保留。

- [ ] **Step 3：动态 class 扫描**

运行：

```bash
rg 'text-\\$|bg-\\$|className=\\{`' src
```

预期：无不可扫描的运行时拼接颜色；枚举映射类允许保留。

## Task 4：最终文档与验证

**文件：**

- 修改：`docs/product/prototype-restoration-map.md`

- [ ] **Step 1：补充 Phase 5 收口记录**

在映射表后追加“Phase 5 组件与视觉收口”小节，记录 PageShell、StateNotice、负向扫描和最终验收口径。

- [ ] **Step 2：运行最终验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/components/PageShell.tsx src/pages/member/benefit/index.tsx src/pages/resource/standard-detail/index.tsx src/pages/user/settings/index.tsx docs/product/prototype-restoration-map.md docs/superpowers/plans/2026-06-28-full-prototype-restoration-phase-5.md
```

并记录 `pnpm typecheck` 当前 pnpm 版本兼容问题（如仍存在）。

- [ ] **Step 3：尝试小程序构建**

由于本阶段改动全局页面壳，尝试运行：

```bash
pnpm build:weapp
```

预期：构建通过。如仍因当前 Codex 运行时 pnpm 11 与项目 pnpm 8 锁文件不兼容失败，记录具体失败原因，不强制清理依赖。
