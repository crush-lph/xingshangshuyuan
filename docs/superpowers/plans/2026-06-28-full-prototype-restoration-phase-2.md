# Phase 2 详情与转化链路收口计划

> **给 agentic workers：** 必须使用 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 完成资源、活动、商机三条主业务从详情到提交/购买/报名/申请的第一轮功能收口。所有页面只展示真实接口数据；接口缺失或失败时使用统一状态说明，不用静态假数据填充订单、票券、拼团或申请状态。

**架构：** 继续复用 `PageShell`、`SectionCard`、`FieldList`、`ActionBar`、`FormSection`、`StateNotice` 等现有组件；不新建复杂流程状态机。页面内只补充 `isLoading`、`hasError`、`isSubmitting`、提交异常反馈和必要的状态判断。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `routes` / `router` / `services` / `shared/view-data` / `components/business`。

---

## 实施计划总览

| 顺序 | 任务                       | 交付物                                                                                   | 页面范围             |
| ---- | -------------------------- | ---------------------------------------------------------------------------------------- | -------------------- |
| 1    | 资源详情与采购链路收口     | `resource/standard-detail`、`resource/nonstandard-detail`、`resource/submit`、`purchase` | 资源详情、需求、采购 |
| 2    | 活动详情与报名链路收口     | `event/detail`、`event/signup`、`event/group`、`event/ticket`                            | 活动详情、报名、票券 |
| 3    | 商机详情与发布申请链路收口 | `opportunity/detail`、`opportunity/publish`、`opportunity/apply`                         | 商机详情、发布、申请 |
| 4    | 映射文档与验证             | `docs/product/prototype-restoration-map.md`、验证命令                                    | Phase 2 页面         |

## Phase 2 验收总览

- 详情页可解释：资源详情、活动详情、商机详情均区分加载中、接口失败、接口成功但无数据。
- 转化入口真实：采购、报名、发布、申请只调用当前服务层接口，不新增假订单、假电子票、假拼团记录。
- 提交反馈完整：所有表单提交均有必填校验、防重复提交、成功提示、失败提示和 loading 关闭。
- 票券状态真实：当前接口未返回真实票号/核销码时，电子票页面不得拼接 `EVENT-{id}`、二维码或核销态；即使已报名，也只展示“已报名，核销信息以后台为准”。
- 拼团边界清楚：当前没有独立拼团接口时，只展示活动真实字段和“接口规则缺失”的说明，不模拟拼团人数、倒计时或团状态。
- 权限入口可解释：需要登录的提交、采购、报名、申请继续使用 `ensureLoggedIn`。
- 路由一致：跳转继续使用 `routes` / `router`，不新增散落字符串路径。
- 文档同步：`docs/product/prototype-restoration-map.md` 更新 Phase 2 页面验收点，状态仍保持 `部分实现`，直到后台接口字段完整闭环。
- 小程序端验收：本阶段只验收 weapp 相关 TypeScript 和格式，不做 H5 验收。
- 验证通过：本地 `./node_modules/.bin/tsc --noEmit` 和针对改动文件的 Prettier check 通过；`pnpm` 环境问题如仍存在则记录。

## Task 1：资源详情与采购链路收口

**文件：**

- 修改：`src/pages/resource/standard-detail/index.tsx`
- 修改：`src/pages/resource/nonstandard-detail/index.tsx`
- 修改：`src/pages/resource/submit/index.tsx`
- 修改：`src/pages/resource/purchase/index.tsx`

- [ ] **Step 1：标品资源详情增加加载/错误状态**

引入 `StateNotice`。增加 `isLoading`、`hasError`。请求开始时进入加载态，请求失败时展示错误态；接口成功但无 `product.id` 时展示空态。

- [ ] **Step 2：非标资源详情增加加载/错误状态**

对企业资料请求增加同样的加载/错误状态。没有企业资料时展示“暂无服务资料”，不要把接口失败误写成空资料。

- [ ] **Step 3：需求提交页补提交失败反馈**

`saveCompanyProfile` 外层保留现有成功跳转；`catch` 中展示“提交失败，请稍后重试”，`finally` 保证 loading 和 `isSubmitting` 关闭。

- [ ] **Step 4：采购确认页增加加载/错误状态与失败反馈**

商品加载失败时展示错误态；无商品展示空态。`createProductOrder` 失败时展示“订单生成失败，请稍后重试”，并避免继续跳转支付页。创建订单成功但没有返回 `order_no` 时展示异常提示，不跳转对公转账页。

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/resource/standard-detail/index.tsx src/pages/resource/nonstandard-detail/index.tsx src/pages/resource/submit/index.tsx src/pages/resource/purchase/index.tsx
```

预期：类型检查和格式检查通过。

## Task 2：活动详情与报名链路收口

**文件：**

- 修改：`src/pages/event/detail/index.tsx`
- 修改：`src/pages/event/signup/index.tsx`
- 修改：`src/pages/event/group/index.tsx`
- 修改：`src/pages/event/ticket/index.tsx`

- [ ] **Step 1：活动详情增加加载/错误状态**

引入 `StateNotice`。请求失败展示错误态；无活动展示空态；正常详情保留现有字段和报名入口。

- [ ] **Step 2：活动报名页增加加载/错误状态与失败反馈**

活动加载失败展示错误态。`registerEvent` 失败时展示“报名失败，请稍后重试”，不跳转电子票。报名成功只代表接口受理，不默认生成真实电子票；后续跳转到票券状态说明页时，页面也必须按真实字段解释状态。

- [ ] **Step 3：拼团页增加状态说明**

活动加载失败展示错误态。没有独立拼团接口时，在真实活动字段下展示说明：拼团规则以接口配置为准，当前未返回独立拼团状态。

- [ ] **Step 4：电子票页避免伪造已报名状态**

加载失败展示错误态。不得展示前端拼接的 `EVENT-{id}` 编号。`event.is_registered` 为真时仅展示“已报名，核销信息以后台为准”；未确认报名时展示 `StateNotice state="reviewPending"` 或自定义说明，引导查看我的活动或返回报名。

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/event/detail/index.tsx src/pages/event/signup/index.tsx src/pages/event/group/index.tsx src/pages/event/ticket/index.tsx
```

预期：类型检查和格式检查通过。

## Task 3：商机详情与发布申请链路收口

**文件：**

- 修改：`src/pages/opportunity/detail/index.tsx`
- 修改：`src/pages/opportunity/publish/index.tsx`
- 修改：`src/pages/opportunity/apply/index.tsx`

- [ ] **Step 1：商机详情增加加载/错误状态**

引入 `StateNotice`。商机详情失败展示错误态；无商机展示空态；申请人数失败不影响详情主内容，但不能用 `0` 代替失败结果，优先不展示或展示“申请人数暂不可用”。

- [ ] **Step 2：发布商机页补提交失败反馈**

`createOpportunity` 失败时展示“商机提交失败，请稍后重试”，保留防重复提交和 loading 关闭。

- [ ] **Step 3：申请接单页增加加载/错误状态与失败反馈**

商机详情加载失败展示错误态；企业资料失败不阻断申请页，但字段展示“未提供”。`applyOpportunity` 失败时展示“申请提交失败，请稍后重试”，不跳转个人中心。

- [ ] **Step 4：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/opportunity/detail/index.tsx src/pages/opportunity/publish/index.tsx src/pages/opportunity/apply/index.tsx
```

预期：类型检查和格式检查通过。

## Task 4：文档状态与整体验证

**文件：**

- 修改：`docs/product/prototype-restoration-map.md`

- [ ] **Step 1：更新 Phase 2 映射验收点**

将 Phase 2 页面主要验收点补充为“统一状态表达、失败反馈、真实接口边界”。页面状态仍为 `部分实现`，因为票券核销、拼团状态、订单支付状态和商机撮合完整闭环还依赖后续阶段或后台接口。

- [ ] **Step 2：运行整体验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/resource/standard-detail/index.tsx src/pages/resource/nonstandard-detail/index.tsx src/pages/resource/submit/index.tsx src/pages/resource/purchase/index.tsx src/pages/event/detail/index.tsx src/pages/event/signup/index.tsx src/pages/event/group/index.tsx src/pages/event/ticket/index.tsx src/pages/opportunity/detail/index.tsx src/pages/opportunity/publish/index.tsx src/pages/opportunity/apply/index.tsx docs/product/prototype-restoration-map.md docs/superpowers/plans/2026-06-28-full-prototype-restoration-phase-2.md
```

预期：类型检查和格式检查通过。如 `pnpm` 因本地 pnpm 版本与锁文件不兼容失败，只记录原因，不强制清理依赖。
