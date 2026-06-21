# 行商书苑项目 Agent 规范索引

本项目是 Taro 4 + React + NutUI React Taro + Tailwind CSS v3 + Webpack5 的微信小程序项目。后续会话优先阅读本文件，再结合 `docs/architecture.md`、原型和设计规范推进实现。

## 0. 项目基线

- 包管理器：`pnpm`。
- 技术栈：Taro 4、React 18、NutUI React Taro、Tailwind CSS v3、Webpack5。
- 当前只运行微信小程序端；暂时不需要开发、适配或验证 H5 端。
- 页面样式优先使用 Tailwind className；小程序兼容性优先于 Web 习惯。
- 不引入复杂架构、重状态机、重工程流，除非已有明确业务收益。
- 先保持可维护性、可扩展性和原型还原度，再考虑抽象升级。

## 1. 参考资料索引

- 产品原型：`docs/reference/001-requirements.html`
- 设计规范：`docs/reference/002-design-spec.html`
- 视觉规范沉淀：`design-system/行尚书苑/MASTER.md`
- 架构说明：`docs/architecture.md`
- 接口文档：`docs/api.md`
- 路由配置：`src/app.config.ts`
- 路由工具：`src/shared/router.ts`
- 请求工具：`src/shared/request.ts`

## 2. 目录职责

- `config/`：Taro、Webpack5、weapp-tailwindcss 构建配置。非构建问题不要改这里。
- `src/app.config.ts`：页面、分包、tabBar、window 配置的唯一入口。
- `src/app.ts` / `src/app.scss`：应用入口和全局样式。
- `src/pages/`：页面与分包页面，按业务域组织。
- `src/components/`：跨页面复用组件。
- `src/components/business/`：业务通用展示组件，不放页面专属逻辑。
- `src/pages/<page>/components/`：页面或业务域局部组件。
- `src/shared/`：跨业务基础设施，如请求、路由、通用工具。
- `src/services/`：业务接口模块。页面不要直接散落 `Taro.request`。
- `src/assets/`：静态资源，tabBar 图标放 `src/assets/tabbar/`。
- `types/`：全局类型补充。

## 3. 页面与分包

- 主包只保留 tabBar 与首屏关键页面：`home`、`services`、`shuyuan`、`profile`。
- 新业务页优先放入对应分包；不要把非首屏业务页继续堆进主包。
- 新增页面必须同步维护：
  - `src/app.config.ts` 的 `pages` 或 `subPackages`
  - `src/shared/router.ts` 的 `routes`
  - 必要时补充页面级 `index.config.ts`
- 页面路径不要手写字符串，统一使用 `routes`。
- tabBar 页面不要拼 query；跳转使用 `router.to` 或 `router.switchTab`。
- 分包页面不要依赖其他分包页面内部组件；可依赖 `shared`、`components`、`services`、`assets`。

## 4. 组件拆分

- 页面 JSX 明显变长、重复区块出现 2 次以上，或同一块同时包含数据映射和复杂布局时，拆组件。
- 跨页面复用放 `src/components/business/`。
- 单页专属组件放页面目录下的 `components/`。
- 数据常量和类型可参考 `profile` 模式：`*.data.ts`、`types.ts` 与组件分离。
- 组件 props 保持显式类型；不要用宽泛 `any` 承接业务数据。
- NutUI 组件继续按需引入组件和样式。

## 5. 请求与路由

- 请求统一走 `src/shared/request.ts` 暴露的 `api`，业务接口再封装到 `src/services/<domain>.ts`。
- 期望业务调用形态：`api.get`、`api.post`、`api.put`、`api.delete`。
- 页面不要直接调用 `Taro.request`，除非是在维护底层 request 能力。
- 路由统一走 `src/shared/router.ts`：
  - 路径从 `routes` 取。
  - 带参数使用 `router.to(path, query)`。
  - `redirect` 不用于 tabBar 页面。
- 修改页面路径时，同步更新 `app.config.ts` 和 `router.ts`。

## 6. Tailwind 小程序写法

- 继续使用 Tailwind v3 + `weapp-tailwindcss`。
- `tailwind.config.js` 的 `content` 要覆盖新增源码路径。
- 保持 `preflight: false`，避免影响小程序和 NutUI 默认样式。
- 优先使用主题 token：`brand`、`gold`、`tech`、`ink`、`muted`、`line`、`canvas`。
- 少量一次性颜色可以用任意值；重复出现应沉淀到 `tailwind.config.js`。
- 避免运行时拼接不可扫描的类名，例如 `text-${color}`；使用枚举映射。
- 小程序布局优先使用稳定的 `flex`、`grid`、`gap`、`px/py`、`rounded-lg`、`shadow-soft`。

## 7. 图标策略

- tabBar 图标使用 PNG，路径维护在 `src/app.config.ts`。
- 通用 UI 图标优先使用 `@nutui/icons-react-taro`。
- 业务定制图标建议使用本地 SVG/图片资产，并封装统一 `AppIcon`，避免页面混用多套来源。
- 复杂运营图、品牌图、彩色插画使用 PNG/WebP，不硬塞进 iconfont。
- 不优先使用远程 iconfont；如必须使用，需要处理 HTTPS、CORS、加载失败和小程序兼容性。

## 8. 代码质量工具

- ESLint 配置：`eslint.config.mjs`
- Prettier 配置：`.prettierrc`
- Prettier 忽略：`.prettierignore`
- Husky hook：`.husky/pre-commit`
- 提交前 staged 文件检查：`lint-staged`

脚本：

- `pnpm typecheck`：TypeScript 类型检查。
- `pnpm lint`：ESLint 全量检查。
- `pnpm lint:fix`：ESLint 自动修复。
- `pnpm format`：Prettier 格式化。
- `pnpm format:check`：Prettier 格式检查。
- `pnpm check`：类型、lint、格式组合检查。
- `pnpm build:weapp`：微信小程序构建验证。
- `pnpm build:h5` / `pnpm dev:h5`：暂不作为日常开发和验收要求，除非明确切换到 H5 端。

规则原则：

- ESLint 只覆盖 TypeScript、React Hooks、基础未使用变量等明确问题。
- Prettier 只负责格式化，不和 ESLint 争夺风格规则。
- Husky 只跑 staged 文件，不在 pre-commit 做全量构建。

## 9. 提交前检查

- `pnpm typecheck` 通过。
- 涉及页面、路由、构建配置时执行 `pnpm build:weapp`。
- 不需要执行 H5 构建或 H5 适配检查，除非任务明确要求。
- 新增页面已同步 `app.config.ts` 和 `shared/router.ts`。
- 没有直接手写重复路由字符串。
- 没有新增 Tailwind 无法扫描的动态 class。
- NutUI 新组件已按需引入对应样式。
- 不要假设工作区干净；只处理与当前任务相关的文件，不回滚他人改动。

## 10. 外部文档查询

当问题涉及库、框架、SDK、API、CLI 或云服务的用法、配置、迁移和调试时，优先使用 Context7 查询当前文档，再给结论或改代码。
