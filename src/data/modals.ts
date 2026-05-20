export const modalsData = {
  features: {
    title: '技术及服务介绍',
    content: '<p>终端围绕本地化美学测算、五维诊断、推荐组合、自选试穿和 AI 影像生成组织完整体验。</p><p>自选试穿采用任务式生成，适配真实 1-2 分钟处理耗时。</p>'
  },
  guide: {
    title: '线下体验指南',
    content: '<p>请站在屏幕前约 1.5 米处完成拍照建档。建档后可选择最多 4 件单品提交试穿生成。</p><p>生成完成后可进入影像工坊，扫码带走照片、视频和美学画像。</p>'
  }
};

export type ModalType = keyof typeof modalsData;
