# Digital Oracle 服务器部署

## 当前实际部署（2026-10-02）

目标：阿里云北京实例 `i-2ze8ug5ftv6n9pb2z6yy`，公网 IP `123.57.144.99`，Ubuntu 22.04，2 vCPU / 2 GiB。Docker Hub 连接超时，因此本次实际采用 **Node.js + systemd + Nginx**。下面的 Docker 方案仅作为替代方案保留，未实际运行。

- Node.js：官方 v22.23.3 Linux x64 包，SHA256 校验通过，安装于 `/opt/node-v22.23.3-linux-x64`。
- 源代码版本目录：`/opt/digital-oracle/releases/20261002`；当前符号链接：`/opt/digital-oracle/current`。
- 运行账号：`oracle`，systemd 单元：`/etc/systemd/system/digital-oracle.service`，已启用开机自启和失败重启。
- 数据库：`/var/lib/digital-oracle/oracle.db`，独立于代码目录。
- 模型环境变量：`/etc/digital-oracle.env`（root 专用权限），当前 API Key 为空，实际抽牌 provider 为 `mock`。
- Nginx 配置：`/etc/nginx/conf.d/digital-oracle.conf`；80 端口代理至本机 `127.0.0.1:3000`。仓库对应文件为 `deploy/nginx-native.conf`。
- 域名 `oracle.digitaloracle.asia` 仍使用原 Cloudflare 解析，未切换；ICP备案及阿里云接入状态未确认，HTTPS 尚未配置。
- 经用户明确确认，安全组 `sg-2ze28bh30zu9m8pbw2ti` 已新增 TCP `80/80`、来源 `0.0.0.0/0` 的入站规则，规则 ID `sgr-2zegnqenh9ywzhfo0zv7`。原有规则保留，应用 3000 端口只监听本机。

验证结果：Linux 生产构建完成；Nginx 配置校验通过；systemd 与 Nginx 均 active；服务器内首页、`/cards`、`/draw`、`/meditation`、`/api/cards` 均返回 200；牌库含 78 张牌；测试抽牌返回 200（模拟解读）；POST `/api/cards` 返回 403；服务重启后仍有 78 张牌。构建提示无法解析的中文文件名图片已通过服务器 HTTP 验证（200）。

公网地址：`http://123.57.144.99`。本机不经代理直接请求该地址，首页、牌库 API、冥想页均 200，返回 78 张牌；首页引用的 6 个 JS/CSS 资源全部 200；公网抽牌返回 1 张牌及模拟解读；公网 POST `/api/cards` 返回 403。浏览器自动读取页面超时，本轮未完成浏览器交互/视觉验收。真实 AI 调用和域名 HTTPS 尚未验收。

运维命令（服务器）：

```sh
systemctl status digital-oracle nginx
journalctl -u digital-oracle -n 100 --no-pager
systemctl restart digital-oracle
curl --fail -H 'Host: oracle.digitaloracle.asia' http://127.0.0.1/api/cards
```

真实模型接入：已部署旧版本支持 `/etc/digital-oracle.env` 中的 `NUXT_SILICONFLOW_API_KEY`。发布新的通道抽象版本后，可统一使用 `NUXT_AI_*` 配置，参见 [AI 通道说明](ai-channels.md)，旧变量仍兼容。修改后重启服务，并用非敏感测试问题核对返回来源。不要把 API Key 写入仓库或前端。

备份数据库：`sqlite3 /var/lib/digital-oracle/oracle.db ".backup '/已存在的备份目录/oracle.db'"`（需安装 sqlite3），或在短暂停止 `digital-oracle` 服务后复制数据库并重新启动。更新使用新版本目录、重新构建、切换 `current`，保留旧版本和数据库备份以便回退；不要覆盖或删除持久数据目录。

## Docker 替代方案（未运行验证）

适用于安装了 Docker Engine 和 Compose v2 的 Linux 服务器。

本地验证（2026-10-02）：Nuxt 生产构建通过；Compose YAML 解析与端口隔离检查通过；启动脚本语法检查通过。本机没有 Docker，尚未实际构建 Linux 镜像或验证 Nginx 配置。现有构建仍提示 vue-router/volar 插件路径和一处图片路径无法在构建时解析，上线验收需检查对应图片。

## 构建与启动

将当前工作区源文件上传到独立目录，例如 `/opt/digital-oracle`。不要上传本地 `.env`、`node_modules`、`.output`、`.git` 或 `prisma/dev.db`。Windows 的 Prisma 引擎不能直接当作 Linux 运行包；Docker 会重新生成 Linux 引擎。

```sh
cd /opt/digital-oracle
cp deploy/.env.production.example .env.production
chmod 600 .env.production
# 按需编辑 .env.production，填写服务端模型密钥；留空使用明确标注的模拟解读。
docker compose --env-file .env.production up -d --build
docker compose ps
docker compose logs --tail=100 app
curl --fail http://127.0.0.1:8080/api/cards
```

构建固定使用 pnpm 9.14.4 和仓库锁文件。启动先执行 `prisma migrate deploy`，空牌库自动初始化 78 张牌，已有牌库不会被 seed 覆盖。数据库放在 Compose 命名卷 `oracle-data`，重建容器保留数据。首次构建需要访问 npm、Debian、Prisma 引擎和容器镜像源；网络受限时需要配置可用镜像源。

## 外部访问

当前仅监听服务器本机 `127.0.0.1:8080`，避免在未核对服务器现有网站前抢占 80/443。将服务器现有 Nginx/Caddy 的网站入口反向代理至此地址，并为确认的域名配置 HTTPS。公网入口应指向 `web` 服务，不能绕过它直连 `app:3000`。

容器 Nginx 允许牌库查询和抽牌，禁止旧接口的未鉴权增删改；抽牌限制为每个代理连接来源每分钟 6 次（突发 2 次），全站每分钟 30 次（突发 5 次）。它没有信任客户端提供的 X-Forwarded-For；使用前置代理时，同一代理的访客共享来源限额。可在核实代理地址后单独配置可信 real_ip。限流不等于账户鉴权或费用硬上限，模型供应商预算应另外设置。

阿里云安全组、系统防火墙和域名解析需结合实际入口设置。中国大陆服务器使用域名公开提供网站服务通常需完成 ICP 备案，绑定前核对备案状态。

抽牌历史当前保存在访问者浏览器 localStorage，服务器部署不会自动迁移旧域名/旧浏览器历史。SQLite 主要用于牌库。切换域名会切换浏览器存储空间。

## 验收

- 首页、`/cards`、`/draw`、`/meditation` 和五种冥想页面可访问。
- `/api/cards` 返回 78 张牌及有效图片；完成一次抽牌，并核对 provider 是模型名还是 mock。
- 通过 `web` 访问 POST `/api/cards` 应返回 403；牌库 GET 正常。
- 容器重启后牌库仍正常，`docker compose ps` 显示 app healthy。
- 外网使用实际域名检查 HTTPS、页面、图片和抽牌；只看到容器运行不代表上线成功。

## 更新、备份和回退

更新前保留上一版本源代码与镜像，备份数据库。以下通过短暂停止 app 得到一致的数据库副本；需要安排短暂维护窗口：

```sh
mkdir -p backups
docker compose stop app
docker compose cp app:/app/data/oracle.db "backups/oracle-$(date +%Y%m%d-%H%M%S).db"
docker compose start app
```

备份命令失败时先恢复 `app`，确认备份成功后再更新。更新执行 `docker compose --env-file .env.production up -d --build`，不要运行 `docker compose down -v`，后者会删除数据库卷。若迁移改变数据结构，回退应配套使用备份数据库和原镜像，不能只切换代码。
