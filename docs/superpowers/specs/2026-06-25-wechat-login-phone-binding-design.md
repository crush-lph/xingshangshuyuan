# 微信登录与强制绑定手机号流程设计

## 背景

行商书苑小程序当前已有微信登录、token 会话、用户信息加载和个人中心手机号绑定入口。现有接口文档中的手机号绑定仍采用旧版 `encrypted_data` 与 `iv` 入参。根据微信小程序当前手机号能力，推荐使用手机号组件回调中的一次性 `code`，由后端调用微信 `phonenumber.getPhoneNumber` 换取手机号。

本设计采用“登录后强制绑定手机号”的产品策略：微信登录负责建立账号和登录态，手机号绑定作为核心业务准入条件。

## 目标

- 用户通过微信登录建立账号与 token。
- 登录成功后，如果账号未绑定手机号，立即引导绑定手机号。
- 用户拒绝绑定时保留登录态，但限制报名、购买、发布、认证、会员等核心业务能力。
- 前端优先使用微信手机号组件新版 `code` 能力。
- 后端绑定接口兼容从旧版加密数据迁移到新版手机号 `code`。

## 非目标

- 不设计手机号验证码登录替代流程。
- 不要求本次调整 H5 端。
- 不引入复杂状态机或跨端认证框架。
- 不变更 tabBar、路由结构或整体页面视觉体系。

## 用户流程

### 首次登录

1. 用户点击“微信授权登录”。
2. 前端调用 `Taro.login()` 获取微信临时登录 `code`。
3. 前端调用 `/api/auth/wx_login`。
4. 后端用登录 `code` 换取微信用户标识，创建或查询用户，返回 `token`、用户基础信息和手机号绑定状态。
5. 前端保存 token，并刷新用户信息。
6. 如果用户已绑定手机号，进入已登录可用状态。
7. 如果用户未绑定手机号，立即展示“绑定手机号”引导。

### 强制绑定手机号

1. 用户在登录成功后的绑定引导中点击“绑定手机号”。
2. 按钮使用微信手机号组件能力：`openType="getPhoneNumber"`。
3. 前端从回调中读取 `event.detail.code`。
4. 前端携带当前 token 调用 `/api/auth/bind_phone`。
5. 后端消费手机号 `code`，获取手机号并绑定到当前用户。
6. 后端返回手机号。
7. 前端更新 `userInfo.phone` 与 `profile.phone`，刷新用户信息。
8. 用户进入完整登录态，可访问核心业务功能。

### 用户拒绝绑定

1. 用户取消或拒绝手机号授权。
2. 前端不清除 token。
3. 当前状态变为“已登录，待绑定手机号”。
4. 普通浏览能力保留。
5. 报名、购买、发布、认证、会员等核心动作触发时，统一拦截并再次要求绑定手机号。

## 前端设计

### 状态

现有 `src/stores/user-info.ts` 可以继续作为认证状态入口。建议新增或沉淀派生状态：

```ts
const isPhoneBound = Boolean(profile?.phone || userInfo?.phone)
const authStep = !isLoggedIn ? 'guest' : isPhoneBound ? 'ready' : 'phone-required'
```

如果不显式存储 `authStep`，也应提供等价 selector，避免页面重复判断手机号绑定状态。

### Store 能力

`useUserInfo` 建议保留现有能力，并调整手机号绑定 payload：

```ts
loginWithWechat: () => Promise<void>
bindWechatPhone: (payload: { code?: string; encryptedData?: string; iv?: string }) => Promise<void>
isPhoneBound: boolean
```

`bindWechatPhone` 优先提交 `code`。仅在后端仍处于兼容期且微信回调未返回 `code` 时，才兜底提交 `encryptedData` 与 `iv`。

### 守卫

保留现有 `ensureLoggedIn()`，新增 `ensurePhoneBound()`：

```ts
export async function ensurePhoneBound(message = '绑定手机号后才能继续操作') {
  if (!getAuthToken()) {
    return ensureLoggedIn()
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

核心业务页面和动作应使用 `ensurePhoneBound()`，只需要登录但不需要手机号的场景继续使用 `ensureLoggedIn()`。

### 页面入口

个人中心顶部保持三态：

- 未登录：展示“去登录”。
- 已登录未绑定手机号：展示“绑定手机号”，副文案提示“绑定后可报名活动、购买资源、提交商机”。
- 已登录已绑定：展示认证状态、会员状态或企业信息。

登录成功但未绑定手机号时，应立即展示绑定引导。实现可以是个人中心头部的突出按钮，也可以是轻量弹层，但主按钮必须直接承载微信手机号组件，不做自定义手机号输入作为主路径。

## 后端接口设计

### 微信登录

`POST /api/auth/wx_login`

请求：

```json
{
  "code": "wx.login 返回的临时 code"
}
```

响应建议：

```json
{
  "token": "jwt token",
  "user_id": 1,
  "nickname": "用户昵称",
  "avatar": "头像地址",
  "phone": "",
  "phone_bound": false,
  "is_new": true
}
```

`phone_bound` 可以由 `phone` 是否存在推导，但后端显式返回能减少前端歧义。

### 绑定手机号

`POST /api/auth/bind_phone`

请求建议：

```json
{
  "code": "getPhoneNumber 回调的一次性 code"
}
```

迁移期兼容：

```json
{
  "code": "新版手机号 code",
  "encrypted_data": "旧版加密数据",
  "iv": "旧版加密向量"
}
```

后端处理优先级：

1. 如果存在 `code`，优先调用微信 `phonenumber.getPhoneNumber`。
2. 如果不存在 `code` 且存在 `encrypted_data` 与 `iv`，走旧版解密兼容。
3. 两者都不存在时返回业务错误。

响应：

```json
{
  "phone": "13800000000"
}
```

绑定接口必须要求登录态，并只绑定当前 token 对应用户。

## 错误处理

- `Taro.login` 失败：提示“微信登录失败，请稍后重试”。
- `/api/auth/wx_login` 未返回 token：视为登录失败，不进入绑定流程。
- 用户拒绝手机号授权：提示“未绑定手机号，部分功能暂不可用”，保留登录态。
- 手机号 `code` 过期或已消费：提示“授权已过期，请重新点击绑定”。
- `/api/auth/bind_phone` 返回未授权：清空登录态，回到未登录状态。
- 绑定成功但刷新用户信息失败：先用绑定接口返回的手机号更新本地状态，再静默刷新用户信息。

## 安全与合规

- 前端不存储 openid、unionid、session_key。
- 前端不解密手机号。
- 手机号组件必须由用户点击触发，不自动请求。
- 后端消费手机号 `code` 后应立即作废，不重复使用。
- token 失效时清理本地 token 和用户信息。

## 验收标准

- 未登录用户点击登录后能完成微信登录。
- 登录成功但无手机号时，立刻看到绑定手机号引导。
- 用户拒绝绑定后仍保持登录态，但核心业务动作会再次拦截。
- 用户同意绑定后，个人中心展示手机号相关状态，核心业务动作不再拦截。
- 前端优先提交 `event.detail.code` 到绑定接口。
- 后端绑定接口支持新版手机号 `code`，并在迁移期兼容旧版 `encrypted_data` 与 `iv`。
- `pnpm typecheck` 通过。
- 涉及页面或守卫调整时，`pnpm build:weapp` 通过。
