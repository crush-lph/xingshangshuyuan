# xingshangshuyuan

行商书苑小程序工程，基于 Taro 4、NutUI React Taro、Tailwind CSS v3 和 Webpack 5 初始化。

## 技术栈

- Taro 4.2
- React 18
- TypeScript
- NutUI React Taro
- Tailwind CSS v3
- Webpack 5

## 包管理器

本项目统一使用 pnpm。

```bash
pnpm install
```

建议使用 Node.js 22。Node 20.14 会触发部分依赖的 engine warning。

## 开发

接口地址通过环境变量配置，默认值见 `.env.example`：

```bash
TARO_APP_API_BASE_URL=http://www.xssy365.com/
```

可以在本地 `.env.local` 中覆盖，或启动时直接传入：

```bash
TARO_APP_API_BASE_URL=http://www.xssy365.com/ pnpm dev:weapp
```

微信小程序开发：

```bash
pnpm dev:weapp
```

H5 开发：

```bash
pnpm dev:h5
```

## 构建

微信小程序构建：

```bash
pnpm build:weapp
```

H5 构建：

```bash
pnpm build:h5
```

## 校验

```bash
pnpm typecheck
```

## 页面菜单

- 首页
- 服务商城
- 行商书苑
- 我的

## 工程约定

项目架构、目录职责、分包策略、请求封装和路由规则见：

- [docs/architecture.md](docs/architecture.md)

核心约定：

- `src/shared` 放跨模块基础能力，例如 `request`、`router`。
- `src/services` 只放业务接口模块。
- 主包只保留 4 个 tab 页，其他页面通过 `subPackages` 拆分包。
- 页面复杂后在页面目录内拆 `components`、`types.ts`、`*.data.ts`。
