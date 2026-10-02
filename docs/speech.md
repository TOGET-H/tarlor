# 语音合成与播放

实现参考 [jianghun-shuyin](https://github.com/ALing-LingXi/jianghun-shuyin/tree/0bc2980551ccf9f1c0bab82d5a03aa21fae8694b) 的 TTSProvider、文本分块、缓存和音频播放器设计。本项目按 Nuxt 结构独立实现短文本场景，使用同一个 `edge-tts-universal@1.4.0` 包，通过服务端 Edge 在线语音服务生成 MP3，前端 HTML Audio 播放。不是设备自带的 `speechSynthesis` 朗读。

## 用户功能

- 解读报告和保存记录页：选择默认音色、云溪（男声）或晓晓（女声），生成、播放、暂停、继续和停止。
- 冥想：手动开启语音引导，按阶段朗读，默认慢速；暂停或阶段切换取消旧播放，继续练习重读当前阶段；退出页面释放音频。提示音开关独立。
- 浏览器阻止异步音频播放时，提供继续播放按钮。生成失败显示真实失败状态，不冒充已经播放，也不自动切到不同音色来源。

## 接口与集中配置

`POST /api/tts/synthesize` 请求 `{ text, channel?: 'edge', voice?, purpose?: 'reading' | 'meditation' }`，返回 `audio/mpeg`。单段最多 350 个 UTF-16 代码单元，前端按句拆分且保留 Unicode 字符。服务端控制语速、音调、连接参数；请求不能覆盖地址、代理或超时。

Edge TTS 不需要 API Key，不依赖服务器安装 Edge 浏览器。默认配置即可使用，但服务器必须能访问微软在线语音服务，第三方服务可能限流或不可用。

```dotenv
NUXT_TTS_ENABLED=true
NUXT_TTS_DEFAULT_CHANNEL=edge
NUXT_TTS_VOICE=zh-CN-YunxiNeural
NUXT_TTS_RATE=+0%
NUXT_TTS_MEDITATION_RATE=-15%
NUXT_TTS_PITCH=+0Hz
NUXT_TTS_TIMEOUT_MS=30000
# 仅有需要且已配置代理的服务器填写；通常留空。
NUXT_TTS_PROXY=
```

Node 部署在 `/etc/digital-oracle.env` 配置后重启服务；Docker 使用 `deploy/.env.production.example` 和 Compose 映射。需要同步更新 Nginx 模板，允许 `/api/tts/synthesize` 的 POST；旧 Nginx 的通用 API 规则会拒绝它。本地代码与模板更新不代表服务器已经发布。

## 资源与数据

服务端每进程最多 2 个合成任务，相同在途请求合并。缓存按文本哈希、通道、音色、语速和音调区分，最多 64 段 / 16 MiB / 10 分钟，仅驻留内存。无音频落盘、数据库变更、FFmpeg 或长任务队列。单次最多 2 MiB 音频。工作线程隔离第三方库，超时终止线程及连接；上游失败最多重试一次，两次共用总超时预算，超时不再重试。前端停止时取消 HTTP 等待，服务端已开始的共享合成最多运行到自身超时。

朗读文字会从本站服务端发送至微软语音服务；不在应用日志中打印问题或解读内容，响应设为 `private, no-store`。Nginx 模板对语音请求限速，直连应用仍有进程并发限制。

依赖 `edge-tts-universal@1.4.0` 的许可证为 **AGPL-3.0**；分发和网络服务发布时需要按该依赖许可证处理相应源码提供义务。参考仓库用于设计对照，没有复制其业务源码。

## 验证

`pnpm test:speech` 使用假音频和假供应商验证分块、播放清理、迟到响应、错误恢复、配置边界、并发与缓存。类型检查和构建验证 Nuxt 集成。真实在线服务连通性、MP3 返回和浏览器播放需另做非敏感文本联调；测试桩通过不能代替音频验收。

本地验证（2026-10-02，Windows / Node 24.12.0）：11 项测试通过（含挂起代理下超时终止工作线程与连接）、类型检查及生产构建通过。生产构建直连 Edge 返回 `audio/mpeg`，冥想测试音频为 44,352 字节；云溪/晓晓浏览器播放、暂停、继续、停止、切换音色均已操作验证。冥想开启、暂停/继续及 320px 无横向溢出已检查。联调期间出现一次上游失败，页面显示错误；加入有限重试后复测成功，不能据此保证服务永远可用。原有 Vue 插件路径和图片路径构建警告仍在。

以上为部署前的本地验收记录，当时尚未验证阿里云到 Edge 的连通性，也未对各手机设备的音色听感进行验收。部署时需同步新的 Nginx 语音路由；服务器实际发布记录见 `docs/deployment.md`。
