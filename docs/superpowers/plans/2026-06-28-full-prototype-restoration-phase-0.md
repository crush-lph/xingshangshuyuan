# 全量原型还原 Phase 0 实施计划

> **给 agentic workers：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 建立全量原型还原的 Phase 0 基座：路由/原型映射、角色权限、字段覆盖、状态规范和最小可复用状态组件。

**架构：** Phase 0 先补文档和轻量共享 UI，不改动业务页面主逻辑。文档沉淀在 `docs/product/`，代码基座放在 `src/shared/` 与 `src/components/business/`，供后续阶段逐页接入。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `routes` / `router` / `components/business` 约定。

---

## 文件结构

- 新建 `docs/product/prototype-restoration-map.md`：32 个原型页面与当前路由、阶段、状态的映射表。
- 新建 `docs/product/roles-and-states.md`：角色权限、业务状态、空态/错误态文案规范。
- 新建 `docs/product/field-coverage.md`：原型字段、接口字段、展示策略和缺口类型清单。
- 新建 `src/shared/page-state.ts`：页面状态类型、默认文案和状态归一化工具。
- 新建 `src/components/business/StateNotice.tsx`：通用状态展示组件。
- 修改 `src/components/business/index.ts`：导出 `StateNotice`。

## 实施计划总览

| 顺序 | 任务 | 交付物 | 是否改业务页面 |
| --- | --- | --- | --- |
| 1 | 建立原型页面与路由映射 | `docs/product/prototype-restoration-map.md` | 否 |
| 2 | 建立角色和状态规范 | `docs/product/roles-and-states.md` | 否 |
| 3 | 建立字段覆盖表 | `docs/product/field-coverage.md` | 否 |
| 4 | 新增页面状态类型和默认文案 | `src/shared/page-state.ts` | 否 |
| 5 | 新增通用状态展示组件 | `src/components/business/StateNotice.tsx`、`src/components/business/index.ts` | 否 |
| 6 | Phase 0 验证与收口 | 类型检查、格式检查、diff 范围确认 | 否 |

## Phase 0 验收总览

- 路由映射完整：32 个原型页面都有当前路由、所属阶段、当前状态和主要验收点。
- 角色边界清晰：游客、普通用户、会员用户、认证机构、服务商、后台运营/审核人员的可见能力和受限能力明确。
- 状态文案统一：加载、空态、错误、无权限、未登录、认证中、审核中、已失效、已取消、已完成都有默认文案。
- 字段策略可追踪：原型模块能对应到接口字段；缺失字段标记为 `暂不展示`、`接口待补` 或 `后续版本`。
- 不造假数据：计划不引入 mock service，不硬编码业务假数据，不用假记录填充页面密度。
- 组件基座可复用：`StateNotice` 能作为后续页面统一空态、错误态、权限态和流程状态的基础组件。
- 验证命令可执行：至少运行 `pnpm typecheck`；如格式检查受既有文件影响，需要记录失败来源。
- 改动范围受控：Phase 0 不修改业务页面主逻辑，只新增文档、共享状态工具和通用状态组件。

## Task 1：建立原型页面与路由映射

**文件：**
- 创建：`docs/product/prototype-restoration-map.md`

- [ ] **Step 1：创建映射文档**

使用以下内容创建 `docs/product/prototype-restoration-map.md`：

```markdown
# 原型页面还原映射表

## 状态枚举

- `已实现`：页面结构、真实数据、主操作和状态反馈已满足当前阶段验收。
- `部分实现`：已有页面或部分模块，但仍缺少关键字段、状态或交互。
- `接口缺失`：页面需要的核心接口或字段当前不可用。
- `暂缓`：当前阶段不处理，但后续阶段会处理。
- `不在范围内`：不属于微信小程序端或已明确不做。

## 页面映射

| 编号 | 原型页面 | 当前路由 | 所属阶段 | 当前状态 | 主要验收点 |
| --- | --- | --- | --- | --- | --- |
| 1 | 首页工作台 | `/pages/home/index` | 阶段 1 | 部分实现 | 入口分发、真实 banner/推荐/统计、资源活动商机跳转 |
| 2 | 资源库首页 | `/pages/resource/home/index` | 阶段 1 | 部分实现 | 分类、搜索入口、战略供应商推荐、会员采购入口 |
| 3 | 资源列表页 | `/pages/resource/list/index` | 阶段 1 | 部分实现 | 真实分类筛选、搜索、资源列表空态 |
| 4 | 标品资源详情 | `/pages/resource/standard-detail/index` | 阶段 2 | 部分实现 | 详情字段、规格、价格、采购入口 |
| 5 | 非标资源详情 | `/pages/resource/nonstandard-detail/index` | 阶段 2 | 部分实现 | 详情字段、需求提交入口、服务说明 |
| 6 | 需求提交页 | `/pages/resource/submit/index` | 阶段 2 | 部分实现 | 表单字段、提交反馈、缺口记录 |
| 7 | 采购确认页 | `/pages/resource/purchase/index` | 阶段 2 | 部分实现 | 商品确认、创建订单、支付/状态入口 |
| 8 | 活动首页 | `/pages/event/home/index` | 阶段 1 | 部分实现 | 活动统计、城市、列表和报名入口 |
| 9 | 活动列表页 | `/pages/event/list/index` | 阶段 1 | 部分实现 | 活动筛选、列表、空态 |
| 10 | 活动详情页 | `/pages/event/detail/index` | 阶段 2 | 部分实现 | 详情字段、价格、报名入口 |
| 11 | 活动报名页 | `/pages/event/signup/index` | 阶段 2 | 部分实现 | 报名表单、报名反馈、订单/记录入口 |
| 12 | 拼团参与页 | `/pages/event/group/index` | 阶段 2 | 部分实现 | 拼团状态、参与动作、接口缺口说明 |
| 13 | 报名成功/电子票 | `/pages/event/ticket/index` | 阶段 2 | 部分实现 | 电子票字段、核销码/状态、后台核销关联 |
| 14 | 会员权益页 | `/pages/member/benefit/index` | 阶段 3 | 部分实现 | 真实会员等级、权益、开通入口 |
| 15 | 会员开通确认 | `/pages/member/confirm/index` | 阶段 3 | 部分实现 | 创建会员订单、确认金额、支付入口 |
| 16 | 对公支付凭证 | `/pages/member/payment-transfer/index` | 阶段 3 | 部分实现 | 凭证/状态轮询、真实订单状态 |
| 17 | 商机首页 | `/pages/opportunity/home/index` | 阶段 1 | 部分实现 | 统计、类型、列表、发布入口 |
| 18 | 商机详情页 | `/pages/opportunity/detail/index` | 阶段 2 | 部分实现 | 详情字段、发布人、申请入口 |
| 19 | 发布商机页 | `/pages/opportunity/publish/index` | 阶段 2 | 部分实现 | 发布表单、认证门槛、提交反馈 |
| 20 | 申请接单页 | `/pages/opportunity/apply/index` | 阶段 2 | 部分实现 | 申请理由、报价、附件、状态反馈 |
| 21 | 我的/企业会员中心 | `/pages/profile/index` | 阶段 3 | 部分实现 | 用户信息、会员状态、菜单、统计 |
| 22 | 企业认证页 | `/pages/user/cert/index` | 阶段 3 | 部分实现 | 认证表单、资料上传、审核状态 |
| 23 | 我的订单 | `/pages/user/orders/index` | 阶段 3 | 部分实现 | 订单列表、状态、详情入口 |
| 24 | 我的活动 | `/pages/user/events/index` | 阶段 3 | 部分实现 | 报名记录、票券入口、状态 |
| 25 | 我的权益 | `/pages/user/benefits/index` | 阶段 3 | 部分实现 | 会员权益、使用状态、空态 |
| 26 | 我的积分 | `/pages/user/points/index` | 阶段 3 | 部分实现 | 积分余额、明细、接口缺口说明 |
| 27 | 我的评价 | `/pages/user/reviews/index` | 阶段 3 | 部分实现 | 评价列表、可评价记录、提交入口 |
| 28 | 后台核销页 | `/pages/admin/checkin/index` | 阶段 4 | 部分实现 | 核销查询、核销状态、权限态 |
| 29 | 后台认证审核 | `/pages/admin/cert/index` | 阶段 4 | 部分实现 | 审核列表、资料预览、通过/驳回 |
| 30 | 后台订单确认 | `/pages/admin/orders/index` | 阶段 4 | 部分实现 | 订单确认、支付状态、操作反馈 |
| 31 | 后台资源需求 | `/pages/admin/resource/index` | 阶段 4 | 部分实现 | 需求列表、分配/处理状态 |
| 32 | 后台商机撮合 | `/pages/admin/opportunity/index` | 阶段 4 | 部分实现 | 商机列表、申请人、撮合状态 |
```

- [ ] **Step 2：检查文档中路由是否与配置一致**

运行：

```bash
pnpm typecheck
```

预期：如果当前工作区既有改动不影响类型，命令通过；如果失败，记录失败来源，不在本任务里修业务代码。

- [ ] **Step 3：提交**

```bash
git add docs/product/prototype-restoration-map.md
git commit -m "docs: add prototype restoration route map"
```

## Task 2：建立角色和状态规范

**文件：**
- 创建：`docs/product/roles-and-states.md`

- [ ] **Step 1：创建规范文档**

使用以下内容创建 `docs/product/roles-and-states.md`：

```markdown
# 角色权限与页面状态规范

## 角色

| 角色 | 识别来源 | 可见能力 | 受限能力 |
| --- | --- | --- | --- |
| 游客/未登录用户 | 无有效用户信息 | 浏览首页、服务商城、书苑、公开资源/活动/商机列表 | 提交需求、报名、购买、发布商机、申请接单、查看个人记录 |
| 普通用户 | `getUserInfo` 或 `getUserProfile` 返回基础用户信息 | 浏览公开内容、维护个人资料、发起部分咨询或报名 | 会员价、部分权益、认证机构动作、后台页面 |
| 会员用户 | `vip_level` 或 `vip_level_text` 有值 | 查看会员权益、会员价、会员专属入口 | 仍需认证的企业动作 |
| 认证机构 | `certification_status` 为已通过，或 `certification_status_text` 表达已认证 | 发布商机、提交企业需求、展示企业身份 | 后台审核权限 |
| 服务商/接单方 | 由接口角色字段或后续权限接口确认 | 申请接单、查看申请记录 | 平台后台处理动作 |
| 后台运营/审核人员 | `role`、`role_text` 或后台接口权限确认 | 核销、认证审核、订单确认、资源需求处理、商机撮合 | 普通用户前台权益不自动继承 |

## 通用页面状态

| 状态 | 触发条件 | 推荐标题 | 推荐说明 |
| --- | --- | --- | --- |
| 加载中 | 接口请求未完成 | 加载中 | 正在获取最新数据 |
| 空态 | 接口成功但列表为空或核心数据为空 | 暂无数据 | 当前没有可展示的记录 |
| 错误 | 接口失败或解析失败 | 加载失败 | 请稍后重试 |
| 无权限 | 当前用户角色不足 | 暂无权限 | 当前账号不能访问该功能 |
| 未登录 | 需要登录但没有用户信息 | 请先登录 | 登录后可继续操作 |
| 认证中 | 认证资料已提交但未通过 | 认证审核中 | 平台正在审核企业资料 |
| 审核中 | 业务单据已提交等待后台处理 | 审核中 | 平台将在处理后更新状态 |
| 已失效 | 活动、订单、权益或商机过期 | 已失效 | 该记录已过有效期 |
| 已取消 | 用户或平台取消记录 | 已取消 | 该记录已取消 |
| 已完成 | 流程完成 | 已完成 | 当前流程已处理完成 |

## 文案规则

- 核心字段缺失时，优先解释真实原因，不补假内容。
- 后台页面空态使用“暂无待处理记录”，避免暗示系统异常。
- 会员权益缺失使用“暂无可展示的会员权益”。
- 活动核销信息缺失使用“该活动暂未配置核销信息”。
- 订单支付状态缺失使用“支付状态确认中”。
- 商机撮合状态缺失使用“平台暂未返回撮合状态”。
```

- [ ] **Step 2：检查格式**

运行：

```bash
pnpm format:check
```

预期：文档格式检查通过；如果仓库既有文件导致失败，记录失败文件，不在本任务里修无关文件。

- [ ] **Step 3：提交**

```bash
git add docs/product/roles-and-states.md
git commit -m "docs: add role and state rules"
```

## Task 3：建立字段覆盖表

**文件：**
- 创建：`docs/product/field-coverage.md`

- [ ] **Step 1：创建字段覆盖文档**

使用以下内容创建 `docs/product/field-coverage.md`：

```markdown
# 字段覆盖表

## 缺口类型

- `已覆盖`：接口已有字段，页面可以展示。
- `暂不展示`：字段不是核心判断信息，接口缺失时页面隐藏模块。
- `接口待补`：缺失字段会影响核心业务判断，需要接口补齐。
- `后续版本`：当前阶段不实现，但保留产品方向。

## 入口与列表

| 页面 | 原型模块/字段 | 当前接口字段 | 展示策略 | 缺口类型 |
| --- | --- | --- | --- | --- |
| 首页 | banner 标题/副标题/图片/动作 | `getBanners().data.list.title/subtitle/image_url/action_url` | 有数据展示轮播；无数据使用业务安全空态或默认背景，不展示假活动 | 已覆盖 |
| 首页 | 核心业务入口 | `getCoreBusiness().data.list.title/subtitle/action_text` | 有数据展示；无数据隐藏该模块 | 已覆盖 |
| 首页 | 平台统计 | `getPlatformStats().data.list.stat_value/stat_label` | 后续接入；未接入前不展示假数字 | 接口待补 |
| 服务商城 | 服务分类 | `getProductCategories().data.list.name/icon` | 展示真实分类；无分类显示空态 | 已覆盖 |
| 服务商城 | 服务商品 | `getProducts().data.list.name/description/product_type_text/price/vip_price` | 展示真实商品；缺价格时隐藏价格 | 已覆盖 |
| 书苑 | 学习分类 | `getCourseCategories().data[].name` | 展示真实分类；无分类显示空态 | 已覆盖 |
| 书苑 | 推荐活动 | `getEvents().data.list.title/city/location/start_time/status_text` | 展示真实活动；无活动显示空态 | 已覆盖 |
| 资源列表 | 分类筛选 | `getProductCategories().data.list.name/id` | 使用真实分类和“全部” | 已覆盖 |
| 资源列表 | 资源卡片 | `getProducts().data.list` | 展示名称、描述、类型、价格、销量 | 已覆盖 |
| 活动列表 | 活动卡片 | `getEvents().data.list` | 展示标题、城市、地点、时间、价格、人数 | 已覆盖 |
| 商机列表 | 商机卡片 | `getOpportunities().data.list` | 展示标题、类型、城市、标签、申请数 | 已覆盖 |

## 详情与转化

| 页面 | 原型模块/字段 | 当前接口字段 | 展示策略 | 缺口类型 |
| --- | --- | --- | --- | --- |
| 标品资源详情 | 名称、详情、图片、规格、价格 | `getProductDetail().data` | 展示真实详情；规格为空时隐藏规格区 | 已覆盖 |
| 非标资源详情 | 详情和需求入口 | `getProductDetail().data.detail/product_type_text` | 非标判断依赖接口类型；缺类型时保守展示提交需求入口 | 已覆盖 |
| 资源采购确认 | 订单金额、订单号、状态 | `createProductOrder().data`、`getOrderDetail().data` | 创建订单后展示真实金额和状态 | 已覆盖 |
| 活动详情 | 活动介绍、时间、地点、价格 | `getEventDetail` 相关接口字段 | 以 service 现有字段为准，缺字段进入页面空态 | 接口待补 |
| 活动报名 | 报名人、联系方式、报名状态 | 报名接口返回字段 | 使用真实返回；无票券字段时不生成假票券 | 接口待补 |
| 商机详情 | 标题、描述、发布人、状态、申请数 | `getOpportunityDetail().data` | 展示真实字段；保密字段按接口标记隐藏 | 已覆盖 |
| 发布商机 | 标题、类型、城市、描述、保密 | `createOpportunity()` payload | 提交后展示真实状态 | 已覆盖 |
| 申请接单 | 理由、报价、附件、状态 | `applyOpportunity()` payload/response | 提交后展示真实状态 | 已覆盖 |

## 会员、我的与后台

| 页面 | 原型模块/字段 | 当前接口字段 | 展示策略 | 缺口类型 |
| --- | --- | --- | --- | --- |
| 会员权益 | 等级、价格、权益 | `getVipLevels()`、`getVipLevelPerks()` | 展示真实等级和权益；无权益显示空态 | 已覆盖 |
| 会员确认 | 会员订单 | `createVipOrder()`、`payVipOrder()` | 展示真实订单号、金额、状态 | 已覆盖 |
| 支付凭证 | 支付状态 | `queryVipPay()` | 轮询真实支付状态 | 已覆盖 |
| 我的 | 用户、会员、认证 | `getUserInfo()`、`getUserProfile()`、`getUserVip()` | 展示真实用户和身份状态 | 已覆盖 |
| 企业认证 | 认证资料、审核状态 | `getUserCertification()`、`submitUserCertification()` | 展示真实认证状态 | 已覆盖 |
| 我的订单 | 订单列表 | `getOrders()` | 展示真实订单；无订单显示空态 | 已覆盖 |
| 我的权益 | 权益记录 | `getUserVip()`、`getVipLevelPerks()` | 有权益展示，无权益空态 | 已覆盖 |
| 我的积分 | 积分余额和明细 | 当前 service 未见稳定积分接口 | 显示接口缺失说明，不造余额 | 接口待补 |
| 我的评价 | 评价列表 | review service | 展示真实评价；无评价空态 | 已覆盖 |
| 后台核销 | 待核销记录 | admin/checkin 页面当前接口 | 只展示真实待核销记录 | 接口待补 |
| 后台认证审核 | 待审核记录 | admin/cert 页面当前接口 | 只展示真实审核记录 | 接口待补 |
| 后台订单确认 | 待确认订单 | admin/orders 页面当前接口 | 只展示真实订单 | 接口待补 |
| 后台资源需求 | 需求列表 | admin/resource 页面当前接口 | 只展示真实需求 | 接口待补 |
| 后台商机撮合 | 商机/申请人 | admin/opportunity 页面当前接口 | 只展示真实撮合数据 | 接口待补 |
```

- [ ] **Step 2：核对明显接口名**

运行：

```bash
rg -n "getBanners|getProducts|getEvents|getOpportunityDetail|getVipLevels|getOrders" src/services src/pages
```

预期：能找到对应 service 或页面引用；没有找到的条目标记为 `接口待补`，不临时造 service。

- [ ] **Step 3：提交**

```bash
git add docs/product/field-coverage.md
git commit -m "docs: add field coverage matrix"
```

## Task 4：新增页面状态类型和默认文案

**文件：**
- 创建：`src/shared/page-state.ts`

- [ ] **Step 1：写类型和工具函数**

创建 `src/shared/page-state.ts`：

```ts
export type PageStateKind =
  | 'loading'
  | 'empty'
  | 'error'
  | 'unauthorized'
  | 'loginRequired'
  | 'certificationPending'
  | 'reviewPending'
  | 'expired'
  | 'cancelled'
  | 'completed'

export interface PageStateCopy {
  title: string
  desc: string
}

export const pageStateCopy: Record<PageStateKind, PageStateCopy> = {
  loading: {
    title: '加载中',
    desc: '正在获取最新数据'
  },
  empty: {
    title: '暂无数据',
    desc: '当前没有可展示的记录'
  },
  error: {
    title: '加载失败',
    desc: '请稍后重试'
  },
  unauthorized: {
    title: '暂无权限',
    desc: '当前账号不能访问该功能'
  },
  loginRequired: {
    title: '请先登录',
    desc: '登录后可继续操作'
  },
  certificationPending: {
    title: '认证审核中',
    desc: '平台正在审核企业资料'
  },
  reviewPending: {
    title: '审核中',
    desc: '平台将在处理后更新状态'
  },
  expired: {
    title: '已失效',
    desc: '该记录已过有效期'
  },
  cancelled: {
    title: '已取消',
    desc: '该记录已取消'
  },
  completed: {
    title: '已完成',
    desc: '当前流程已处理完成'
  }
}

export function getPageStateCopy(kind: PageStateKind, copy?: Partial<PageStateCopy>): PageStateCopy {
  return {
    ...pageStateCopy[kind],
    ...copy
  }
}
```

- [ ] **Step 2：运行类型检查**

运行：

```bash
pnpm typecheck
```

预期：新增文件无类型错误。

- [ ] **Step 3：提交**

```bash
git add src/shared/page-state.ts
git commit -m "feat: add shared page state copy"
```

## Task 5：新增通用状态展示组件

**文件：**
- 创建：`src/components/business/StateNotice.tsx`
- 修改：`src/components/business/index.ts`

- [ ] **Step 1：创建组件**

创建 `src/components/business/StateNotice.tsx`：

```tsx
import { Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { getPageStateCopy, type PageStateKind, type PageStateCopy } from '@/shared/page-state'

export interface StateNoticeProps {
  state: PageStateKind
  copy?: Partial<PageStateCopy>
  actionText?: string
  onAction?: () => void
}

export function StateNotice({ state, copy, actionText, onAction }: StateNoticeProps) {
  const displayCopy = getPageStateCopy(state, copy)

  return (
    <View className="rounded-lg bg-white px-4 py-6 text-center shadow-soft">
      <Text className="block text-base font-bold text-ink">{displayCopy.title}</Text>
      <Text className="mt-2 block text-sm leading-5 text-muted">{displayCopy.desc}</Text>
      {actionText && onAction ? (
        <View className="mt-4">
          <Button type="primary" size="small" onClick={onAction}>
            {actionText}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
```

- [ ] **Step 2：导出组件**

在 `src/components/business/index.ts` 增加：

```ts
export { StateNotice } from './StateNotice'
export type { StateNoticeProps } from './StateNotice'
```

- [ ] **Step 3：运行类型检查**

运行：

```bash
pnpm typecheck
```

预期：`StateNotice` 导出和 NutUI 按需样式无类型错误。

- [ ] **Step 4：提交**

```bash
git add src/components/business/StateNotice.tsx src/components/business/index.ts
git commit -m "feat: add reusable state notice"
```

## Task 6：Phase 0 验证与收口

**文件：**
- 检查：`docs/product/prototype-restoration-map.md`
- 检查：`docs/product/roles-and-states.md`
- 检查：`docs/product/field-coverage.md`
- 检查：`src/shared/page-state.ts`
- 检查：`src/components/business/StateNotice.tsx`
- 检查：`src/components/business/index.ts`

- [ ] **Step 1：运行文档和类型验证**

运行：

```bash
pnpm typecheck
pnpm format:check
```

预期：Phase 0 新增文件无类型和格式问题。若失败来自工作区已有无关改动，记录文件和错误摘要，不在 Phase 0 中回滚或修复无关文件。

- [ ] **Step 2：确认没有误改业务页**

运行：

```bash
git diff --name-only HEAD
```

预期：只包含 Phase 0 计划涉及的文档、`src/shared/page-state.ts`、`src/components/business/StateNotice.tsx` 和 `src/components/business/index.ts`。

- [ ] **Step 3：提交验证收口**

如果 Task 1-5 已分别提交，本任务不需要新提交。若存在格式修复，仅提交相关文件：

```bash
git add docs/product/prototype-restoration-map.md docs/product/roles-and-states.md docs/product/field-coverage.md src/shared/page-state.ts src/components/business/StateNotice.tsx src/components/business/index.ts
git commit -m "chore: finalize prototype restoration phase 0"
```

## 自检清单

- spec 中的 Phase 0 交付物都有对应任务。
- 计划不要求伪造接口数据。
- 计划不引入 H5 验证。
- 计划新增组件是薄封装，后续页面可逐步接入。
- 每个任务都有可验证命令和提交点。
