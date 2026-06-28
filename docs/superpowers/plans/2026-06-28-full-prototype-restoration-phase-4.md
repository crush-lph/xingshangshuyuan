# Phase 4 后台管理页面收口计划

> **给 agentic workers：** 必须使用 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 完成后台核销、认证审核、订单确认、资源需求、商机撮合五个后台入口的第一轮功能收口。当前接口没有独立后台审核/核销/确认能力时，只展示真实可读数据和清晰接口缺口，不模拟审核通过、核销成功、财务确认、需求分配或撮合完成。

**架构：** 继续复用 `AdminGuard`、`PageShell`、`StateNotice`、`ItemList`、`FieldList`、`SectionCard`。后台页面不新增本地假状态；页面内只补充加载/错误/空态、接口缺口说明、危险动作失败反馈。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `routes` / `router` / `services` / `components/business`。

---

## 实施计划总览

| 顺序 | 任务               | 交付物                                                                        | 页面范围     |
| ---- | ------------------ | ----------------------------------------------------------------------------- | ------------ |
| 0    | 后台接口缺口记录   | `docs/product/field-coverage.md`                                              | 后台接口     |
| 1    | 后台权限态统一     | `src/pages/admin/components/AdminGuard.tsx`                                   | 后台公共壳   |
| 2    | 核销与认证审核收口 | `admin/checkin`、`admin/cert`                                                 | 核销、认证   |
| 3    | 订单与资源需求收口 | `admin/orders`、`admin/resource`                                              | 订单、资源   |
| 4    | 商机撮合收口       | `admin/opportunity`                                                           | 商机后台     |
| 5    | 映射文档与验证     | `docs/product/prototype-restoration-map.md`、`docs/product/field-coverage.md` | Phase 4 页面 |

## Phase 4 验收总览

- 权限态清楚：未登录、非管理员、权限校验中均使用统一状态表达。
- 后台数据真实：只展示当前接口返回的数据，不用个人认证冒充审核池，不用个人订单冒充后台待确认池时必须说明来源限制。
- 核销不造假：没有真实票号/核销码/签到接口时，后台核销页不得展示 `EVENT-{id}` 这类前端拼接码，也不得显示“核销成功”。
- 审核不造假：没有认证审核接口时，不展示通过/驳回操作；只说明“后台审核列表接口待补”。
- 财务确认不造假：没有订单确认接口时，不展示“确认到账/确认开通”操作；只展示真实订单和缺口说明。
- 资源分配不造假：没有资源需求处理接口时，不展示“分配/处理完成”等动作。
- 商机撮合不造假：商机关闭操作必须基于真实 `updateOpportunityStatus`；无撮合接口时不展示“撮合成功/推荐服务商”假状态。
- 负向文案检查：后台页面不得出现 `EVENT-{id}`、`核销成功`、`审核通过`、`确认到账`、`确认开通`、`分配完成`、`撮合成功`、`推荐服务商` 等模拟结果文案或按钮。
- 文档同步：`docs/product/prototype-restoration-map.md` 和 `docs/product/field-coverage.md` 更新后台接口缺口和当前展示策略。
- 验证通过：本地 `./node_modules/.bin/tsc --noEmit` 和针对改动文件的 Prettier check 通过；`pnpm` 环境问题如仍存在则记录。

## 页面级状态矩阵

| 页面     | 加载中        | 接口失败   | 成功空数据 | 接口缺口                      | 成功有数据            | 操作失败           |
| -------- | ------------- | ---------- | ---------- | ----------------------------- | --------------------- | ------------------ |
| 后台权限 | `StateNotice` | 权限错误态 | 不涉及     | 非管理员说明                  | 渲染子页面            | 不涉及             |
| 核销     | `StateNotice` | 整页错误态 | 无活动空态 | 票号/核销码/签到接口待补      | 展示真实活动          | 不展示核销操作     |
| 认证审核 | `StateNotice` | 整页错误态 | 无审核空态 | 后台审核列表/通过驳回接口待补 | 展示真实认证资料来源  | 不展示审核操作     |
| 订单确认 | `StateNotice` | 整页错误态 | 无订单空态 | 财务确认/开通接口待补         | 展示真实订单/发票     | 不展示确认操作     |
| 资源需求 | `StateNotice` | 整页错误态 | 无需求空态 | 后台资源需求列表/分配接口待补 | 展示真实客户/合同数据 | 不展示分配操作     |
| 商机撮合 | `StateNotice` | 整页错误态 | 无商机空态 | 撮合服务商/撮合成功接口待补   | 展示真实商机          | 关闭商机失败 toast |

## Task 0：后台接口缺口记录

**文件：**

- 修改：`docs/product/field-coverage.md`

- [ ] **Step 1：记录后台缺口**

将核销记录/核销接口、后台认证审核列表/审核操作、后台订单确认、后台资源需求处理、后台商机撮合操作标记为 `接口待补`。

- [ ] **Step 2：记录当前展示策略**

按页面记录“当前真实接口”“不能支持的后台动作”“页面展示策略”。说明当前只能展示公开/用户侧已有接口返回的数据，并在页面中明确来源限制，不模拟后台处理结果。

## Task 1：后台权限态统一

**文件：**

- 修改：`src/pages/admin/components/AdminGuard.tsx`

- [ ] **Step 1：使用 `StateNotice` 替换散落空态**

权限校验中、需要登录、无权限都使用 `StateNotice`，文案保持中文。

- [ ] **Step 2：登录入口保留真实路由**

未登录状态继续跳 `routes.userLogin`，不新增后台专用假登录。

## Task 2：核销与认证审核收口

**文件：**

- 修改：`src/pages/admin/checkin/index.tsx`
- 修改：`src/pages/admin/cert/index.tsx`

- [ ] **Step 1：核销页增加加载/错误状态**

`getEvents` / `getEventDetail` 失败展示错误态；无活动展示空态。

- [ ] **Step 2：核销页去掉前端拼接码**

移除 `EVENT-{event.id}`。改为展示真实活动字段和“核销码/签到接口待补”的说明。

- [ ] **Step 3：认证审核页增加加载/错误状态与接口缺口说明**

当前 `getUserCertification` 是当前登录用户的个人认证资料，不是后台审核池。页面主结论必须明确“后台认证审核列表接口待补”；如保留展示，只能标注为“当前登录用户认证资料示例/来源受限”，不展示通过/驳回动作。

## Task 3：订单与资源需求收口

**文件：**

- 修改：`src/pages/admin/orders/index.tsx`
- 修改：`src/pages/admin/resource/index.tsx`

- [ ] **Step 1：订单确认页增加加载/错误状态**

订单和发票接口全失败时展示错误态；成功但无数据展示空态。若使用用户侧订单/发票接口展示真实数据，必须标注“来源受限，不等同后台待确认队列”。无后台确认接口时不展示确认到账、确认开通等动作。

- [ ] **Step 2：资源需求页增加加载/错误状态**

客户/合同接口全失败时展示错误态；成功但无数据展示空态。若使用用户侧客户/合同接口展示真实数据，必须标注“来源受限，不等同后台待分配需求队列”。明确“后台资源需求处理接口待补”，不展示分配完成等动作。

## Task 4：商机撮合收口

**文件：**

- 修改：`src/pages/admin/opportunity/index.tsx`

- [ ] **Step 1：商机撮合页增加加载/错误状态**

我的商机接口失败展示错误态；无数据展示空态。

- [ ] **Step 2：关闭商机失败反馈**

`updateOpportunityStatus` 失败展示“商机状态更新失败，请稍后重试”。成功后刷新列表或更新本地状态，不只显示“接口已调用”。

- [ ] **Step 3：撮合接口缺口说明**

无撮合服务商接口时展示说明，不展示撮合成功、推荐服务商等模拟状态。

## Task 5：文档状态与整体验证

**文件：**

- 修改：`docs/product/prototype-restoration-map.md`
- 修改：`docs/product/field-coverage.md`

- [ ] **Step 1：更新 Phase 4 映射验收点**

将后台页面验收点补充为“权限态、真实数据、接口缺口说明、操作失败反馈”。

- [ ] **Step 2：运行整体验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/admin/components/AdminGuard.tsx src/pages/admin/checkin/index.tsx src/pages/admin/cert/index.tsx src/pages/admin/orders/index.tsx src/pages/admin/resource/index.tsx src/pages/admin/opportunity/index.tsx docs/product/prototype-restoration-map.md docs/product/field-coverage.md docs/superpowers/plans/2026-06-28-full-prototype-restoration-phase-4.md
```

预期：类型检查和格式检查通过。如 `pnpm` 因本地 pnpm 版本与锁文件不兼容失败，只记录原因，不强制清理依赖。
