# AI 调用通道

上层只传 `channel`，服务端统一管理供应商、密钥、模型、请求地址、超时和生成参数。当前支持 DeepSeek、智谱 GLM、硅基流动，以及使用同一 Chat Completions 协议的自定义通道。

## 上层调用

`GET /api/ai/channels` 返回默认通道及通道列表：每项只有 `id`、`label`、`status`。状态为 `ready`、`unconfigured`、`disabled` 或 `invalid`；`ready` 只表示本地配置完整，不代表供应商已联通。

```ts
const reading = await $fetch('/api/readings/draw', {
  method: 'POST',
  body: { question: '如何安排今天的学习？', spreadType: 'single', channel: 'deepseek' }
})
```

`channel` 可选 `siliconflow`、`deepseek`、`glm`；省略时使用服务端默认通道。现有页面继续使用默认通道，暂未增加页面上的通道选择器。请求体不能覆盖密钥、模型或上游地址。

解读保留已有 `provider`、`content`，并增加 `channel`、`model`、`source`。真实调用的 `source` 为 `ai`，`provider` 仍为配置的模型名；模拟解读为 `source: 'mock'`、`provider: 'mock'`、`model: null`，附带 `fallbackReason`。旧浏览器历史仍可读取。

## 集中配置

开发环境复制根目录 `.env.example` 到 `.env`。生产 Node 服务在进程环境中配置（现有服务器对应 `/etc/digital-oracle.env`），修改后重启服务。生产构建启动不会自动读取 `.env`。

```dotenv
NUXT_AI_DEFAULT_CHANNEL=deepseek
NUXT_AI_FALLBACK_TO_MOCK=false
NUXT_AI_CHANNELS_DEEPSEEK_API_KEY=服务端密钥
NUXT_AI_CHANNELS_DEEPSEEK_MODEL=deepseek-chat
NUXT_AI_CHANNELS_DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

其他通道将 `DEEPSEEK` 换成 `GLM` 或 `SILICONFLOW`。`API_URL` 是完整 Chat Completions 请求地址。所有配置位于私有 `runtimeConfig.ai`，不放入 `runtimeConfig.public`。不在源码中填写真实密钥。

每个通道还支持 `ENABLED`（默认 true）、`TIMEOUT_MS`（45000）、`TEMPERATURE`（0.78）、`MAX_TOKENS`（900）。布尔值使用 `true` / `false`。超时范围 1–180000 毫秒，温度 0–2，输出预算 1–65536；具体模型可能有更严格限制，需按供应商要求调整。

Docker 使用 `deploy/.env.production.example` 和 `docker compose --env-file .env.production up -d --build`。Compose 已转发三种通道的地址、模型、密钥及全局设置；需要额外参数时，在 `compose.yaml` 的 `app.environment` 添加相应变量映射。

旧的 `NUXT_SILICONFLOW_API_KEY / MODEL / API_URL` 和 `SILICONFLOW_API_KEY / MODEL / API_URL` 继续兼容。优先级：新的通道非空值 → 旧 Nuxt 非空值 → 旧环境变量非空值 → 内置默认值。迁移完应删除旧变量；仅清空新密钥不会覆盖仍存在的旧密钥，停用请设 `ENABLED=false`。

## 服务端结构与扩展

- `server/ai/config.ts`：通道预设、配置解析及校验。
- `server/ai/gateway.ts`：统一 `generateText({ channel, messages })`，选择通道并输出通用结果。
- `server/ai/openai-compatible.ts`：协议适配器，统一鉴权、超时、请求和响应解析。
- `server/services/interpretation.ts`：塔罗业务提示词与模拟回退，不含供应商请求代码。

增加同协议通道，在 `nuxt.config.ts` 的私有 `runtimeConfig.ai.channels` 中追加条目（不要填写真实密钥）：

```ts
channels: {
  ...aiRuntimeDefaults.channels,
  company: {
    label: '公司通道', enabled: true, protocol: 'openai-compatible',
    apiKey: '', apiUrl: '', model: '',
    timeoutMs: 45000, temperature: 0.78, maxTokens: 900
  }
}
```

部署后通过 `NUXT_AI_CHANNELS_COMPANY_API_KEY / API_URL / MODEL` 填充配置，上层只传 `channel: 'company'`。新协议需新增适配器并扩展配置校验和网关分派，业务提示词无需修改。当前只支持非流式文本，无自动重试或跨供应商切换。

## 失败行为与验证

默认保留原有模拟回退；未配密钥、超时、上游拒绝、网络错误或空响应会返回明确标记的模拟内容。设置 `NUXT_AI_FALLBACK_TO_MOCK=false` 可改为返回错误。未知通道、停用通道和无效连接参数不会伪装成成功结果。错误响应的 `data.code` 可供上层处理，不返回原始上游错误或密钥。

`pnpm test:ai` 使用假传输验证协议契约和错误处理，无外部模型调用。CI 另用隔离 SQLite 运行 HTTP 冒烟测试，再运行 `node scripts/ai-runtime.mjs`（需已有生产构建，且 `DATABASE_URL` 指向隔离、已初始化的测试数据库），通过本机假上游验证生产运行时环境变量覆盖、通道分派和错误映射。测试通过不等于真实模型联调通过；接入真实密钥后需单独验证各供应商的模型权限、余额和响应。

部署前本地验证（2026-10-02，Windows / Node 24.12.0）：11 项契约测试、类型检查、生产构建、HTTP 冒烟及运行时通道联调均通过。构建仍有既有 Vue 路由插件路径和图片路径警告。本机 Prisma 迁移引擎报错，测试库改用 SQLite 执行仓库迁移 SQL 后 seed；本次没有数据库结构改动。CI 保留 Linux / Node 22 的正式迁移步骤；本地检查通过不能代替远端 CI 与服务器发布验收。
