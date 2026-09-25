# 轻井泽国际艺术村

官网：https://www.karuizawa.art

版权归属：轻井泽国际艺术中心（筹）。网站中的别墅图片为 AI 概念图，非实际场地实拍。

## 当前功能

- 首页及三类申请表支持简体中文、日文、英文和繁体中文；语言选择会记忆，并通过 `?lang=zh-Hans`、`?lang=ja`、`?lang=en`、`?lang=zh-Hant` 分享。

- 四座不同别墅的春夏秋冬首页轮播，支持自动播放、切换和暂停。
- 艺术家、赞助合作、别墅及空间三类申请；年度驻留目标 30–50 位，首批招募 100 位艺术家。
- 赞助商网站自动补全 `http://`，同时支持粘贴完整 HTTPS 网址。
- 空间申请填写地址，上传外观和内部设施图片，各至少一张，全部图片合计不超过 30MB。
- 申请保存在 D1，图片保存在私有 R2；带校验、申请编号与重复提交保护。
- 独立管理入口 `/manage/applications`，不在官网公开导航中展示。通过 ChatGPT 登录与服务端管理员名单验证身份，申请图片也受访问控制。
- 邮件通知队列已实现；持续在线的 HTTPS 发信服务尚未接入，自动即时通知尚未启用。待发送通知保存在数据库中。

## 技术与运行

使用 React、TypeScript、Vinext、Cloudflare D1 / R2。依赖版本以 `package-lock.json` 为准。

```sh
npm ci
cp .env.example .env
npm run dev
```

本地开发使用 Sites 提供的模拟登录，仅用于开发。可在本地 `.env` 中将 `ADMIN_EMAILS` 设置为 `seedy@sites.test` 以测试管理页面。生产环境必须使用真实管理员邮箱，不能使用本地模拟身份。

构建：`npm run build`。本项目依赖 Cloudflare Workers 运行时及 Sites 登录网关，不是可直接用 GitHub Pages 托管的纯静态网站。

数据库定义在 `db/schema.ts`，迁移在 `drizzle/`。本地测试表单前需应用迁移；已发布的迁移不得改写。

## 托管与环境配置

`.openai/hosting.json` 保留现有 Sites 项目标识与 `DB`、`BUCKET` 逻辑绑定。使用 Sites 工作流发布到原站点，避免重复创建站点。提交到本 GitHub 仓库不会自动部署官网。

| 变量 | 用途 |
| --- | --- |
| `ADMIN_EMAILS` | 允许查看申请的 ChatGPT 登录邮箱，多个邮箱以逗号分隔 |
| `NOTIFY_TO` | 接收申请通知的邮箱 |
| `SITE_ORIGIN` | 正式 HTTPS 网站地址，用于生成受保护的申请链接 |
| `MAIL_RELAY_URL` | 持续在线的 HTTPS 邮件中转地址，尚未接入 |
| `MAIL_RELAY_TOKEN` | 中转认证密钥，必须作为生产秘密保存 |

邮件中转接收带 Bearer 认证及 `Idempotency-Key` 的 JSON POST，字段为 `messageId`、`to`、`subject`、`text`；确认接收后返回 `{ "accepted": true }`。中转服务必须验证认证、限制收件地址并实现幂等处理。邮箱 SMTP 凭据仅由中转服务安全保存，不应写入仓库。

Sites 托管环境不能直接连接 SMTP，需通过 HTTPS 邮件 API 或中转服务发信。通知失败不会阻断申请保存；已配置中转后，管理页面可重试待发送通知。

## 数据与安全

- 仓库不包含申请人数据、上传图片、数据库文件、生产环境变量或邮箱密码。
- 生产配置通过 Sites 环境设置管理；本地 `.env` 不提交。
- 管理页面及图片接口按请求验证管理员身份，并设置不缓存、不收录等响应头。
- 公开网站的访问模式与管理页面授权互相独立。
