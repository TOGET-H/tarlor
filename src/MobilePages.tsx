import { useMemo, useState } from 'react';
import { mobileReportData, mobileResultItems } from './data/images';

type MobileTab = 'report' | 'result';
type MobileTheme = 'classic' | 'monochrome' | 'tech';
type MobileResultItem = (typeof mobileResultItems)[number];

export function MobileApp() {
  const [activeTab, setActiveTab] = useState<MobileTab>(() => getInitialTab());
  const theme = useMemo(() => getMobileTheme(), []);
  const hasReport = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') === 'ready' || params.get('payload') === 'ready' || params.has('report');
  }, []);

  return (
    <main className={`mobile-page theme-${theme}`}>
      <header className="mobile-topbar">
        <div>
          <p>Fit Vision</p>
          <h1>{activeTab === 'report' ? '美学报告' : 'AI 试穿结果'}</h1>
        </div>
        <div className="mobile-tabs" role="tablist" aria-label="手机端分类">
          <button
            className={activeTab === 'report' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === 'report'}
            onClick={() => setActiveTab('report')}
          >
            报告
          </button>
          <button
            className={activeTab === 'result' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === 'result'}
            onClick={() => setActiveTab('result')}
          >
            试穿结果
          </button>
        </div>
      </header>

      {activeTab === 'report' ? (
        hasReport ? <MobileReportPage /> : <MobileEmptyReport />
      ) : (
        <MobileResultPage />
      )}
    </main>
  );
}

function getInitialTab(): MobileTab {
  const params = new URLSearchParams(window.location.search);
  if (window.location.pathname.includes('/mobile/result') || params.get('tab') === 'result') return 'result';
  return 'report';
}

function getMobileTheme(): MobileTheme {
  const theme = new URLSearchParams(window.location.search).get('theme');
  if (theme === 'monochrome' || theme === 'tech') return theme;
  return 'classic';
}

function MobileReportPage() {
  return (
    <div className="mobile-report-page">
      <MobileSection title="基础特征">
        <div className="mobile-diagnostic-list">
          {mobileReportData.featureCards.map((item) => (
            <article className="mobile-diagnostic-card" key={item.title}>
              <img src={item.image} alt="" />
              <div>
                <h2>{item.title}</h2>
                {item.points.map((point) => <p key={point}><i className="fa-solid fa-circle-check" />{point}</p>)}
              </div>
            </article>
          ))}
        </div>
        <article className="mobile-card mobile-skin-card">
          <h2>{mobileReportData.skinTone.title}</h2>
          <div className="mobile-skin-rows">
            {mobileReportData.skinTone.traits.map(([label, value]) => (
              <p key={label}><b>{label}</b><span>{value}</span></p>
            ))}
          </div>
          <div className="mobile-skin-rows compact">
            {mobileReportData.skinTone.rules.map(([label, value]) => (
              <p key={label}><b>{label}</b><span>{value}</span></p>
            ))}
          </div>
          <div className="mobile-skin-groups">
            {mobileReportData.skinTone.groups.map((group) => (
              <div className="mobile-skin-group" key={group.label}>
                <b>{group.label}</b>
                <ColorSwatches colors={group.colors} />
              </div>
            ))}
          </div>
        </article>
      </MobileSection>

      <MobileSection title="风格定位">
        <article className="mobile-card mobile-style-card">
          <div className="mobile-style-verdict">
            <span>{mobileReportData.style.label}</span>
            <strong>{mobileReportData.style.value}</strong>
            <div>
              {mobileReportData.style.tags.map((tag) => <em key={tag}>{tag}</em>)}
            </div>
          </div>
          <h2>核心元素</h2>
          {mobileReportData.style.elements.map(({ label, value }) => (
            <div className="mobile-style-row" key={label}>
              <b>{label}</b>
              <p>{value}</p>
            </div>
          ))}
          <h2>推荐色彩</h2>
          <ColorSwatches colors={mobileReportData.style.colors} />
          <div className="mobile-occasion-card">
            <b>{mobileReportData.style.occasion.label}</b>
            <strong>{mobileReportData.style.occasion.title}</strong>
            <p>{mobileReportData.style.occasion.text}</p>
          </div>
        </article>
      </MobileSection>

      <MobileSection title="推荐搭配">
        <div className="mobile-outfit-list">
          {mobileReportData.outfits.map((item) => (
            <article className="mobile-outfit-card" key={item.title}>
              <img src={item.image} alt="" />
              <div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </MobileSection>

      <MobileSection title="穿搭建议">
        <div className="mobile-advice-grid">
          <article className="mobile-card">
            <h2><i className="fa-solid fa-star" />细节优化技巧</h2>
            {mobileReportData.tips.map((item, index) => <MobileAdviceRow item={item} index={index} key={item.name} />)}
          </article>
          <article className="mobile-card">
            <h2><i className="fa-solid fa-circle-xmark" />需要避开的单品</h2>
            {mobileReportData.avoid.map((item, index) => <MobileAdviceRow item={item} index={index} key={item.name} />)}
          </article>
        </div>
      </MobileSection>

    </div>
  );
}

function MobileAdviceRow({ item, index }: { item: { name: string; reason: string }; index: number }) {
  return (
    <div className="mobile-advice-row">
      <span>{index + 1}</span>
      <div>
        <b>{item.name}</b>
        <p>{item.reason}</p>
      </div>
    </div>
  );
}

function ColorSwatches({ colors }: { colors: { name: string; value: string }[] }) {
  return (
    <div className="mobile-swatch-grid" style={{ '--swatch-count': colors.length } as React.CSSProperties}>
      {colors.map((color) => (
        <div className="mobile-swatch" key={color.name}>
          <span style={{ background: color.value }} />
          <b>{color.name}</b>
        </div>
      ))}
    </div>
  );
}

function MobileEmptyReport() {
  return (
    <section className="mobile-empty-card">
      <div className="mobile-empty-icon"><i className="fa-solid fa-qrcode" /></div>
      <h2>暂未找到你的搭配诊断报告</h2>
      <p>这台手机当前没有可查看的报告数据。请先在门店设备完成形象测量，并在报告生成后使用设备上的二维码带走结果。</p>
      <div className="mobile-note">报告只会随本次扫码链接展示，不会通过手机号或账号自动查询，保护你的形象数据隐私。</div>
    </section>
  );
}

function MobileResultPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const item = mobileResultItems[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < mobileResultItems.length - 1;

  return (
    <section className="mobile-result-page">
      <div className="mobile-result-card">
        <div className="mobile-result-card-head">
          <h2>本次生成结果</h2>
        </div>

        <div className="mobile-result-stage">
          {item.type === 'loading' ? (
            <div className="mobile-loading-tile"><i className="fa-solid fa-spinner" />生成中</div>
          ) : (
            <>
              <img src={item.src} alt="" />
              {item.type === 'video' && <span className="mobile-play-icon"><i className="fa-solid fa-play" /></span>}
            </>
          )}
        </div>
      </div>

      <div className="mobile-result-controls">
        <button type="button" disabled={!canGoPrev} onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))} aria-label="上一张">
          <i className="fa-solid fa-chevron-left" />
        </button>
        <b>第 {activeIndex + 1} / {mobileResultItems.length} 张</b>
        <button type="button" disabled={!canGoNext} onClick={() => setActiveIndex((index) => Math.min(index + 1, mobileResultItems.length - 1))} aria-label="下一张">
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>

      {item.type === 'image' && <a className="primary-btn mobile-download-btn" href={item.src} download>下载图片</a>}
      {item.type === 'video' && <div className="mobile-video-note">动态试穿预览暂不支持下载</div>}
    </section>
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
