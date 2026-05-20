import { useMemo, useState } from 'react';
import { mobileResultItems } from './data/images';

type MobileRoute = 'report' | 'result';
type MobileResultItem = (typeof mobileResultItems)[number];

const mobileFeatureCards = [
  {
    title: '面部特征：小量感灵动型',
    points: ['五官小巧精致，眼型偏圆、鼻头柔和。', '脸型线条柔和，适合清新、甜美、温柔风。']
  },
  {
    title: '脸型：圆形脸温柔款',
    points: ['轮廓圆润，下颌线不明显。', '优先选择 V 领、U 领、方领拉长比例。']
  },
  {
    title: '体型：X型沙漏曲线',
    points: ['肩胯比例协调，腰部线条明显。', '突出腰线，选择垂坠感面料。']
  }
];

const mobileStyleRows = [
  ['色彩', '奶茶色、雾霾蓝、米白色为主，浅粉与薄荷绿点缀。'],
  ['版型', '短款针织、收腰衬衫、过膝 A 字裙、高腰直筒裤。'],
  ['面料', '针织、棉麻、雪纺等柔软触感面料。'],
  ['配饰', '细链条、珍珠耳钉、细腰带、小巧包袋。']
];

const mobileAvoidItems = ['高领 / 圆领毛衣', '无腰线宽松卫衣', '深色紧身连衣裙', '大垫肩外套'];
const mobileTipItems = ['强调腰线', '裙长过膝 3-7cm', '优先低跟或平底鞋', '配饰选小巧款'];

export function MobileApp() {
  const route = getMobileRoute();
  return route === 'result' ? <MobileResultPage /> : <MobileReportPage />;
}

function getMobileRoute(): MobileRoute {
  return window.location.pathname.includes('/mobile/result') ? 'result' : 'report';
}

function MobileReportPage() {
  const hasReport = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') === 'ready' || params.get('payload') === 'ready' || params.has('report');
  }, []);

  if (!hasReport) return <MobileEmptyReport />;

  return (
    <main className="mobile-page mobile-report-page">
      <section className="mobile-hero-card">
        <div className="eyebrow">PERSONAL STYLING PROFILE</div>
        <h1>个人女装搭配诊断</h1>
        <p>基于面部特征、脸型与体型生成的穿搭报告，适合在手机端随时查看。</p>
      </section>

      <MobileSection title="基础特征诊断结果">
        {mobileFeatureCards.map((card) => (
          <article className="mobile-card mobile-feature-card" key={card.title}>
            <h3>{card.title}</h3>
            {card.points.map((point) => <p key={point}>{point}</p>)}
          </article>
        ))}
      </MobileSection>

      <MobileSection title="核心风格定位：优雅休闲风">
        <article className="mobile-card mobile-style-card">
          <h3>风格核心元素</h3>
          {mobileStyleRows.map(([label, value]) => (
            <div className="mobile-style-row" key={label}>
              <b>{label}</b>
              <p>{value}</p>
            </div>
          ))}
          <div className="mobile-occasion">
            <b>场合适配</b>
            <p>适合逛街、咖啡、短途出行等轻松场景，兼顾舒适度与精致感。</p>
          </div>
        </article>
      </MobileSection>

      <MobileSection title="避坑指南与优化建议">
        <div className="mobile-advice-grid">
          <article className="mobile-card">
            <h3>避开的单品类型</h3>
            {mobileAvoidItems.map((item) => <p key={item}>{item}</p>)}
          </article>
          <article className="mobile-card">
            <h3>细节优化技巧</h3>
            {mobileTipItems.map((item) => <p key={item}>{item}</p>)}
          </article>
        </div>
      </MobileSection>

      <MobileSection title="总结：你的专属搭配公式">
        <article className="mobile-card mobile-formula-card">
          <h3>柔色基础款 + 线条感领型 + 收腰设计 + 轻配饰</h3>
          <p>用柔和色彩与清晰腰线平衡面部比例和身形曲线，让日常穿搭更轻盈、更精致。</p>
        </article>
      </MobileSection>
    </main>
  );
}

function MobileEmptyReport() {
  return (
    <main className="mobile-page mobile-empty-page">
      <section className="mobile-empty-card">
        <div className="mobile-empty-icon"><i className="fa-solid fa-qrcode" /></div>
        <div className="eyebrow">REPORT NOT FOUND</div>
        <h1>暂未找到你的搭配诊断报告</h1>
        <p>这台手机当前没有可查看的报告数据。请先在门店设备完成形象测量，并在报告生成后使用设备上的二维码带走结果。</p>
        <div className="mobile-note">报告只会随本次扫码链接展示，不会通过手机号或账号自动查询，保护你的形象数据隐私。</div>
      </section>
    </main>
  );
}

function MobileResultPage() {
  const [activeItem, setActiveItem] = useState<MobileResultItem | null>(null);

  return (
    <main className="mobile-page mobile-result-page">
      <section className="mobile-hero-card compact">
        <div className="eyebrow">TRY-ON GALLERY</div>
        <h1>试穿结果</h1>
        <p>点击图片或视频查看大图预览。</p>
      </section>

      <section className="mobile-result-grid">
        {mobileResultItems.map((item) => (
          <button className={`mobile-result-card ${item.type}`} key={item.id} onClick={() => setActiveItem(item)}>
            {item.type === 'loading' ? (
              <span className="mobile-loading-tile"><i className="fa-solid fa-spinner" />试穿中</span>
            ) : (
              <>
                <img src={item.src} alt="" />
                {item.type === 'video' && <span className="mobile-play-icon"><i className="fa-solid fa-play" /></span>}
              </>
            )}
          </button>
        ))}
      </section>

      {activeItem && <MobilePreview item={activeItem} onClose={() => setActiveItem(null)} />}
    </main>
  );
}

function MobilePreview({ item, onClose }: { item: MobileResultItem; onClose: () => void }) {
  return (
    <div className="mobile-preview">
      <button className="mobile-preview-close" onClick={onClose} aria-label="关闭"><i className="fa-solid fa-xmark" /></button>
      <div className="mobile-preview-stage">
        {item.type === 'loading' ? (
          <div className="mobile-preview-loading"><i className="fa-solid fa-spinner" /><span>试穿中</span></div>
        ) : item.type === 'video' ? (
          <div className="mobile-video-preview">
            <img src={item.src} alt="" />
            <span><i className="fa-solid fa-play" /></span>
          </div>
        ) : (
          <img src={item.src} alt="" />
        )}
      </div>
      {item.type === 'image' && <a className="primary-btn mobile-download-btn" href={item.src} download>下载图片</a>}
      {item.type === 'video' && <div className="mobile-video-note">视频暂不支持下载</div>}
    </div>
  );
}

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mobile-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
