# 轻井泽国际艺术村

官网：https://karuizawa.art

版权归属：轻井泽国际艺术中心（筹）。别墅图片为 AI 概念图，非实际场地实拍。

## 功能

- 简体中文、日文、英文、繁体中文；首次访问匹配系统语言，记忆手动选择。
- 四季别墅轮播；年度驻留目标 30–50 位，首批招募 100 位艺术家。
- 艺术家、赞助合作、别墅及空间意向登记；赞助商网址自动补全协议。
- 空间图片包括外观和内部设施，各至少一张，合计不超过 30MB。
- 日本时间的今日和累计浏览量；不存储访客 IP 或身份。
- 管理员邮箱和密码登录，8 小时会话；申请和图片逐次鉴权；申请邮箱可点击发信。
- 通知队列保留待发送记录。未配置 HTTPS 邮件中继时不会自动发邮件，后台显示实际状态。

## Docker 部署

运行时为 Next.js / Node.js 24，SQLite 保存申请与计数，磁盘保存私有图片。原 Sites 项目配置仅保留历史标识；当前代码使用独立服务器运行时，旧 Vinext / Workers 发布命令不适用于此版本。GitHub 推送不会自动部署。

服务器目录 `/home/dev2/apps/karuizawa-art`，监听 `127.0.0.1:12002`，由现有反向代理提供 HTTPS。

1. 将源码上传到项目目录，排除 `.git`、`node_modules`、`data`、`deploy/private`、`.env*`。
2. 复制 `.env.example` 为服务器 `.env.production`，设置正式域名、管理员邮箱和凭据。可运行 `node deploy/create-admin.mjs admin@example.com` 生成凭据文件，再安全合并至环境配置；不要提交或公开凭据。
3. 创建 `data` 目录并设为容器用户 UID 1000 所有，权限 700；`.env.production` 权限 600。
4. 执行 `docker compose up -d --build`，使用 `docker compose ps` 和 `/api/health` 验证健康状态。

`data/karuizawa.sqlite` 及其 WAL 文件、`data/photos/` 必须持久保存。重建容器不会清除这些数据。应用启动时自动执行 `drizzle/` 和 `deploy/migrations/` 中尚未执行的迁移；已发布迁移不得改写。

生产登录入口 `/manage/login`，管理列表 `/manage/applications`。密码为带盐 scrypt 哈希，会话签名密钥至少 32 字符。连续五次失败后暂停登录十五分钟；轮换 SESSION_SECRET 可使已有会话失效。代理不得缓存管理页面或私有图片。

## 备份和恢复

使用 `node deploy/backup.mjs` 在容器内生成一致的 SQLite 备份，同时复制私有图片；备份输出路径可用 BACKUP_DIR 指定。备份和原数据库一样包含私人申请，应限制权限并另存到受控位置。恢复前停止应用，恢复数据库与对应图片，再启动服务；保留环境配置中的密钥。

Sites 数据导入脚本 `deploy/import-data.mjs <export.json> <database>` 保留已有申请，计数取较大值；只接受已知表及字段，不覆盖现有记录。导入应在切换流量前执行。

## 开发与验证

Node.js 24，`npm ci`，配置环境后 `npm run dev:docker`；生产构建 `npm run build:docker`。本地 HTTP 下 Secure 管理员 cookie 不适用于常规浏览器登录，完整登录测试请使用 HTTPS 或隔离测试脚本。

`deploy/smoke-test.mjs` 默认为隔离测试服务，验证表单、图片权限、计数和登录；从 `deploy/private/admin-access.txt` 读取测试凭据。对生产检查必须设置 `READ_ONLY=1 TEST_URL=...`。禁止对正式环境运行写入测试。
