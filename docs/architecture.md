# Project Architecture

本文档记录行商书苑小程序当前的工程结构约定。后续新增页面、接口和通用能力时，优先遵守这里的边界。

## 技术栈

- Taro 4 + React 18 + TypeScript
- NutUI React Taro
- Tailwind CSS v3
- Webpack 5
- pnpm

## 目录职责

```text
src
├── app.config.ts          # 小程序全局路由、tabBar、分包配置
├── app.scss               # 全局样式入口
├── assets                 # 本地静态资源
│   └── tabbar             # 原生 tabBar PNG 图标
├── components             # 跨页面复用组件
├── pages                  # 主包页面与分包页面
├── services               # 业务接口模块
└── shared                 # 跨模块共享基础能力
```

### `shared`

`shared` 放跨业务模块共享的基础设施，可以有 Taro 依赖和运行时副作用。

当前模块：

- `src/shared/request.ts`：统一请求封装，导出 `request`、`api`、`setRequestConfig`
- `src/shared/router.ts`：统一路由常量和跳转方法，导出 `routes`、`router`

使用示例：

```ts
import { api } from '@/shared/request'
import { router, routes } from '@/shared/router'

const profile = await api.get<UserProfile>('/user/profile')

router.to(routes.userOrders)
```

### `services`

`services` 只放业务接口模块，不放请求底层封装和路由工具。

推荐结构：

```text
src/services
├── user.ts
├── order.ts
├── member.ts
├── resource.ts
└── index.ts
```

业务接口模块内部调用 `api.get` / `api.post`，页面不直接拼接口细节。

```ts
import { api } from '@/shared/request'

export interface UserProfile {
  id: string
  name: string
}

export function getUserProfile() {
  return api.get<UserProfile>('/user/profile')
}
```

### `components`

`src/components` 放真正跨页面复用的组件，例如全局页面壳、通用空状态、通用列表项。

页面私有组件不要提前上移到这里，先放在对应页面目录下。

### 页面私有组件

页面复杂后，使用页面内聚目录拆分：

```text
src/pages/profile
├── components
│   ├── ManagerCard.tsx
│   ├── MemberCard.tsx
│   ├── MenuGroup.tsx
│   ├── MetricGrid.tsx
│   └── ProfileHeader.tsx
├── index.config.ts
├── index.tsx
├── profile.data.ts
└── types.ts
```

约定：

- `index.tsx` 负责页面编排，不堆大量 JSX 细节。
- `components/` 放页面私有展示组件。
- `*.data.ts` 放静态 mock 数据或页面配置数据。
- `types.ts` 放页面私有类型。
- 当组件被 2 个以上页面复用，再考虑上移到 `src/components`。

## 路由与分包

主包只保留 4 个 tab 页：

```text
pages/home/index
pages/services/index
pages/shuyuan/index
pages/profile/index
```

其他原型页面也放在 `src/pages` 下，但通过 `subPackages` 进入分包。

当前分包：

```text
pages/resource       # 资源库
pages/event          # 活动
pages/member         # 会员与支付
pages/opportunity    # 商机
pages/user           # 我的相关二级页面
pages/admin          # 后台管理
```

配置位置：[src/app.config.ts](../src/app.config.ts)

```ts
subPackages: [
  {
    root: 'pages/resource',
    pages: ['home/index', 'list/index']
  }
]
```

注意：

- 分包页面不要出现在 `pages` 主包数组里。
- tabBar 页面不能放进分包。
- 新增页面后，同时更新 `src/app.config.ts` 和 `src/shared/router.ts`。
- 页面跳转优先使用 `router.to(routes.xxx)`，不要在页面里散落裸字符串路径。

## 请求封装

请求基础能力在 `src/shared/request.ts`。

推荐业务代码使用 `api`：

```ts
api.get<TResponse>(url, options)
api.post<TResponse, TPayload>(url, data, options)
api.put<TResponse, TPayload>(url, data, options)
api.patch<TResponse, TPayload>(url, data, options)
api.delete<TResponse>(url, options)
```

底层仍保留 `request()`，用于需要显式指定 method 或 Taro request 选项的少数场景。

```ts
request<UserProfile>({
  url: '/user/profile',
  method: 'GET'
})
```

全局配置通过 `setRequestConfig()` 设置：

```ts
setRequestConfig({
  baseURL: 'https://api.example.com',
  header: {
    Authorization: 'Bearer token'
  },
  timeout: 10000
})
```

## 图标策略

- 原生 tabBar 使用本地 PNG，放在 `src/assets/tabbar`。
- 页面内图标优先使用 NutUI Taro 图标包或页面私有轻量图标方案。
- 业务定制图标后续可沉淀为独立资产，但不要用 emoji 作为正式 UI 图标。

## 样式约定

- 页面样式优先使用 Tailwind class。
- 全局视觉 token 在 `tailwind.config.js` 中维护。
- 视觉规范参考 [design-system/行商书苑/MASTER.md](../design-system/行商书苑/MASTER.md)。
- 原始需求和原型文件保存在 [docs/reference](./reference)。

## 新增页面流程

1. 在 `src/pages/<module>/<page>/index.tsx` 创建页面。
2. 如需页面配置，增加 `index.config.ts`。
3. 在 `src/app.config.ts` 的主包或对应分包中注册页面。
4. 在 `src/shared/router.ts` 增加路由常量。
5. 页面内部使用 `router.to(routes.xxx)` 跳转。
6. 运行 `pnpm typecheck` 和 `pnpm build:weapp` 验证。
