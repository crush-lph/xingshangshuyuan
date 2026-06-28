# Phase 3 会员与个人中心闭环收口计划

> **给 agentic workers：** 必须使用 `superpowers:executing-plans` 按任务逐项执行。任务使用 checkbox（`- [ ]`）跟踪。

**目标：** 完成会员开通、对公凭证、个人中心、企业认证、我的订单、我的活动、我的权益、我的积分、我的评价的第一轮功能收口。用户侧页面要区分真实接口数据、接口失败和接口缺口，不用学习记录冒充活动记录，不用证书数量冒充真实积分，不用静态权益文案冒充后台权益。

**架构：** 继续复用 `PageShell`、`StateNotice`、`SectionCard`、`FieldList`、`ItemList`、`ActionBar`、`PaymentStatusPoller` 和既有表单组件。页面内补充轻量 `isLoading`、`hasError`、提交失败反馈和真实数据边界说明，不新增全局状态机。

**技术栈：** Taro 4、React 18、TypeScript、NutUI React Taro、Tailwind CSS v3、现有 `routes` / `router` / `services` / `components/business`。

---

## 实施计划总览

| 顺序 | 任务                   | 交付物                                                                                  | 页面范围     |
| ---- | ---------------------- | --------------------------------------------------------------------------------------- | ------------ |
| 0    | 接口盘点与字段边界确认 | `docs/product/field-coverage.md`                                                        | Phase 3 接口 |
| 1    | 会员开通与支付凭证收口 | `member/benefit`、`member/confirm`、`member/payment-transfer`                           | 会员、支付   |
| 2    | 个人中心入口与统计收口 | `profile/index`                                                                         | 我的首页     |
| 3    | 用户列表页状态收口     | `user/orders`、`user/events`、`user/benefits`、`user/points`、`user/reviews`            | 用户记录     |
| 4    | 企业认证状态与提交收口 | `user/cert`                                                                             | 企业认证     |
| 5    | 映射文档与验证         | `docs/product/prototype-restoration-map.md`、`docs/product/field-coverage.md`、验证命令 | Phase 3 页面 |

## Phase 3 验收总览

- 真实数据优先：订单、会员、认证、评价等页面只展示对应接口返回的数据。
- 接口缺口清楚：没有真实活动报名列表时，不用课程学习记录冒充活动；没有真实积分接口时，不用证书数量冒充积分余额。
- 权益边界清楚：没有真实权益使用明细、剩余额度、使用状态接口时，只展示会员等级和后台权益配置，不展示推断的“已使用/剩余/可用次数”。
- 待评价来源真实：待评价列表必须来自真实评价接口或订单/活动返回的真实可评价状态，不用静态数量或本地模拟项。
- 活动动作隐藏：活动报名记录接口未接入时，隐藏电子票、分享赚积分、去评价等活动报名动作。
- 状态区分清楚：加载中、接口失败、接口成功但无数据、接口缺口必须有不同表达。
- 支付链路不误导：微信支付、对公转账、凭证上传和支付轮询只基于真实订单号；无订单号不跳转凭证页。
- 提交反馈完整：会员订单、凭证上传、取消订单、认证提交、评价提交都要有失败反馈和 loading 关闭。
- 个人中心可解释：首页统计失败不整页崩溃；某个模块失败时展示对应说明或隐藏非核心模块。
- 文档同步：`docs/product/prototype-restoration-map.md` 和 `docs/product/field-coverage.md` 更新 Phase 3 页面验收点，仍保持 `部分实现`，直到活动报名记录、积分流水、权益使用明细等接口完整闭环。
- 小程序端验收：本阶段只验收 weapp 相关 TypeScript 和格式，不做 H5 验收。
- 构建触发条件：本阶段如改动路由、分包、NutUI 样式引入或支付底层链路，再执行 `pnpm build:weapp`；若仅页面状态和文案收口，可记录不触发构建。
- 验证通过：本地 `./node_modules/.bin/tsc --noEmit` 和针对改动文件的 Prettier check 通过；`pnpm` 环境问题如仍存在则记录。

## 页面级状态矩阵

| 页面         | 加载中        | 接口失败       | 成功空数据         | 接口缺口                      | 成功有数据            | 提交失败               |
| ------------ | ------------- | -------------- | ------------------ | ----------------------------- | --------------------- | ---------------------- |
| 会员权益     | `StateNotice` | 整页错误态     | 会员配置空态       | 不展示推断权益使用状态        | 展示真实等级/权益配置 | 会员订单生成失败 toast |
| 会员确认     | `StateNotice` | 整页错误态     | 目标等级空态       | 无订单号不进支付/凭证         | 展示真实订单/等级     | 支付失败 toast         |
| 对公支付凭证 | `StateNotice` | 整页错误态     | 无订单详情空态     | 无 `order_no` 不上传凭证      | 展示真实订单          | 上传/取消失败 toast    |
| 个人中心     | 统计区加载态  | 统计区错误态   | 入口保留、数值隐藏 | 数值缺失用 `--` 或隐藏        | 展示真实身份/统计     | 不涉及                 |
| 我的订单     | `StateNotice` | 整页错误态     | 无订单空态         | 无 `order_no` 不跳支付凭证    | 展示真实订单列表      | 不涉及                 |
| 我的活动     | `StateNotice` | 整页错误态     | 活动报名空态       | 明确活动报名接口暂未接入      | 展示真实报名记录      | 不涉及                 |
| 我的权益     | `StateNotice` | 整页错误态     | 权益明细空态       | 使用状态/剩余额度标记接口待补 | 展示真实等级/权益配置 | 不涉及                 |
| 我的积分     | `StateNotice` | 整页错误态     | 证书记录空态       | 明确积分余额/流水接口暂未接入 | 展示真实证书记录      | 不涉及                 |
| 我的评价     | `StateNotice` | 整页错误态     | 无评价空态         | 待评价来源必须来自真实状态    | 展示真实评价列表      | 评价提交失败 toast     |
| 企业认证     | `StateNotice` | 认证资料错误态 | 表单空态           | 不生成假文件地址              | 展示真实认证状态/表单 | 认证提交失败 toast     |

## Task 0：接口盘点与字段边界确认

**文件：**

- 修改：`docs/product/field-coverage.md`

- [ ] **Step 1：确认 Phase 3 真实接口**

记录会员等级、会员订单、订单列表、认证、评价列表、评价提交等已有接口为 `已覆盖`。

- [ ] **Step 2：确认接口缺口**

将活动报名记录、积分余额、积分流水、权益使用明细、权益剩余额度、待评价来源标记为 `接口待补`，展示策略写清楚“只说明缺口，不造数据”。

- [ ] **Step 3：验证**

运行：

```bash
./node_modules/.bin/prettier --check docs/product/field-coverage.md
```

预期：格式检查通过。

## Task 1：会员开通与支付凭证收口

**文件：**

- 修改：`src/pages/member/benefit/index.tsx`
- 修改：`src/pages/member/confirm/index.tsx`
- 修改：`src/pages/member/payment-transfer/index.tsx`

- [ ] **Step 1：会员权益页增加加载/错误状态**

给会员权益页增加 `isLoading`、`hasError`。`getUserProfile`、`getVipLevels`、`getAbout` 全失败时展示错误态；会员等级为空时展示真实空态。保留当前注册伙伴说明，但不能把静态说明当作接口权益明细。

- [ ] **Step 2：会员订单创建失败反馈**

`ensureOrder` 捕获 `createVipOrder` 失败，展示“会员订单生成失败，请稍后重试”。订单成功但没有 `order_no` 时不进入支付或凭证页。

- [ ] **Step 3：会员确认页增加加载/错误状态**

`member/confirm` 增加加载/错误状态。会员配置加载失败时展示错误态；无目标等级时展示空态，但仍保留返回会员权益入口。

- [ ] **Step 4：对公支付凭证页增加加载/错误状态与失败反馈**

`payment-transfer` 根据 `order_no` 加载订单：无参数为空态，接口失败错误态。上传凭证、回调、取消订单失败时展示失败 toast，不静默失败。

- [ ] **Step 5：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/member/benefit/index.tsx src/pages/member/confirm/index.tsx src/pages/member/payment-transfer/index.tsx
```

预期：类型检查和格式检查通过。

## Task 2：个人中心入口与统计收口

**文件：**

- 修改：`src/pages/profile/index.tsx`

- [ ] **Step 1：增加加载/错误状态**

个人中心并行请求全部失败时，在统计区展示 `StateNotice state="error"`；加载中展示 `StateNotice state="loading"`。顶部用户信息组件继续独立读取用户态，不阻塞页面。

- [ ] **Step 2：统计语义修正**

当前“我的活动”使用学习统计、 “已完成”跳评价，语义不够清楚。保留接口真实字段时，文案改为学习/证书等真实含义；如果原型必须是订单/活动/积分/评价入口，优先展示入口但数值缺失用“--”或隐藏数值，不用错接口凑数。

- [ ] **Step 3：菜单 badge 降级**

未读、认证状态、客户经理接口失败时不影响主菜单；对应 badge 或经理卡片隐藏即可。

- [ ] **Step 4：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/profile/index.tsx
```

预期：类型检查和格式检查通过。

## Task 3：用户列表页状态收口

**文件：**

- 修改：`src/pages/user/orders/index.tsx`
- 修改：`src/pages/user/events/index.tsx`
- 修改：`src/pages/user/benefits/index.tsx`
- 修改：`src/pages/user/points/index.tsx`
- 修改：`src/pages/user/reviews/index.tsx`

- [ ] **Step 1：我的订单增加加载/错误状态**

订单接口失败展示错误态；接口成功但无订单展示空态。待支付订单跳对公凭证必须带真实 `order_no`，无 `order_no` 时只展示“订单号缺失”或不提供跳转。

- [ ] **Step 2：我的活动避免课程冒充活动**

当前 `getUserCourses` 返回学习记录，不是真实活动报名记录。页面主状态必须明确“活动报名记录接口暂未接入”；如保留学习记录作为临时信息，必须改成“学习记录”语义，不能显示成活动报名、电子票、分享赚积分或去评价动作。

- [ ] **Step 3：我的权益增加状态表达**

`getUserProfile`、`getUserVip` 全失败时展示错误态；会员等级和权益明细分别展示真实空态。没有权益明细时不使用静态权益填充；没有使用明细/剩余额度/使用状态接口时，不展示“已使用、剩余、可用次数”等推断字段。

- [ ] **Step 4：我的积分避免证书冒充积分**

当前没有真实积分余额/流水接口。页面需要明确“积分接口暂未接入”，证书列表可作为“证书记录”展示，但不能把证书数量写成积分余额。

- [ ] **Step 5：我的评价增加加载/错误状态与提交失败反馈**

评价列表失败展示错误态；无评价展示空态。待评价入口只允许来自订单真实可评价状态或评价接口返回的真实状态；不得增加静态待评价数量或本地模拟项。提交评价失败展示“评价提交失败，请稍后重试”，不跳转列表。

- [ ] **Step 6：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/user/orders/index.tsx src/pages/user/events/index.tsx src/pages/user/benefits/index.tsx src/pages/user/points/index.tsx src/pages/user/reviews/index.tsx
```

预期：类型检查和格式检查通过。

## Task 4：企业认证状态与提交收口

**文件：**

- 修改：`src/pages/user/cert/index.tsx`

- [ ] **Step 1：认证页增加加载/错误状态**

认证资料加载失败展示错误态；无认证资料时只展示表单，不把失败当成空认证。

- [ ] **Step 2：认证提交失败反馈**

`submitUserCertification` 失败时展示“认证提交失败，请稍后重试”，保留表单内容供用户重试。

- [ ] **Step 3：上传态保持可恢复**

上传失败已经有 toast，继续保证 `uploadingKey` 和 loading 关闭；不需要新增本地假文件地址。

- [ ] **Step 4：验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/user/cert/index.tsx
```

预期：类型检查和格式检查通过。

## Task 5：文档状态与整体验证

**文件：**

- 修改：`docs/product/prototype-restoration-map.md`
- 修改：`docs/product/field-coverage.md`

- [ ] **Step 1：更新 Phase 3 映射验收点**

将 Phase 3 页面主要验收点补充为“统一状态表达、真实接口边界、支付/提交失败反馈、接口缺口说明”。页面状态仍为 `部分实现`。同步更新字段覆盖表，确保活动报名记录、积分流水、权益使用明细、待评价来源的缺口被记录。

- [ ] **Step 2：运行整体验证**

运行：

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/prettier --check src/pages/member/benefit/index.tsx src/pages/member/confirm/index.tsx src/pages/member/payment-transfer/index.tsx src/pages/profile/index.tsx src/pages/user/orders/index.tsx src/pages/user/events/index.tsx src/pages/user/benefits/index.tsx src/pages/user/points/index.tsx src/pages/user/reviews/index.tsx src/pages/user/cert/index.tsx docs/product/prototype-restoration-map.md docs/product/field-coverage.md docs/superpowers/plans/2026-06-28-full-prototype-restoration-phase-3.md
```

预期：类型检查和格式检查通过。如 `pnpm` 因本地 pnpm 版本与锁文件不兼容失败，只记录原因，不强制清理依赖。
