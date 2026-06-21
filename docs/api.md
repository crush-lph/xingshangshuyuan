# 接口文档

本文档由 `shuyuan.apifox.json` 整理而来，用于项目内接口接入和页面联调。接口调用统一通过 `src/shared/request.ts` 的 `api` 封装，并在 `src/services/` 中按业务域二次封装。

## 使用约定

- 基础路径：接口文档中未提供固定服务地址，项目内接口均使用 `/api/...` 相对路径；运行时通过 `setRequestConfig({ baseURL })` 注入后端地址。
- 响应结构：除特别说明外，接口返回 `ApiResponse<T>`：`{ code: number; info: string; data: T }`。
- 认证：文档中标记为需认证的接口应携带后端约定的登录 token，具体 header 由 `src/shared/request.ts` 全局配置或请求 options 注入。
- 文件上传：`POST /api/upload` 在 Apifox 中没有 multipart 字段定义；小程序真实文件上传建议另行封装 `Taro.uploadFile`，不要直接用 JSON `api.post` 上传二进制文件。

## 接口总览

| 分组         | 名称                               | 方法 | 路径                              | 认证 | Service                                  |
| ------------ | ---------------------------------- | ---- | --------------------------------- | ---- | ---------------------------------------- |
| 系统         | API 状态检测                       | GET  | `/api/index/index`                | 否   | `system.getSystemStatus`                 |
| 认证         | 微信小程序登录（仅需 code）        | POST | `/api/auth/wx_login`              | 否   | `auth.wxLogin`                           |
| 认证         | 绑定微信手机号（需登录态）         | POST | `/api/auth/bind_phone`            | 是   | `auth.bindPhone`                         |
| 认证         | 手机号验证码登录                   | POST | `/api/auth/phone_login`           | 否   | `auth.phoneLogin`                        |
| 认证         | 发送短信验证码                     | POST | `/api/auth/sms_code`              | 否   | `auth.sendSmsCode`                       |
| 用户         | 获取个人信息                       | GET  | `/api/user/profile`               | 是   | `user.getUserProfile`                    |
| 用户         | 更新个人信息                       | POST | `/api/user/profile`               | 是   | `user.updateUserProfile`                 |
| 用户         | 获取企业认证状态                   | GET  | `/api/user/certification`         | 是   | `user.getUserCertification`              |
| 用户         | 提交企业认证                       | POST | `/api/user/certification`         | 是   | `user.submitUserCertification`           |
| 用户         | 获取用户基本信息                   | GET  | `/api/user/info`                  | 是   | `user.getUserInfo`                       |
| 首页         | 获取轮播图列表                     | GET  | `/api/banners`                    | 否   | `home.getBanners`                        |
| 首页         | 获取四大核心业务配置               | GET  | `/api/core-business`              | 否   | `home.getCoreBusiness`                   |
| 首页         | 获取平台动态列表                   | GET  | `/api/notifications`              | 否   | `home.getNotifications`                  |
| 首页         | 获取快捷入口配置                   | GET  | `/api/quick-entries`              | 否   | `home.getQuickEntries`                   |
| 首页         | 搜索建议（商品/课程/商机）         | GET  | `/api/search/suggest`             | 否   | `home.getSearchSuggest`                  |
| 首页         | 获取平台统计数据                   | GET  | `/api/stats/platform`             | 否   | `home.getPlatformStats`                  |
| 消息通知     | 获取消息列表                       | GET  | `/api/user/messages`              | 是   | `message.getUserMessages`                |
| 消息通知     | 标记单条消息已读                   | POST | `/api/user/message/read`          | 否   | `message.markUserMessageRead`            |
| 消息通知     | 全部标记已读                       | POST | `/api/user/messages/read-all`     | 是   | `message.markAllUserMessagesRead`        |
| 个人中心     | 获取会员权益信息                   | GET  | `/api/user/vip`                   | 是   | `profile.getUserVip`                     |
| 个人中心     | 获取订单列表                       | GET  | `/api/orders`                     | 是   | `profile.getOrders`                      |
| 个人中心     | 获取我的证书列表                   | GET  | `/api/user/certificates`          | 是   | `profile.getUserCertificates`            |
| 个人中心     | 获取我的客户列表                   | GET  | `/api/user/customers`             | 是   | `profile.getUserCustomers`               |
| 个人中心     | 获取合同列表                       | GET  | `/api/contracts`                  | 否   | `profile.getContracts`                   |
| 个人中心     | 获取合同详情                       | GET  | `/api/contract/detail`            | 否   | `profile.getContractDetail`              |
| 个人中心     | 获取发票列表                       | GET  | `/api/invoices`                   | 是   | `profile.getInvoices`                    |
| 个人中心     | 文件上传                           | POST | `/api/upload`                     | 是   | `profile.uploadFileRecord`               |
| 个人中心     | 获取客服配置                       | GET  | `/api/customer-service/config`    | 否   | `profile.getCustomerServiceConfig`       |
| 个人中心     | 获取关于平台信息                   | GET  | `/api/about`                      | 否   | `profile.getAbout`                       |
| 个人中心     | 获取会员等级权益配置               | GET  | `/api/user/vip/level-perks`       | 否   | `profile.getVipLevelPerks`               |
| 订单         | 获取订单详情                       | GET  | `/api/order/detail`               | 是   | `order.getOrderDetail`                   |
| 订单         | 发起支付                           | POST | `/api/order/pay`                  | 是   | `order.payOrder`                         |
| 订单         | 取消订单                           | POST | `/api/order/cancel`               | 是   | `order.cancelOrder`                      |
| 订单         | 微信支付回调（内部接口）           | POST | `/api/payment/callback`           | 否   | `order.paymentCallback`                  |
| 学习中心     | 获取课程分类列表                   | GET  | `/api/course/categories`          | 否   | `learning.getCourseCategories`           |
| 学习中心     | 获取课程列表                       | GET  | `/api/courses`                    | 否   | `learning.getCourses`                    |
| 学习中心     | 获取课程详情                       | GET  | `/api/course/detail`              | 否   | `learning.getCourseDetail`               |
| 学习中心     | 获取课程章节列表（需登录且已购买） | GET  | `/api/course/sections`            | 是   | `learning.getCourseSections`             |
| 学习中心     | 购买课程                           | POST | `/api/course/buy`                 | 是   | `learning.buyCourse`                     |
| 学习中心     | 我的课程列表                       | GET  | `/api/user/courses`               | 是   | `learning.getUserCourses`                |
| 学习中心     | 获取课程学习进度                   | GET  | `/api/user/course/progress`       | 是   | `learning.getUserCourseProgress`         |
| 学习中心     | 更新学习进度                       | POST | `/api/user/course/progress`       | 是   | `learning.updateUserCourseProgress`      |
| 学习中心     | 获取线下活动列表                   | GET  | `/api/events`                     | 否   | `learning.getEvents`                     |
| 学习中心     | 获取活动详情                       | GET  | `/api/event/detail`               | 否   | `learning.getEventDetail`                |
| 学习中心     | 活动报名                           | POST | `/api/event/register`             | 是   | `learning.registerEvent`                 |
| 学习中心     | 获取学习统计数据                   | GET  | `/api/user/learning/stats`        | 是   | `learning.getUserLearningStats`          |
| 商机对接(V2) | 商机数据看板                       | GET  | `/api/opportunities/stats`        | 否   | `opportunity.getOpportunityStats`        |
| 商机对接(V2) | 商机列表（展示中）                 | GET  | `/api/opportunities`              | 否   | `opportunity.getOpportunities`           |
| 商机对接(V2) | 发布商机（甩单）                   | POST | `/api/opportunities`              | 否   | `opportunity.createOpportunity`          |
| 商机对接(V2) | 商机详情                           | GET  | `/api/opportunity/detail`         | 否   | `opportunity.getOpportunityDetail`       |
| 商机对接(V2) | 申请接单                           | POST | `/api/opportunity/apply`          | 否   | `opportunity.applyOpportunity`           |
| 商机对接(V2) | 我发布的商机                       | GET  | `/api/opportunities/mine`         | 否   | `opportunity.getMyOpportunities`         |
| 商机对接(V2) | 我收到的接单申请（发布者查看）     | GET  | `/api/opportunity/applications`   | 否   | `opportunity.getOpportunityApplications` |
| 商机对接(V2) | 我的申请记录（申请人查看）         | GET  | `/api/user/applications`          | 否   | `opportunity.getUserApplications`        |
| 商机对接(V2) | 关闭商机                           | POST | `/api/opportunity/status`         | 否   | `opportunity.updateOpportunityStatus`    |
| 商机对接(V2) | 获取企业档案                       | GET  | `/api/companies/profile`          | 否   | `opportunity.getCompanyProfile`          |
| 商机对接(V2) | 创建/更新企业档案                  | POST | `/api/companies/profile`          | 否   | `opportunity.saveCompanyProfile`         |
| 服务商城     | 获取商品分类列表                   | GET  | `/api/product/categories`         | 否   | `product.getProductCategories`           |
| 服务商城     | 获取商品列表                       | GET  | `/api/products`                   | 否   | `product.getProducts`                    |
| 服务商城     | 获取商品详情                       | GET  | `/api/product/detail`             | 否   | `product.getProductDetail`               |
| 服务商城     | 购买商品/提交订单                  | POST | `/api/product/order`              | 否   | `product.createProductOrder`             |
| 消息         | 获取未读消息数                     | GET  | `/api/user/messages/unread-count` | 否   | `message.getUnreadMessageCount`          |

## 系统

### API 状态检测

- 方法：`GET`
- 路径：`/api/index/index`
- 认证：否
- Service：`system.getSystemStatus`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段    | 类型   | 必填 | 说明       | 示例                  |
| ------- | ------ | ---- | ---------- | --------------------- |
| app     | string | 否   | 应用名称   | "ThinkAdmin"          |
| version | string | 否   | 系统版本   | "v6"                  |
| time    | string | 否   | 服务器时间 | "2026-06-18 12:00:00" |

## 认证

### 微信小程序登录（仅需 code）

- 方法：`POST`
- 路径：`/api/auth/wx_login`
- 认证：否
- Service：`auth.wxLogin`

请求 Query：

无。

请求 Body：

| 字段 | 类型   | 必填 | 说明                     | 示例 |
| ---- | ------ | ---- | ------------------------ | ---- |
| code | string | 否   | wx.login 获取的临时 code |      |

响应 Data：

| 字段     | 类型            | 必填 | 说明                 | 示例 |
| -------- | --------------- | ---- | -------------------- | ---- |
| token    | string          | 否   | JWT 令牌             |      |
| user_id  | number(integer) | 否   | 用户ID               |      |
| nickname | string          | 否   | 用户昵称             |      |
| avatar   | string          | 否   | 头像地址             |      |
| phone    | string          | 否   | 手机号（未绑定为空） |      |
| is_new   | boolean         | 否   | 是否新用户           |      |

### 绑定微信手机号（需登录态）

- 方法：`POST`
- 路径：`/api/auth/bind_phone`
- 认证：是
- Service：`auth.bindPhone`

请求 Query：

无。

请求 Body：

| 字段           | 类型   | 必填 | 说明                             | 示例 |
| -------------- | ------ | ---- | -------------------------------- | ---- |
| encrypted_data | string | 否   | wx.getPhoneNumber 返回的加密数据 |      |
| iv             | string | 否   | 加密初始向量                     |      |

响应 Data：

| 字段  | 类型   | 必填 | 说明   | 示例 |
| ----- | ------ | ---- | ------ | ---- |
| phone | string | 否   | 手机号 |      |

### 手机号验证码登录

- 方法：`POST`
- 路径：`/api/auth/phone_login`
- 认证：否
- Service：`auth.phoneLogin`

请求 Query：

无。

请求 Body：

| 字段     | 类型   | 必填 | 说明       | 示例 |
| -------- | ------ | ---- | ---------- | ---- |
| phone    | string | 否   | 手机号     |      |
| sms_code | string | 否   | 短信验证码 |      |

响应 Data：

| 字段     | 类型            | 必填 | 说明       | 示例 |
| -------- | --------------- | ---- | ---------- | ---- |
| token    | string          | 否   | JWT 令牌   |      |
| user_id  | number(integer) | 否   | 用户ID     |      |
| nickname | string          | 否   | 用户昵称   |      |
| avatar   | string          | 否   | 头像地址   |      |
| phone    | string          | 否   | 手机号     |      |
| is_new   | boolean         | 否   | 是否新用户 |      |

### 发送短信验证码

- 方法：`POST`
- 路径：`/api/auth/sms_code`
- 认证：否
- Service：`auth.sendSmsCode`

请求 Query：

无。

请求 Body：

| 字段  | 类型   | 必填 | 说明                       | 示例 |
| ----- | ------ | ---- | -------------------------- | ---- |
| phone | string | 否   | 手机号（11位）             |      |
| scene | string | 否   | 场景: login/register/reset |      |

响应 Data：

| 字段      | 类型            | 必填 | 说明           | 示例 |
| --------- | --------------- | ---- | -------------- | ---- |
| expire_in | number(integer) | 否   | 过期时间（秒） | 300  |

## 用户

### 获取个人信息

- 方法：`GET`
- 路径：`/api/user/profile`
- 认证：是
- Service：`user.getUserProfile`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段                      | 类型            | 必填 | 说明                          | 示例 |
| ------------------------- | --------------- | ---- | ----------------------------- | ---- |
| user_id                   | number(integer) | 否   | 用户ID                        |      |
| nickname                  | string          | 否   | 用户昵称                      |      |
| avatar                    | string          | 否   | 头像地址                      |      |
| phone                     | string          | 否   | 手机号                        |      |
| company_name              | string          | 否   | 所属公司                      |      |
| role                      | number(integer) | 否   | 角色(1普通,2联盟伙伴,3管理员) |      |
| role_text                 | string          | 否   | 角色文字                      |      |
| vip_level                 | number(integer) | 否   | 会员等级                      |      |
| vip_level_text            | string          | 否   | 会员等级文字                  |      |
| certification_status      | number(integer) | 否   | 认证状态                      |      |
| certification_status_text | string          | 否   | 认证状态文字                  |      |
| city                      | string          | 否   | 所在城市                      |      |
| position                  | string          | 否   | 职位                          |      |
| created_at                | string          | 否   | 创建时间                      |      |

### 更新个人信息

- 方法：`POST`
- 路径：`/api/user/profile`
- 认证：是
- Service：`user.updateUserProfile`

请求 Query：

无。

请求 Body：

| 字段         | 类型   | 必填 | 说明    | 示例 |
| ------------ | ------ | ---- | ------- | ---- |
| nickname     | string | 否   | 昵称    |      |
| avatar       | string | 否   | 头像URL |      |
| company_name | string | 否   | 公司名  |      |
| city         | string | 否   | 城市    |      |
| position     | string | 否   | 职位    |      |

响应 Data：

无。

### 获取企业认证状态

- 方法：`GET`
- 路径：`/api/user/certification`
- 认证：是
- Service：`user.getUserCertification`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段             | 类型            | 必填 | 说明     | 示例 |
| ---------------- | --------------- | ---- | -------- | ---- |
| certification_id | number(integer) | 否   | 认证ID   |      |
| company_name     | string          | 否   | 企业名称 |      |
| credit_code      | string          | 否   | 信用代码 |      |
| legal_person     | string          | 否   | 法人姓名 |      |
| status           | number(integer) | 否   | 状态     |      |
| status_text      | string          | 否   | 状态文字 |      |
| reject_reason    | string          | 否   | 拒绝原因 |      |
| reviewed_at      | string          | 否   | 审核时间 |      |
| created_at       | string          | 否   | 创建时间 |      |

### 提交企业认证

- 方法：`POST`
- 路径：`/api/user/certification`
- 认证：是
- Service：`user.submitUserCertification`

请求 Query：

无。

请求 Body：

| 字段                 | 类型   | 必填 | 说明             | 示例 |
| -------------------- | ------ | ---- | ---------------- | ---- |
| company_name         | string | 否   | 企业名称         |      |
| credit_code          | string | 否   | 统一社会信用代码 |      |
| legal_person         | string | 否   | 法人姓名         |      |
| business_license_url | string | 否   | 营业执照图片URL  |      |
| id_card_front_url    | string | 否   | 身份证正面       |      |
| id_card_back_url     | string | 否   | 身份证反面       |      |
| contact_phone        | string | 否   | 联系电话         |      |

响应 Data：

| 字段             | 类型            | 必填 | 说明     | 示例     |
| ---------------- | --------------- | ---- | -------- | -------- |
| certification_id | number(integer) | 否   | 认证ID   |          |
| status           | number(integer) | 否   | 状态     | 0        |
| status_text      | string          | 否   | 状态文字 | "待审核" |

### 获取用户基本信息

- 方法：`GET`
- 路径：`/api/user/info`
- 认证：是
- Service：`user.getUserInfo`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段          | 类型            | 必填 | 说明         | 示例 |
| ------------- | --------------- | ---- | ------------ | ---- |
| id            | number(integer) | 否   | 用户ID       |      |
| nickname      | string          | 否   | 昵称         |      |
| avatar        | string          | 否   | 头像地址     |      |
| phone         | string          | 否   | 手机号       |      |
| last_login_at | string          | 否   | 最后登录时间 |      |

## 首页

### 获取轮播图列表

- 方法：`GET`
- 路径：`/api/banners`
- 认证：否
- Service：`home.getBanners`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段               | 类型            | 必填 | 说明                          | 示例 |
| ------------------ | --------------- | ---- | ----------------------------- | ---- |
| list               | array<object>   | 否   |                               |      |
| list[].id          | number(integer) | 否   | 轮播图ID                      |      |
| list[].title       | string          | 否   | 标题                          |      |
| list[].subtitle    | string          | 否   | 副标题                        |      |
| list[].image_url   | string          | 否   | 图片URL                       |      |
| list[].action_type | number(integer) | 否   | 跳转类型(1页面,2外链,3小程序) |      |
| list[].action_url  | string          | 否   | 跳转地址                      |      |
| list[].sort_order  | number(integer) | 否   | 排序                          |      |

### 获取四大核心业务配置

- 方法：`GET`
- 路径：`/api/core-business`
- 认证：否
- Service：`home.getCoreBusiness`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段                     | 类型            | 必填 | 说明                                  | 示例 |
| ------------------------ | --------------- | ---- | ------------------------------------- | ---- |
| list                     | array<object>   | 否   |                                       |      |
| list[].id                | number(integer) | 否   | 记录ID                                |      |
| list[].title             | string          | 否   | 业务标题                              |      |
| list[].subtitle          | string          | 否   | 副标题                                |      |
| list[].action_text       | string          | 否   | 按钮文案                              |      |
| list[].product_type      | number(integer) | 否   | 关联商品类型(1工具,2课程,3咨询,4认证) |      |
| list[].product_type_text | string          | 否   | 商品类型文字                          |      |
| list[].sort_order        | number(integer) | 否   | 排序                                  |      |

### 获取平台动态列表

- 方法：`GET`
- 路径：`/api/notifications`
- 认证：否
- Service：`home.getNotifications`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                                                    | 示例 |
| --------- | --------------------------- | ---- | ------------------------------------------------------- | ---- |
| type      | string \| number \| boolean | 否   | 类型筛选(1公告,2政策解读,3成功案例,4活动预告,5新课通知) | 1    |
| page      | string \| number \| boolean | 否   | 页码                                                    | 1    |
| page_size | string \| number \| boolean | 否   | 每页数量                                                | 10   |

请求 Body：

无。

响应 Data：

| 字段                | 类型            | 必填 | 说明              | 示例 |
| ------------------- | --------------- | ---- | ----------------- | ---- |
| list                | array<object>   | 否   |                   |      |
| list[].id           | number(integer) | 否   | 通知ID            |      |
| list[].type         | number(integer) | 否   | 类型              |      |
| list[].type_text    | string          | 否   | 类型文字          |      |
| list[].title        | string          | 否   | 标题              |      |
| list[].summary      | string          | 否   | 摘要              |      |
| list[].is_top       | number(integer) | 否   | 是否置顶(0否,1是) |      |
| list[].view_count   | number(integer) | 否   | 浏览次数          |      |
| list[].published_at | string          | 否   | 发布时间          |      |
| total               | number(integer) | 否   | 总数              |      |
| page                | number(integer) | 否   | 当前页码          |      |
| page_size           | number(integer) | 否   | 每页数量          |      |
| total_page          | number(integer) | 否   | 总页数            |      |

### 获取快捷入口配置

- 方法：`GET`
- 路径：`/api/quick-entries`
- 认证：否
- Service：`home.getQuickEntries`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段             | 类型            | 必填 | 说明                            | 示例 |
| ---------------- | --------------- | ---- | ------------------------------- | ---- |
| list             | array<object>   | 否   |                                 |      |
| list[].id        | number(integer) | 否   | 记录ID                          |      |
| list[].name      | string          | 否   | 入口名称                        |      |
| list[].icon      | string          | 否   | 图标标识                        |      |
| list[].link_type | string          | 否   | 跳转类型(page内部,external外链) |      |
| list[].link_url  | string          | 否   | 跳转地址                        |      |

### 搜索建议（商品/课程/商机）

- 方法：`GET`
- 路径：`/api/search/suggest`
- 认证：否
- Service：`home.getSearchSuggest`

请求 Query：

| 字段    | 类型                        | 必填 | 说明       | 示例 |
| ------- | --------------------------- | ---- | ---------- | ---- |
| keyword | string \| number \| boolean | 是   | 搜索关键词 | 代账 |

请求 Body：

无。

响应 Data：

| 字段                  | 类型            | 必填 | 说明     | 示例 |
| --------------------- | --------------- | ---- | -------- | ---- |
| products              | array<object>   | 否   |          |      |
| products[].id         | number(integer) | 否   | 商品ID   |      |
| products[].name       | string          | 否   | 商品名称 |      |
| products[].type       | string          | 否   | 类型     |      |
| products[].price      | string          | 否   | 价格     |      |
| courses               | array<object>   | 否   |          |      |
| courses[].id          | number(integer) | 否   | 课程ID   |      |
| courses[].title       | string          | 否   | 课程标题 |      |
| courses[].teacher     | string          | 否   | 讲师     |      |
| courses[].price       | string          | 否   | 价格     |      |
| opportunities         | array<object>   | 否   |          |      |
| opportunities[].id    | number(integer) | 否   | 商机ID   |      |
| opportunities[].title | string          | 否   | 商机标题 |      |

### 获取平台统计数据

- 方法：`GET`
- 路径：`/api/stats/platform`
- 认证：否
- Service：`home.getPlatformStats`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段              | 类型          | 必填 | 说明     | 示例 |
| ----------------- | ------------- | ---- | -------- | ---- |
| list              | array<object> | 否   |          |      |
| list[].stat_key   | string        | 否   | 统计标识 |      |
| list[].stat_value | string        | 否   | 统计值   |      |
| list[].stat_label | string        | 否   | 展示标签 |      |

## 消息通知

### 获取消息列表

- 方法：`GET`
- 路径：`/api/user/messages`
- 认证：是
- Service：`message.getUserMessages`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                                    | 示例 |
| --------- | --------------------------- | ---- | --------------------------------------- | ---- |
| type      | string \| number \| boolean | 否   | 类型筛选(1系统,2订单,3商机,4课程,5互动) | 0    |
| page      | string \| number \| boolean | 否   |                                         | 1    |
| page_size | string \| number \| boolean | 否   |                                         | 10   |

请求 Body：

无。

响应 Data：

无。

### 标记单条消息已读

- 方法：`POST`
- 路径：`/api/user/message/read`
- 认证：否
- Service：`message.markUserMessageRead`

请求 Query：

无。

请求 Body：

| 字段       | 类型            | 必填 | 说明   | 示例 |
| ---------- | --------------- | ---- | ------ | ---- |
| message_id | number(integer) | 否   | 消息ID |      |

响应 Data：

无。

### 全部标记已读

- 方法：`POST`
- 路径：`/api/user/messages/read-all`
- 认证：是
- Service：`message.markAllUserMessagesRead`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

## 个人中心

### 获取会员权益信息

- 方法：`GET`
- 路径：`/api/user/vip`
- 认证：是
- Service：`profile.getUserVip`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取订单列表

- 方法：`GET`
- 路径：`/api/orders`
- 认证：是
- Service：`profile.getOrders`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                            | 示例 |
| --------- | --------------------------- | ---- | ------------------------------- | ---- |
| status    | string \| number \| boolean | 否   | 0待支付,1待服务,2已完成,3已取消 | 0    |
| page      | string \| number \| boolean | 否   |                                 | 1    |
| page_size | string \| number \| boolean | 否   |                                 | 10   |

请求 Body：

无。

响应 Data：

无。

### 获取我的证书列表

- 方法：`GET`
- 路径：`/api/user/certificates`
- 认证：是
- Service：`profile.getUserCertificates`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取我的客户列表

- 方法：`GET`
- 路径：`/api/user/customers`
- 认证：是
- Service：`profile.getUserCustomers`

请求 Query：

| 字段      | 类型                        | 必填 | 说明              | 示例 |
| --------- | --------------------------- | ---- | ----------------- | ---- |
| status    | string \| number \| boolean | 否   | 0流失,1活跃,2潜在 | 1    |
| keyword   | string \| number \| boolean | 否   |                   | 王   |
| page      | string \| number \| boolean | 否   |                   | 1    |
| page_size | string \| number \| boolean | 否   |                   | 10   |

请求 Body：

无。

响应 Data：

无。

### 获取合同列表

- 方法：`GET`
- 路径：`/api/contracts`
- 认证：否
- Service：`profile.getContracts`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                | 示例 |
| --------- | --------------------------- | ---- | ------------------- | ---- |
| status    | string \| number \| boolean | 否   | 0作废,1生效中,2到期 | 1    |
| page      | string \| number \| boolean | 否   |                     | 1    |
| page_size | string \| number \| boolean | 否   |                     | 10   |

请求 Body：

无。

响应 Data：

无。

### 获取合同详情

- 方法：`GET`
- 路径：`/api/contract/detail`
- 认证：否
- Service：`profile.getContractDetail`

请求 Query：

| 字段        | 类型                        | 必填 | 说明   | 示例 |
| ----------- | --------------------------- | ---- | ------ | ---- |
| contract_id | string \| number \| boolean | 是   | 合同ID | 1    |

请求 Body：

无。

响应 Data：

无。

### 获取发票列表

- 方法：`GET`
- 路径：`/api/invoices`
- 认证：是
- Service：`profile.getInvoices`

请求 Query：

| 字段      | 类型                        | 必填 | 说明            | 示例 |
| --------- | --------------------------- | ---- | --------------- | ---- |
| status    | string \| number \| boolean | 否   | 0待开具,1已开具 | 1    |
| page      | string \| number \| boolean | 否   |                 | 1    |
| page_size | string \| number \| boolean | 否   |                 | 10   |

请求 Body：

无。

响应 Data：

无。

### 文件上传

- 方法：`POST`
- 路径：`/api/upload`
- 认证：是
- Service：`profile.uploadFileRecord`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取客服配置

- 方法：`GET`
- 路径：`/api/customer-service/config`
- 认证：否
- Service：`profile.getCustomerServiceConfig`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取关于平台信息

- 方法：`GET`
- 路径：`/api/about`
- 认证：否
- Service：`profile.getAbout`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取会员等级权益配置

- 方法：`GET`
- 路径：`/api/user/vip/level-perks`
- 认证：否
- Service：`profile.getVipLevelPerks`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

## 订单

### 获取订单详情

- 方法：`GET`
- 路径：`/api/order/detail`
- 认证：是
- Service：`order.getOrderDetail`

请求 Query：

| 字段     | 类型                        | 必填 | 说明     | 示例                       |
| -------- | --------------------------- | ---- | -------- | -------------------------- |
| order_no | string \| number \| boolean | 是   | 订单编号 | XS202606191234560001234567 |

请求 Body：

无。

响应 Data：

| 字段                 | 类型            | 必填 | 说明     | 示例 |
| -------------------- | --------------- | ---- | -------- | ---- |
| order_id             | number(integer) | 否   | 订单ID   |      |
| order_no             | string          | 否   | 订单编号 |      |
| user_id              | number(integer) | 否   | 用户ID   |      |
| total_amount         | string          | 否   | 总金额   |      |
| discount_amount      | string          | 否   | 优惠金额 |      |
| pay_amount           | string          | 否   | 实付金额 |      |
| status               | number(integer) | 否   | 状态     |      |
| status_text          | string          | 否   | 状态文字 |      |
| pay_method           | integer \| null | 否   | 支付方式 |      |
| pay_time             | string \| null  | 否   | 支付时间 |      |
| remark               | string          | 否   | 备注     |      |
| items                | array<object>   | 否   |          |      |
| items[].product_id   | number(integer) | 否   | 商品ID   |      |
| items[].product_name | string          | 否   | 商品名称 |      |
| items[].spec_name    | string          | 否   | 规格名称 |      |
| items[].price        | string          | 否   | 单价     |      |
| items[].quantity     | number(integer) | 否   | 数量     |      |
| items[].subtotal     | string          | 否   | 小计     |      |
| created_at           | string          | 否   | 创建时间 |      |

### 发起支付

- 方法：`POST`
- 路径：`/api/order/pay`
- 认证：是
- Service：`order.payOrder`

请求 Query：

无。

请求 Body：

| 字段       | 类型            | 必填 | 说明                | 示例 |
| ---------- | --------------- | ---- | ------------------- | ---- |
| order_no   | string          | 否   | 订单编号            |      |
| pay_method | number(integer) | 否   | 支付方式(1微信支付) |      |

响应 Data：

| 字段                 | 类型            | 必填 | 说明     | 示例 |
| -------------------- | --------------- | ---- | -------- | ---- |
| order_no             | string          | 否   | 订单编号 |      |
| pay_method           | number(integer) | 否   | 支付方式 |      |
| pay_params           | object          | 否   |          |      |
| pay_params.timeStamp | string          | 否   |          |      |
| pay_params.nonceStr  | string          | 否   |          |      |
| pay_params.package   | string          | 否   |          |      |
| pay_params.signType  | string          | 否   |          |      |
| pay_params.paySign   | string          | 否   |          |      |

### 取消订单

- 方法：`POST`
- 路径：`/api/order/cancel`
- 认证：是
- Service：`order.cancelOrder`

请求 Query：

无。

请求 Body：

| 字段          | 类型   | 必填 | 说明     | 示例 |
| ------------- | ------ | ---- | -------- | ---- |
| order_no      | string | 否   | 订单编号 |      |
| cancel_reason | string | 否   | 取消原因 |      |

响应 Data：

无。

### 微信支付回调（内部接口）

- 方法：`POST`
- 路径：`/api/payment/callback`
- 认证：否
- Service：`order.paymentCallback`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

## 学习中心

### 获取课程分类列表

- 方法：`GET`
- 路径：`/api/course/categories`
- 认证：否
- Service：`learning.getCourseCategories`

请求 Query：

无。

请求 Body：

无。

响应 Data：

无。

### 获取课程列表

- 方法：`GET`
- 路径：`/api/courses`
- 认证：否
- Service：`learning.getCourses`

请求 Query：

| 字段        | 类型                        | 必填 | 说明                                          | 示例    |
| ----------- | --------------------------- | ---- | --------------------------------------------- | ------- |
| category_id | string \| number \| boolean | 否   | 分类ID                                        | 1       |
| course_type | string \| number \| boolean | 否   | 1直播,2录播,3训练营,4考证类,5线下活动         | 0       |
| keyword     | string \| number \| boolean | 否   | 关键字搜索                                    | 代账    |
| sort        | string \| number \| boolean | 否   | 排序(default/hot/price_asc/price_desc/newest) | default |
| page        | string \| number \| boolean | 否   | 页码                                          | 1       |
| page_size   | string \| number \| boolean | 否   | 每页条数                                      | 10      |

请求 Body：

无。

响应 Data：

| 字段                    | 类型            | 必填 | 说明                                        | 示例 |
| ----------------------- | --------------- | ---- | ------------------------------------------- | ---- |
| total                   | number(integer) | 否   | 总数                                        | 42   |
| page                    | number(integer) | 否   | 当前页码                                    | 1    |
| page_size               | number(integer) | 否   | 每页条数                                    | 10   |
| total_page              | number(integer) | 否   | 总页数                                      | 5    |
| list                    | array<object>   | 否   | 课程列表                                    |      |
| list[].id               | number(integer) | 否   | 课程ID                                      |      |
| list[].title            | string          | 否   | 课程标题                                    |      |
| list[].description      | string          | 否   | 课程简介                                    |      |
| list[].thumbnail        | string          | 否   | 封面图URL                                   |      |
| list[].course_type      | number(integer) | 否   | 类型(1直播,2录播,3训练营,4考证类,5线下活动) |      |
| list[].course_type_text | string          | 否   | 类型文字                                    |      |
| list[].teacher_name     | string          | 否   | 讲师姓名                                    |      |
| list[].teacher_avatar   | string          | 否   | 讲师头像                                    |      |
| list[].price            | string          | 否   | 价格                                        |      |
| list[].original_price   | string \| null  | 否   | 原价                                        |      |
| list[].student_count    | number(integer) | 否   | 报名人数                                    |      |
| list[].is_live          | number(integer) | 否   | 是否直播中(0否,1是)                         |      |
| list[].live_start_time  | string \| null  | 否   | 直播开始时间                                |      |
| list[].total_duration   | number(integer) | 否   | 总时长(秒)                                  |      |
| list[].section_count    | number(integer) | 否   | 课时数                                      |      |
| list[].category_id      | number(integer) | 否   | 分类ID                                      |      |

### 获取课程详情

- 方法：`GET`
- 路径：`/api/course/detail`
- 认证：否
- Service：`learning.getCourseDetail`

请求 Query：

| 字段      | 类型                        | 必填 | 说明   | 示例 |
| --------- | --------------------------- | ---- | ------ | ---- |
| course_id | string \| number \| boolean | 是   | 课程ID | 1    |

请求 Body：

无。

响应 Data：

| 字段             | 类型            | 必填 | 说明                                        | 示例 |
| ---------------- | --------------- | ---- | ------------------------------------------- | ---- |
| id               | number(integer) | 否   | 课程ID                                      |      |
| title            | string          | 否   | 课程标题                                    |      |
| description      | string          | 否   | 课程简介                                    |      |
| detail           | string          | 否   | 课程详情(富文本)                            |      |
| thumbnail        | string          | 否   | 封面图URL                                   |      |
| course_type      | number(integer) | 否   | 类型(1直播,2录播,3训练营,4考证类,5线下活动) |      |
| course_type_text | string          | 否   | 类型文字                                    |      |
| teacher_name     | string          | 否   | 讲师姓名                                    |      |
| teacher_avatar   | string          | 否   | 讲师头像                                    |      |
| teacher_intro    | string          | 否   | 讲师简介                                    |      |
| price            | string          | 否   | 价格                                        |      |
| original_price   | string \| null  | 否   | 原价                                        |      |
| student_count    | number(integer) | 否   | 报名人数                                    |      |
| total_duration   | number(integer) | 否   | 总时长(秒)                                  |      |
| section_count    | number(integer) | 否   | 课时数                                      |      |
| is_live          | number(integer) | 否   | 是否直播中(0否,1是)                         |      |
| live_start_time  | string \| null  | 否   | 直播开始时间                                |      |
| is_bought        | boolean         | 否   | 当前用户是否已购买                          |      |
| category_id      | number(integer) | 否   | 分类ID                                      |      |

### 获取课程章节列表（需登录且已购买）

- 方法：`GET`
- 路径：`/api/course/sections`
- 认证：是
- Service：`learning.getCourseSections`

请求 Query：

| 字段      | 类型                        | 必填 | 说明   | 示例 |
| --------- | --------------------------- | ---- | ------ | ---- |
| course_id | string \| number \| boolean | 是   | 课程ID | 1    |

请求 Body：

无。

响应 Data：

无。

### 购买课程

- 方法：`POST`
- 路径：`/api/course/buy`
- 认证：是
- Service：`learning.buyCourse`

请求 Query：

无。

请求 Body：

| 字段      | 类型            | 必填 | 说明                     | 示例 |
| --------- | --------------- | ---- | ------------------------ | ---- |
| course_id | number(integer) | 否   | 课程ID                   |      |
| spec_id   | number(integer) | 否   | 规格ID(课程有规格时必传) |      |

响应 Data：

| 字段        | 类型            | 必填 | 说明                              | 示例 |
| ----------- | --------------- | ---- | --------------------------------- | ---- |
| order_id    | number(integer) | 否   | 订单ID                            |      |
| order_no    | string          | 否   | 订单编号                          |      |
| pay_amount  | string          | 否   | 支付金额                          |      |
| status      | number(integer) | 否   | 订单状态(0待支付,1待服务,2已完成) |      |
| status_text | string          | 否   | 状态文字                          |      |

### 我的课程列表

- 方法：`GET`
- 路径：`/api/user/courses`
- 认证：是
- Service：`learning.getUserCourses`

请求 Query：

| 字段         | 类型                        | 必填 | 说明                           | 示例 |
| ------------ | --------------------------- | ---- | ------------------------------ | ---- |
| is_completed | string \| number \| boolean | 否   | 筛选(0学习中,1已完成,不传全部) | 0    |
| page         | string \| number \| boolean | 否   | 页码                           | 1    |
| page_size    | string \| number \| boolean | 否   | 每页条数                       | 10   |

请求 Body：

无。

响应 Data：

| 字段                    | 类型            | 必填 | 说明                | 示例 |
| ----------------------- | --------------- | ---- | ------------------- | ---- |
| total                   | number(integer) | 否   | 总数                | 10   |
| page                    | number(integer) | 否   | 当前页码            | 1    |
| page_size               | number(integer) | 否   | 每页条数            | 10   |
| total_page              | number(integer) | 否   | 总页数              | 1    |
| list                    | array<object>   | 否   | 课程列表            |      |
| list[].course_id        | number(integer) | 否   | 课程ID              |      |
| list[].title            | string          | 否   | 课程标题            |      |
| list[].thumbnail        | string          | 否   | 封面图              |      |
| list[].teacher_name     | string          | 否   | 讲师姓名            |      |
| list[].progress         | number          | 否   | 学习进度百分比      |      |
| list[].total_duration   | number(integer) | 否   | 总时长(秒)          |      |
| list[].learned_duration | number(integer) | 否   | 已学习时长(秒)      |      |
| list[].is_completed     | number(integer) | 否   | 是否已完成(0否,1是) |      |
| list[].last_section_id  | number(integer) | 否   | 上次学习课时ID      |      |
| list[].expire_at        | string \| null  | 否   | 课程到期时间        |      |
| list[].bought_at        | string          | 否   | 购买时间            |      |

### 获取课程学习进度

- 方法：`GET`
- 路径：`/api/user/course/progress`
- 认证：是
- Service：`learning.getUserCourseProgress`

请求 Query：

| 字段      | 类型                        | 必填 | 说明   | 示例 |
| --------- | --------------------------- | ---- | ------ | ---- |
| course_id | string \| number \| boolean | 是   | 课程ID | 1    |

请求 Body：

无。

响应 Data：

| 字段                              | 类型            | 必填 | 说明             | 示例 |
| --------------------------------- | --------------- | ---- | ---------------- | ---- |
| course_id                         | number(integer) | 否   | 课程ID           |      |
| progress                          | number          | 否   | 总进度百分比     |      |
| total_learn_duration              | number(integer) | 否   | 总学习时长(秒)   |      |
| total_learn_duration_text         | string          | 否   | 总学习时长(文本) |      |
| is_completed                      | number(integer) | 否   | 是否已完成       |      |
| last_section_id                   | number(integer) | 否   | 上次学习课时ID   |      |
| sections_progress                 | array<object>   | 否   | 各章节进度列表   |      |
| sections_progress[].section_id    | number(integer) | 否   | 课时ID           |      |
| sections_progress[].progress      | number          | 否   | 课时进度百分比   |      |
| sections_progress[].is_completed  | boolean         | 否   | 是否已看完       |      |
| sections_progress[].last_position | number(integer) | 否   | 上次播放位置(秒) |      |

### 更新学习进度

- 方法：`POST`
- 路径：`/api/user/course/progress`
- 认证：是
- Service：`learning.updateUserCourseProgress`

请求 Query：

无。

请求 Body：

| 字段             | 类型            | 必填 | 说明              | 示例 |
| ---------------- | --------------- | ---- | ----------------- | ---- |
| course_id        | number(integer) | 否   | 课程ID            |      |
| section_id       | number(integer) | 否   | 课时ID            |      |
| watched_duration | number(integer) | 否   | 已观看时长(秒)    |      |
| last_position    | number(integer) | 否   | 上次播放位置(秒)  |      |
| is_completed     | number(integer) | 否   | 是否看完(0否,1是) |      |

响应 Data：

| 字段             | 类型   | 必填 | 说明             | 示例 |
| ---------------- | ------ | ---- | ---------------- | ---- |
| section_progress | number | 否   | 章节进度百分比   |      |
| course_progress  | number | 否   | 课程总进度百分比 |      |

### 获取线下活动列表

- 方法：`GET`
- 路径：`/api/events`
- 认证：否
- Service：`learning.getEvents`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                            | 示例 |
| --------- | --------------------------- | ---- | ------------------------------- | ---- |
| status    | string \| number \| boolean | 否   | 筛选(1报名中,2已满员,0或空全部) | 1    |
| page      | string \| number \| boolean | 否   | 页码                            | 1    |
| page_size | string \| number \| boolean | 否   | 每页条数                        | 10   |

请求 Body：

无。

响应 Data：

| 字段                    | 类型            | 必填 | 说明                          | 示例 |
| ----------------------- | --------------- | ---- | ----------------------------- | ---- |
| total                   | number(integer) | 否   | 总数                          | 5    |
| page                    | number(integer) | 否   | 当前页码                      | 1    |
| page_size               | number(integer) | 否   | 每页条数                      | 10   |
| total_page              | number(integer) | 否   | 总页数                        | 1    |
| list                    | array<object>   | 否   | 活动列表                      |      |
| list[].id               | number(integer) | 否   | 活动ID                        |      |
| list[].title            | string          | 否   | 活动标题                      |      |
| list[].cover_image      | string          | 否   | 封面图URL                     |      |
| list[].event_date       | string          | 否   | 活动日期                      |      |
| list[].start_time       | string          | 否   | 开始时间                      |      |
| list[].location         | string          | 否   | 活动地点                      |      |
| list[].city             | string          | 否   | 所在城市                      |      |
| list[].max_participants | integer \| null | 否   | 最大参与人数                  |      |
| list[].current_count    | number(integer) | 否   | 当前报名人数                  |      |
| list[].price            | string          | 否   | 报名费用                      |      |
| list[].status           | number(integer) | 否   | 状态(0已结束,1报名中,2已满员) |      |
| list[].status_text      | string          | 否   | 状态文字                      |      |

### 获取活动详情

- 方法：`GET`
- 路径：`/api/event/detail`
- 认证：否
- Service：`learning.getEventDetail`

请求 Query：

| 字段     | 类型                        | 必填 | 说明   | 示例 |
| -------- | --------------------------- | ---- | ------ | ---- |
| event_id | string \| number \| boolean | 是   | 活动ID | 1    |

请求 Body：

无。

响应 Data：

| 字段             | 类型            | 必填 | 说明                          | 示例 |
| ---------------- | --------------- | ---- | ----------------------------- | ---- |
| id               | number(integer) | 否   | 活动ID                        |      |
| title            | string          | 否   | 活动标题                      |      |
| description      | string          | 否   | 活动描述                      |      |
| cover_image      | string          | 否   | 封面图URL                     |      |
| event_date       | string          | 否   | 活动日期                      |      |
| start_time       | string          | 否   | 开始时间                      |      |
| end_time         | string \| null  | 否   | 结束时间                      |      |
| location         | string          | 否   | 活动地点                      |      |
| city             | string          | 否   | 所在城市                      |      |
| longitude        | number \| null  | 否   | 经度                          |      |
| latitude         | number \| null  | 否   | 纬度                          |      |
| max_participants | integer \| null | 否   | 最大参与人数                  |      |
| current_count    | number(integer) | 否   | 当前报名人数                  |      |
| price            | string          | 否   | 报名费用                      |      |
| status           | number(integer) | 否   | 状态(0已结束,1报名中,2已满员) |      |
| status_text      | string          | 否   | 状态文字                      |      |
| is_registered    | boolean         | 否   | 当前用户是否已报名            |      |

### 活动报名

- 方法：`POST`
- 路径：`/api/event/register`
- 认证：是
- Service：`learning.registerEvent`

请求 Query：

无。

请求 Body：

| 字段         | 类型            | 必填 | 说明     | 示例 |
| ------------ | --------------- | ---- | -------- | ---- |
| event_id     | number(integer) | 否   | 活动ID   |      |
| real_name    | string          | 否   | 报名姓名 |      |
| phone        | string          | 否   | 联系电话 |      |
| company_name | string          | 否   | 公司名称 |      |

响应 Data：

| 字段            | 类型            | 必填 | 说明                          | 示例     |
| --------------- | --------------- | ---- | ----------------------------- | -------- |
| status          | number(integer) | 否   | 状态(0待支付,1已报名,2已签到) | 0        |
| status_text     | string          | 否   | 状态文字                      | "待支付" |
| registration_id | integer \| null | 否   | 报名记录ID（免费活动时返回）  |          |
| event_title     | string \| null  | 否   | 活动标题（免费活动时返回）    |          |
| event_date      | string \| null  | 否   | 活动日期（免费活动时返回）    |          |
| order_id        | integer \| null | 否   | 订单ID（付费活动时返回）      |          |
| order_no        | string \| null  | 否   | 订单编号（付费活动时返回）    |          |
| pay_amount      | string \| null  | 否   | 支付金额（付费活动时返回）    |          |

### 获取学习统计数据

- 方法：`GET`
- 路径：`/api/user/learning/stats`
- 认证：是
- Service：`learning.getUserLearningStats`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段                      | 类型            | 必填 | 说明               | 示例 |
| ------------------------- | --------------- | ---- | ------------------ | ---- |
| week_learn_duration       | number(integer) | 否   | 本周学习时长(秒)   |      |
| week_learn_duration_text  | string          | 否   | 本周学习时长(文本) |      |
| week_target_duration      | number(integer) | 否   | 本周目标时长(秒)   |      |
| week_target_duration_text | string          | 否   | 本周目标时长(文本) |      |
| week_progress             | number          | 否   | 本周完成进度百分比 |      |
| total_courses             | number(integer) | 否   | 总课程数           |      |
| completed_courses         | number(integer) | 否   | 已完成课程数       |      |
| total_learn_duration      | number(integer) | 否   | 累计学习时长(秒)   |      |
| total_learn_duration_text | string          | 否   | 累计学习时长(文本) |      |
| certificates_count        | number(integer) | 否   | 获得证书数         |      |

## 商机对接(V2)

### 商机数据看板

- 方法：`GET`
- 路径：`/api/opportunities/stats`
- 认证：否
- Service：`opportunity.getOpportunityStats`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段              | 类型   | 必填 | 说明       | 示例      |
| ----------------- | ------ | ---- | ---------- | --------- |
| total_match_count | string | 否   | 累计对接量 | "1000+"   |
| total_revenue     | string | 否   | 促成营收   | "1000万+" |
| satisfaction_rate | string | 否   | 合作好评率 | "98%"     |

### 商机列表（展示中）

- 方法：`GET`
- 路径：`/api/opportunities`
- 认证：否
- Service：`opportunity.getOpportunities`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                                                        | 示例    |
| --------- | --------------------------- | ---- | ----------------------------------------------------------- | ------- |
| type      | string \| number \| boolean | 否   | 业务类型(1工商注册,2代账,3税筹,4股权,5资质,6知产,7会计工厂) | 0       |
| city      | string \| number \| boolean | 否   | 城市筛选                                                    |         |
| sort      | string \| number \| boolean | 否   | 排序(default/newest)                                        | default |
| page      | string \| number \| boolean | 否   | 页码                                                        | 1       |
| page_size | string \| number \| boolean | 否   | 每页数量(最大50)                                            | 10      |

请求 Body：

无。

响应 Data：

| 字段                   | 类型            | 必填 | 说明         | 示例 |
| ---------------------- | --------------- | ---- | ------------ | ---- |
| list                   | array<object>   | 否   |              |      |
| list[].id              | number(integer) | 否   | 商机ID       |      |
| list[].title           | string          | 否   | 商机标题     |      |
| list[].type            | number(integer) | 否   | 业务类型     |      |
| list[].type_text       | string          | 否   | 业务类型文字 |      |
| list[].city            | string          | 否   | 城市         |      |
| list[].tags            | array<string>   | 否   | 标签数组     |      |
| list[].apply_count     | number(integer) | 否   | 申请人数     |      |
| list[].is_confidential | number(integer) | 否   | 是否保密     |      |
| list[].time_ago        | string          | 否   | 发布时间     |      |
| list[].created_at      | string          | 否   | 创建时间     |      |
| total                  | number(integer) | 否   | 总数         |      |
| page                   | number(integer) | 否   | 当前页码     |      |
| page_size              | number(integer) | 否   | 每页数量     |      |
| total_page             | number(integer) | 否   | 总页数       |      |

### 发布商机（甩单）

- 方法：`POST`
- 路径：`/api/opportunities`
- 认证：否
- Service：`opportunity.createOpportunity`

请求 Query：

无。

请求 Body：

| 字段            | 类型            | 必填 | 说明                                                        | 示例 |
| --------------- | --------------- | ---- | ----------------------------------------------------------- | ---- |
| title           | string          | 否   | 商机标题                                                    |      |
| type            | number(integer) | 否   | 业务类型(1工商注册,2代账,3税筹,4股权,5资质,6知产,7会计工厂) |      |
| city            | string          | 否   | 客户城市                                                    |      |
| description     | string          | 否   | 需求描述                                                    |      |
| is_confidential | number(integer) | 否   | 是否保密联系方式                                            |      |

响应 Data：

| 字段           | 类型            | 必填 | 说明          | 示例     |
| -------------- | --------------- | ---- | ------------- | -------- |
| opportunity_id | number(integer) | 否   | 商机ID        |          |
| status         | number(integer) | 否   | 状态(1待审核) | 1        |
| status_text    | string          | 否   | 状态文字      | "待审核" |

### 商机详情

- 方法：`GET`
- 路径：`/api/opportunity/detail`
- 认证：否
- Service：`opportunity.getOpportunityDetail`

请求 Query：

| 字段           | 类型                        | 必填 | 说明   | 示例 |
| -------------- | --------------------------- | ---- | ------ | ---- |
| opportunity_id | string \| number \| boolean | 是   | 商机ID | 1    |

请求 Body：

无。

响应 Data：

| 字段                   | 类型            | 必填 | 说明                                          | 示例 |
| ---------------------- | --------------- | ---- | --------------------------------------------- | ---- |
| id                     | number(integer) | 否   | 商机ID                                        |      |
| title                  | string          | 否   | 商机标题                                      |      |
| type                   | number(integer) | 否   | 业务类型                                      |      |
| type_text              | string          | 否   | 类型文字                                      |      |
| city                   | string          | 否   | 城市                                          |      |
| description            | string          | 否   | 需求描述                                      |      |
| is_confidential        | number(integer) | 否   | 是否保密                                      |      |
| tags                   | array<string>   | 否   | 标签                                          |      |
| status                 | number(integer) | 否   | 状态(1待审核,2展示中,3撮合中,4已完成,5已关闭) |      |
| status_text            | string          | 否   | 状态文字                                      |      |
| publisher              | object          | 否   |                                               |      |
| publisher.user_id      | number(integer) | 否   |                                               |      |
| publisher.nickname     | string          | 否   |                                               |      |
| publisher.company_name | string          | 否   |                                               |      |
| view_count             | number(integer) | 否   | 浏览次数                                      |      |
| apply_count            | number(integer) | 否   | 申请次数                                      |      |
| is_owner               | boolean         | 否   | 是否发布者                                    |      |
| expired_at             | string \| null  | 否   | 过期时间                                      |      |
| created_at             | string          | 否   | 创建时间                                      |      |

### 申请接单

- 方法：`POST`
- 路径：`/api/opportunity/apply`
- 认证：否
- Service：`opportunity.applyOpportunity`

请求 Query：

无。

请求 Body：

| 字段           | 类型            | 必填 | 说明                                | 示例 |
| -------------- | --------------- | ---- | ----------------------------------- | ---- |
| opportunity_id | number(integer) | 否   | 商机ID                              |      |
| reason         | string          | 否   | 接单优势说明                        |      |
| quote_type     | number(integer) | 否   | 报价方式(0详谈后报价,1提供具体报价) |      |
| quote_price    | number          | 否   | 具体报价金额                        |      |
| attachment_url | string          | 否   | 案例资料附件URL                     |      |

响应 Data：

| 字段           | 类型            | 必填 | 说明          | 示例 |
| -------------- | --------------- | ---- | ------------- | ---- |
| application_id | number(integer) | 否   | 申请ID        |      |
| status         | number(integer) | 否   | 状态(1待审核) |      |
| status_text    | string          | 否   | 状态文字      |      |

### 我发布的商机

- 方法：`GET`
- 路径：`/api/opportunities/mine`
- 认证：否
- Service：`opportunity.getMyOpportunities`

请求 Query：

| 字段      | 类型                        | 必填 | 说明                                              | 示例 |
| --------- | --------------------------- | ---- | ------------------------------------------------- | ---- |
| status    | string \| number \| boolean | 否   | 状态筛选(1待审核,2展示中,3撮合中,4已完成,5已关闭) | 0    |
| page      | string \| number \| boolean | 否   | 页码                                              | 1    |
| page_size | string \| number \| boolean | 否   | 每页数量(最大50)                                  | 10   |

请求 Body：

无。

响应 Data：

| 字段               | 类型            | 必填 | 说明 | 示例 |
| ------------------ | --------------- | ---- | ---- | ---- |
| list               | array<object>   | 否   |      |      |
| list[].id          | number(integer) | 否   |      |      |
| list[].title       | string          | 否   |      |      |
| list[].type        | number(integer) | 否   |      |      |
| list[].type_text   | string          | 否   |      |      |
| list[].city        | string          | 否   |      |      |
| list[].status      | number(integer) | 否   |      |      |
| list[].status_text | string          | 否   |      |      |
| list[].apply_count | number(integer) | 否   |      |      |
| list[].view_count  | number(integer) | 否   |      |      |
| list[].created_at  | string          | 否   |      |      |
| total              | number(integer) | 否   |      |      |
| page               | number(integer) | 否   |      |      |
| page_size          | number(integer) | 否   |      |      |
| total_page         | number(integer) | 否   |      |      |

### 我收到的接单申请（发布者查看）

- 方法：`GET`
- 路径：`/api/opportunity/applications`
- 认证：否
- Service：`opportunity.getOpportunityApplications`

请求 Query：

| 字段           | 类型                        | 必填 | 说明   | 示例 |
| -------------- | --------------------------- | ---- | ------ | ---- |
| opportunity_id | string \| number \| boolean | 是   | 商机ID | 1    |

请求 Body：

无。

响应 Data：

| 字段                  | 类型            | 必填 | 说明 | 示例 |
| --------------------- | --------------- | ---- | ---- | ---- |
| list                  | array<object>   | 否   |      |      |
| list[].application_id | number(integer) | 否   |      |      |
| list[].user_id        | number(integer) | 否   |      |      |
| list[].nickname       | string          | 否   |      |      |
| list[].company_name   | string          | 否   |      |      |
| list[].reason         | string          | 否   |      |      |
| list[].quote_type     | number(integer) | 否   |      |      |
| list[].quote_price    | string \| null  | 否   |      |      |
| list[].attachment_url | string          | 否   |      |      |
| list[].status         | number(integer) | 否   |      |      |
| list[].status_text    | string          | 否   |      |      |
| list[].created_at     | string          | 否   |      |      |
| total                 | number(integer) | 否   |      |      |

### 我的申请记录（申请人查看）

- 方法：`GET`
- 路径：`/api/user/applications`
- 认证：否
- Service：`opportunity.getUserApplications`

请求 Query：

| 字段      | 类型                        | 必填 | 说明             | 示例 |
| --------- | --------------------------- | ---- | ---------------- | ---- |
| page      | string \| number \| boolean | 否   | 页码             | 1    |
| page_size | string \| number \| boolean | 否   | 每页数量(最大50) | 10   |

请求 Body：

无。

响应 Data：

| 字段                     | 类型            | 必填 | 说明 | 示例 |
| ------------------------ | --------------- | ---- | ---- | ---- |
| list                     | array<object>   | 否   |      |      |
| list[].application_id    | number(integer) | 否   |      |      |
| list[].opportunity_id    | number(integer) | 否   |      |      |
| list[].opportunity_title | string          | 否   |      |      |
| list[].type_text         | string          | 否   |      |      |
| list[].city              | string          | 否   |      |      |
| list[].status            | number(integer) | 否   |      |      |
| list[].status_text       | string          | 否   |      |      |
| list[].created_at        | string          | 否   |      |      |
| total                    | number(integer) | 否   |      |      |
| page                     | number(integer) | 否   |      |      |
| page_size                | number(integer) | 否   |      |      |
| total_page               | number(integer) | 否   |      |      |

### 关闭商机

- 方法：`POST`
- 路径：`/api/opportunity/status`
- 认证：否
- Service：`opportunity.updateOpportunityStatus`

请求 Query：

无。

请求 Body：

| 字段           | 类型            | 必填 | 说明             | 示例 |
| -------------- | --------------- | ---- | ---------------- | ---- |
| opportunity_id | number(integer) | 否   | 商机ID           |      |
| status         | number(integer) | 否   | 目标状态(5-关闭) | 5    |

响应 Data：

无。

### 获取企业档案

- 方法：`GET`
- 路径：`/api/companies/profile`
- 认证：否
- Service：`opportunity.getCompanyProfile`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段            | 类型            | 必填 | 说明             | 示例 |
| --------------- | --------------- | ---- | ---------------- | ---- |
| id              | number(integer) | 否   | 企业ID           |      |
| name            | string          | 否   | 企业全称         |      |
| credit_code     | string          | 否   | 统一社会信用代码 |      |
| city            | string          | 否   | 注册城市         |      |
| team_size       | integer \| null | 否   | 团队人数         |      |
| client_count    | integer \| null | 否   | 服务客户数       |      |
| business_scope  | string          | 否   | 擅长业务         |      |
| service_cities  | string          | 否   | 可承接服务城市   |      |
| is_cross_region | number(integer) | 否   | 是否可跨区域     |      |
| cert_status     | number(integer) | 否   | 认证状态         |      |

### 创建/更新企业档案

- 方法：`POST`
- 路径：`/api/companies/profile`
- 认证：否
- Service：`opportunity.saveCompanyProfile`

请求 Query：

无。

请求 Body：

| 字段            | 类型            | 必填 | 说明                  | 示例 |
| --------------- | --------------- | ---- | --------------------- | ---- |
| name            | string          | 否   | 企业全称              |      |
| credit_code     | string          | 否   | 统一社会信用代码      |      |
| city            | string          | 否   | 注册城市              |      |
| team_size       | number(integer) | 否   | 团队人数              |      |
| client_count    | number(integer) | 否   | 服务客户数            |      |
| business_scope  | string          | 否   | 擅长业务(逗号分隔)    |      |
| service_cities  | string          | 否   | 可承接服务城市        |      |
| is_cross_region | number(integer) | 否   | 是否可跨区域(0否,1是) |      |

响应 Data：

| 字段   | 类型            | 必填 | 说明     | 示例 |
| ------ | --------------- | ---- | -------- | ---- |
| id     | number(integer) | 否   | 企业ID   |      |
| is_new | boolean         | 否   | 是否新建 |      |

## 服务商城

### 获取商品分类列表

- 方法：`GET`
- 路径：`/api/product/categories`
- 认证：否
- Service：`product.getProductCategories`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段              | 类型            | 必填 | 说明     | 示例 |
| ----------------- | --------------- | ---- | -------- | ---- |
| list              | array<object>   | 否   |          |      |
| list[].id         | number(integer) | 否   | 分类ID   |      |
| list[].name       | string          | 否   | 分类名称 |      |
| list[].icon       | string          | 否   | 分类图标 |      |
| list[].sort_order | number(integer) | 否   | 排序     |      |

### 获取商品列表

- 方法：`GET`
- 路径：`/api/products`
- 认证：否
- Service：`product.getProducts`

请求 Query：

| 字段         | 类型                        | 必填 | 说明                                     | 示例    |
| ------------ | --------------------------- | ---- | ---------------------------------------- | ------- |
| category_id  | string \| number \| boolean | 否   | 分类ID                                   | 1       |
| product_type | string \| number \| boolean | 否   | 类型(1工具,2课程,3咨询,4认证)            | 0       |
| keyword      | string \| number \| boolean | 否   | 搜索关键词                               | 发票    |
| sort         | string \| number \| boolean | 否   | 排序(default/sales/price_asc/price_desc) | default |
| page         | string \| number \| boolean | 否   | 页码                                     | 1       |
| page_size    | string \| number \| boolean | 否   | 每页数量                                 | 10      |

请求 Body：

无。

响应 Data：

| 字段                     | 类型            | 必填 | 说明         | 示例 |
| ------------------------ | --------------- | ---- | ------------ | ---- |
| list                     | array<object>   | 否   |              |      |
| list[].id                | number(integer) | 否   | 商品ID       |      |
| list[].category_id       | number(integer) | 否   | 分类ID       |      |
| list[].name              | string          | 否   | 商品名称     |      |
| list[].description       | string          | 否   | 商品描述     |      |
| list[].thumbnail         | string          | 否   | 缩略图       |      |
| list[].product_type      | number(integer) | 否   | 商品类型     |      |
| list[].product_type_text | string          | 否   | 商品类型文字 |      |
| list[].price             | string          | 否   | 价格         |      |
| list[].original_price    | string \| null  | 否   | 原价         |      |
| list[].vip_price         | string \| null  | 否   | 会员价       |      |
| list[].price_unit        | string          | 否   | 价格单位     |      |
| list[].sales_count       | number(integer) | 否   | 销量         |      |
| list[].has_spec          | boolean         | 否   | 是否有规格   |      |
| total                    | number(integer) | 否   | 总数         |      |
| page                     | number(integer) | 否   | 页码         |      |
| page_size                | number(integer) | 否   | 每页数量     |      |
| total_page               | number(integer) | 否   | 总页数       |      |

### 获取商品详情

- 方法：`GET`
- 路径：`/api/product/detail`
- 认证：否
- Service：`product.getProductDetail`

请求 Query：

| 字段       | 类型                        | 必填 | 说明   | 示例 |
| ---------- | --------------------------- | ---- | ------ | ---- |
| product_id | string \| number \| boolean | 是   | 商品ID | 1    |

请求 Body：

无。

响应 Data：

| 字段                   | 类型            | 必填 | 说明       | 示例 |
| ---------------------- | --------------- | ---- | ---------- | ---- |
| id                     | number(integer) | 否   | 商品ID     |      |
| category_id            | number(integer) | 否   | 分类ID     |      |
| name                   | string          | 否   | 商品名称   |      |
| description            | string          | 否   | 商品描述   |      |
| detail                 | string          | 否   | 商品详情   |      |
| thumbnail              | string          | 否   | 缩略图     |      |
| images                 | array<string>   | 否   | 图片列表   |      |
| product_type           | number(integer) | 否   | 商品类型   |      |
| product_type_text      | string          | 否   | 类型文字   |      |
| price                  | string          | 否   | 价格       |      |
| original_price         | string \| null  | 否   | 原价       |      |
| vip_price              | string \| null  | 否   | 会员价     |      |
| price_unit             | string          | 否   | 价格单位   |      |
| sales_count            | number(integer) | 否   | 销量       |      |
| view_count             | number(integer) | 否   | 浏览量     |      |
| specs                  | array<object>   | 否   |            |      |
| specs[].id             | number(integer) | 否   | 规格ID     |      |
| specs[].spec_name      | string          | 否   | 规格名称   |      |
| specs[].price          | string          | 否   | 价格       |      |
| specs[].original_price | string \| null  | 否   | 原价       |      |
| specs[].vip_price      | string \| null  | 否   | 会员价     |      |
| specs[].price_unit     | string          | 否   | 价格单位   |      |
| specs[].duration_days  | integer \| null | 否   | 有效期天数 |      |

### 购买商品/提交订单

- 方法：`POST`
- 路径：`/api/product/order`
- 认证：否
- Service：`product.createProductOrder`

请求 Query：

无。

请求 Body：

| 字段               | 类型            | 必填 | 说明   | 示例 |
| ------------------ | --------------- | ---- | ------ | ---- |
| items              | array<object>   | 否   |        |      |
| items[].product_id | number(integer) | 否   | 商品ID |      |
| items[].spec_id    | number(integer) | 否   | 规格ID |      |
| items[].quantity   | number(integer) | 否   | 数量   |      |
| remark             | string          | 否   | 备注   |      |

响应 Data：

| 字段                 | 类型            | 必填 | 说明         | 示例 |
| -------------------- | --------------- | ---- | ------------ | ---- |
| order_id             | number(integer) | 否   | 订单ID       |      |
| order_no             | string          | 否   | 订单编号     |      |
| total_amount         | string          | 否   | 订单总金额   |      |
| discount_amount      | string          | 否   | 优惠金额     |      |
| pay_amount           | string          | 否   | 实付金额     |      |
| status               | number(integer) | 否   | 状态         |      |
| status_text          | string          | 否   | 状态文字     |      |
| items                | array<object>   | 否   |              |      |
| items[].product_id   | number(integer) | 否   | 商品ID       |      |
| items[].product_name | string          | 否   | 商品名称     |      |
| items[].spec_name    | string          | 否   | 规格名称     |      |
| items[].price        | string          | 否   | 单价         |      |
| items[].quantity     | number(integer) | 否   | 数量         |      |
| items[].subtotal     | string          | 否   | 小计         |      |
| expire_at            | string          | 否   | 支付过期时间 |      |

## 消息

### 获取未读消息数

- 方法：`GET`
- 路径：`/api/user/messages/unread-count`
- 认证：否
- Service：`message.getUnreadMessageCount`

请求 Query：

无。

请求 Body：

无。

响应 Data：

| 字段         | 类型            | 必填 | 说明         | 示例 |
| ------------ | --------------- | ---- | ------------ | ---- |
| unread_count | number(integer) | 否   | 未读消息数量 | 3    |
