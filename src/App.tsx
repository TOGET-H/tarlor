import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  categories,
  products,
  suitData,
  type CategoryId,
  type Product,
  type Suit
} from './data/catalog';
import { bodyShapeImage, faceShapeImage, lookImages, productImagePools, resultImages } from './data/images';

type Screen = 'home' | 'consent' | 'camera' | 'loading' | 'report' | 'mall' | 'generating' | 'results';
type GenerationSource = 'recommend' | 'custom';
type QrType = 'profile' | 'result';
type TryOnStatus = 'idle' | 'loading' | 'ready';
type MallMode = 'single' | 'free';
type MallSlot = 'top' | 'bottom';
type MallCategoryId = 'set' | 'dress' | 'soloTop' | 'shirt' | 'knit' | 'summerTop' | 'skirt' | 'pants';
type ThemeMode = 'classic' | 'monochrome' | 'tech';
type Language = 'zh' | 'en';

interface MallCategory {
  id: MallCategoryId;
  name: string;
}

interface OutfitPlan {
  id: string;
  name: string;
  title: string;
  scene: string;
  tone: string;
  reason: string;
  composition: string[];
  items: Product[];
  innerColor: string;
  outerColor: string;
}

interface TryOnResult {
  id: string;
  planId: string;
  title: string;
  subtitle: string;
  kind: 'tryon' | 'background' | 'video' | 'photo';
  innerColor: string;
  outerColor: string;
  image: string;
}

interface FeatureCardData {
  icon: string;
  title: string;
  points: string[];
}

interface FeatureProfileData {
  icon: string;
  title: string;
  image?: string;
  points: string[];
}

interface SkinColor {
  name: string;
  value: string;
  darkText?: boolean;
}

interface SkinToneData {
  title: string;
  traits: {
    label: string;
    value: string;
  }[];
  rules: {
    label: string;
    value: string;
  }[];
  colorGroups: {
    label: string;
    colors: SkinColor[];
  }[];
}

interface ReportLookDetail {
  label: string;
  value: string;
}

type ToastState = {
  title: string;
  content: string;
} | null;

const themeOptions: { id: ThemeMode; label: Record<Language, string> }[] = [
  { id: 'classic', label: { zh: '智雅女装', en: 'Classic' } },
  { id: 'monochrome', label: { zh: '黑白灰色调', en: 'Monochrome' } },
  { id: 'tech', label: { zh: '科技感色调', en: 'Tech' } }
];

const languageOptions: { id: Language; label: string }[] = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' }
];

const copy = {
  zh: {
    brandEyebrow: 'BRAND EXPERIENCE TERMINAL',
    homeTitle: '智能美学体验镜',
    homeSubtitle: '寻找属于您的廓形、面庞、风格与场合黄金配比',
    homeReportEyebrow: '美学报告',
    homeReportTitle: '生成美学报告',
    homeReportDesc: '识别体型、脸型与风格特征，生成专属穿搭建议。',
    homeTryOnEyebrow: '自选试穿',
    homeTryOnTitle: '创建试穿形象',
    homeTryOnDesc: '拍照创建形象，自选款式并预览上身效果。',
    poweredBy: 'Style3D 提供技术支持',
    back: '返回',
    home: '返回首页',
    settings: '设置',
    consentTop: '美学测算',
    consentEyebrow: 'PRIVATE AESTHETIC PROFILE',
    consentTitle: '隐私安全与本地解算声明',
    consentDesc: '美学测算产生的图像与体征数据仅用于本次体验，现场完成解算后生成您的五维美学画像。体验结束后可选择扫码带走结果。',
    consentStep1: '请移步至屏幕正前方的美学定位线处。',
    consentStep2: '保持自然直立，双手放松下垂，平视屏幕上方摄像头。',
    startProfile: '开始创建美学画像',
    cameraTop: '形象采集',
    cameraStatusIdle: '美学定位系统：正在识别体态与面庞位置',
    cameraStatusCounting: '定位已锁定，即将自动拍摄',
    reportLoadingTop: '美学报告生成',
    reportLoadingEyebrow: 'STYLING REPORT',
    reportLoadingTitle: '专属美学报告生成中',
    reportLoadingDesc: '正在整理你的基础特征、风格定位与搭配建议',
    loadingStepProfile: '识别基础特征',
    loadingStepStyle: '定位穿搭风格',
    loadingStepScene: '匹配场景化方案',
    reportTop: '美学报告',
    takeReport: '扫码带走报告',
    takeReportDesc: '手机查看完整诊断与搭配建议',
    reportFeature: '基础特征',
    reportStyle: '风格定位',
    reportLooks: '推荐搭配',
    reportAdvice: '穿搭建议',
    coreStyleLabel: '你的核心风格',
    coreElements: '核心元素',
    recommendedColors: '推荐色彩',
    occasion: '场合适配',
    tipsTitle: '细节优化技巧',
    avoidTitle: '需要避开的单品',
    tryOn: '试穿',
    scanToSave: '扫码带走',
    closeQr: '收起二维码',
    mallTop: '自选试穿',
    photoSection: '形象拍照',
    photoReady: '形象已就绪',
    photoGuide: '站在屏幕前方，保持自然站姿',
    retake: '重拍',
    takePhoto: '拍照建档',
    selectTryOn: '选款与试穿',
    singleMode: '套装',
    freeMode: '上下装',
    topSlot: '上装',
    bottomSlot: '下装',
    selectedCount: '已选',
    pleaseSelectStyle: '请选择款式',
    generateTryOn: '生成试穿',
    previousPage: '上一页',
    nextPage: '下一页',
    generatingTop: '试穿生成',
    generatingEyebrow: 'TRY-ON RENDERING',
    generatingRecommend: '正在生成推荐方案试穿预览',
    generatingCustom: '正在生成自选方案试穿预览',
    generatingDescPrefix: '系统正在将',
    generatingDescSuffix: '套方案应用到您的专属形象，完成后可在同一页面对比结果。',
    resultsTop: '试穿结果',
    takeResults: '扫码带走结果',
    takeResultsDesc: '手机保存本次试穿图片与视频',
    changeBackground: '换背景',
    generateVideo: '生成视频',
    tryOnLoading: '试穿中',
    currentAccount: '当前账号',
    deviceInfo: '设备信息',
    deviceValue: '55 寸竖屏终端 · 门店体验模式',
    theme: '主题',
    language: '语言',
    privacy: '隐私说明',
    exitExperience: '退出体验',
    qrProfileTitle: '扫码带走美学画像',
    qrResultTitle: '扫码带走结果',
    qrProfilePacked: '美学画像与推荐方案已打包',
    qrResultPacked: '试穿作品集已打包',
    qrProfileDesc: '扫码后可在手机端查看本次美学画像、五维结论与推荐方案。',
    qrResultDescPrefix: '扫码后可保存当前',
    qrResultDescSuffix: '个试穿图、视频或衍生作品。',
    waitSelect: '待选择',
    chooseFromBelow: '从下方款式区域选择',
    selected: '已选',
    choose: '选择',
    itemCountSuffix: '件',
    productType: { set: '套装', dress: '连衣裙', soloTop: '单穿上衣', shirt: '春夏衬衫', knit: '轻薄针织', summerTop: '通勤上衣', skirt: '半身裙', pants: '直筒裤' },
    reportDetailLabels: { top: '上装', bottom: '下装', item: '单品' },
    generationStages: ['读取专属形象', '理解搭配层次', '生成试穿画面', '优化面料光影', '整理结果作品'],
    toastNeedPhotoTitle: '请先完成拍照',
    toastNeedPhotoContent: '自选试穿需要本页的试穿形象，请先在左侧拍照。',
    toastNeedStyleTitle: '请先选择款式',
    toastNeedStyleContent: '套装选择 1 件，或上下装选择上装、下装中的任意 1 件即可生成。',
    toastBackgroundTitle: '背景生成已加入',
    toastBackgroundContent: '已为当前试穿结果生成新的场景版本。',
    toastVideoTitle: '视频生成已加入',
    toastVideoContent: '已为当前试穿结果生成动态视频版本。'
  },
  en: {
    brandEyebrow: 'BRAND EXPERIENCE TERMINAL',
    homeTitle: 'Smart Styling Mirror',
    homeSubtitle: 'Find the best balance of silhouette, face, style, and occasion.',
    homeReportEyebrow: 'STYLING REPORT',
    homeReportTitle: 'Create Styling Report',
    homeReportDesc: 'Analyze silhouette, face shape, and style signals to create a personal styling report.',
    homeTryOnEyebrow: 'TRY-ON',
    homeTryOnTitle: 'Create Try-On Profile',
    homeTryOnDesc: 'Capture a profile, choose pieces, and preview the try-on result.',
    poweredBy: 'Powered by Style3D',
    back: 'Back',
    home: 'Home',
    settings: 'Settings',
    consentTop: 'Aesthetic Scan',
    consentEyebrow: 'PRIVATE AESTHETIC PROFILE',
    consentTitle: 'Privacy and Local Processing',
    consentDesc: 'Images and body data are used only for this in-store experience. The system processes them locally and creates your styling profile for this session.',
    consentStep1: 'Please stand in front of the screen, aligned with the positioning guide.',
    consentStep2: 'Stand naturally, relax your arms, and look toward the camera above the screen.',
    startProfile: 'Create Styling Profile',
    cameraTop: 'Profile Capture',
    cameraStatusIdle: 'Positioning system: detecting posture and face position',
    cameraStatusCounting: 'Position locked. Capture will start shortly',
    reportLoadingTop: 'Report Generation',
    reportLoadingEyebrow: 'STYLING REPORT',
    reportLoadingTitle: 'Creating Your Styling Report',
    reportLoadingDesc: 'Organizing your profile, style direction, and outfit suggestions',
    loadingStepProfile: 'Analyze core features',
    loadingStepStyle: 'Define styling direction',
    loadingStepScene: 'Match outfit scenarios',
    reportTop: 'Styling Report',
    takeReport: 'Scan to Save Report',
    takeReportDesc: 'View the full report and styling suggestions on your phone',
    reportFeature: 'Features',
    reportStyle: 'Style',
    reportLooks: 'Outfits',
    reportAdvice: 'Advice',
    coreStyleLabel: 'Core Style',
    coreElements: 'Core Elements',
    recommendedColors: 'Recommended Colors',
    occasion: 'Occasion',
    tipsTitle: 'Styling Tips',
    avoidTitle: 'Items to Avoid',
    tryOn: 'Try On',
    scanToSave: 'Scan to Save',
    closeQr: 'Collapse QR Code',
    mallTop: 'Custom Try-On',
    photoSection: 'Profile Photo',
    photoReady: 'Profile Ready',
    photoGuide: 'Stand in front of the screen with a natural posture',
    retake: 'Retake',
    takePhoto: 'Capture',
    selectTryOn: 'Select and Try On',
    singleMode: 'Set',
    freeMode: 'Top / Bottom',
    topSlot: 'Top',
    bottomSlot: 'Bottom',
    selectedCount: 'Selected',
    pleaseSelectStyle: 'Select a Style',
    generateTryOn: 'Generate Try-On',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    generatingTop: 'Try-On Generation',
    generatingEyebrow: 'TRY-ON RENDERING',
    generatingRecommend: 'Generating Recommended Try-On Preview',
    generatingCustom: 'Generating Custom Try-On Preview',
    generatingDescPrefix: 'Applying',
    generatingDescSuffix: 'outfit plan(s) to your profile. Results will appear on the comparison page.',
    resultsTop: 'Try-On Results',
    takeResults: 'Scan to Save Results',
    takeResultsDesc: 'Save the try-on images and videos to your phone',
    changeBackground: 'Background',
    generateVideo: 'Video',
    tryOnLoading: 'Trying On',
    currentAccount: 'Account',
    deviceInfo: 'Device',
    deviceValue: '55-inch portrait terminal · retail experience mode',
    theme: 'Theme',
    language: 'Language',
    privacy: 'Privacy',
    exitExperience: 'Exit Experience',
    qrProfileTitle: 'Scan to Save Profile',
    qrResultTitle: 'Scan to Save Results',
    qrProfilePacked: 'Profile and recommendations are ready',
    qrResultPacked: 'Try-on collection is ready',
    qrProfileDesc: 'Scan to view this styling profile, conclusions, and outfit recommendations on your phone.',
    qrResultDescPrefix: 'Scan to save',
    qrResultDescSuffix: 'try-on image(s), videos, or generated works.',
    waitSelect: 'Not Selected',
    chooseFromBelow: 'Choose from the styles below',
    selected: 'Selected',
    choose: 'Select',
    itemCountSuffix: 'item(s)',
    productType: { set: 'Set', dress: 'Dress', soloTop: 'Top', shirt: 'Shirt', knit: 'Knit', summerTop: 'Work Top', skirt: 'Skirt', pants: 'Pants' },
    reportDetailLabels: { top: 'Top', bottom: 'Bottom', item: 'Item' },
    generationStages: ['Read profile', 'Analyze layers', 'Render try-on', 'Refine lighting', 'Prepare results'],
    toastNeedPhotoTitle: 'Capture a profile first',
    toastNeedPhotoContent: 'Custom try-on needs a profile photo. Please capture one on the left.',
    toastNeedStyleTitle: 'Select a style first',
    toastNeedStyleContent: 'Choose one set, or select at least one top or bottom to generate a try-on.',
    toastBackgroundTitle: 'Background Added',
    toastBackgroundContent: 'A new scene version has been created for the current try-on result.',
    toastVideoTitle: 'Video Added',
    toastVideoContent: 'A video version has been created for the current try-on result.'
  }
} as const;

const planNames = ['方案 A', '方案 B', '方案 C'];

const generationStages = [
  { threshold: 0, key: 0 },
  { threshold: 24, key: 1 },
  { threshold: 48, key: 2 },
  { threshold: 72, key: 3 },
  { threshold: 92, key: 4 }
];

const reportStyleElements = [
  { label: '色彩', value: '低饱和柔色为主，奶茶色、雾霾蓝、米白色铺底，浅粉与薄荷绿少量点缀。' },
  { label: '版型', value: '短款针织衫、收腰衬衫、过膝 A 字裙、高腰直筒裤，重点保留腰线。' },
  { label: '面料', value: '针织、棉麻、雪纺等柔软触感面料，避免厚重硬挺造成压迫。' },
  { label: '配饰', value: '细链条项链、珍珠耳钉、皮质细腰带、帆布托特包，尺寸与小量感匹配。' }
];

const reportColors = [
  { name: '浅灰', value: '#D8D8D2', darkText: true },
  { name: '卡其', value: '#C8B48D', darkText: true },
  { name: '浅蓝', value: '#BFD7EA', darkText: true },
  { name: '米白', value: '#F9F7F4', darkText: true }
];

const avoidItems = [
  { name: '高领和紧圆领', reason: '容易压缩颈部空间，让脸型显得更圆。' },
  { name: '无腰线宽松上衣', reason: '会掩盖腰部优势，让整体比例变得松散。' },
  { name: '厚重硬挺面料', reason: '硬挺廓形会增加量感，削弱轻盈和柔和气质。' },
  { name: '夸张大配饰', reason: '尺寸过大的配饰会压过五官，让整体不够精致。' }
];

const detailTips = [
  { name: '强调腰线', reason: '选择收腰版型或细腰带，把视觉重心稳定在腰部。' },
  { name: '拉长颈部线条', reason: '优先 V 领、U 领、方领，让圆形脸更轻盈。' },
  { name: '控制面料厚度', reason: '选择轻薄、垂坠、柔软的面料，避免上半身厚重。' },
  { name: '配饰小而精', reason: '耳饰、项链、包袋选择小巧精致款，更协调。' }
];

const featureProfileCards: FeatureProfileData[] = [
  {
    icon: 'fa-gem',
    title: '体型：X型沙漏曲线',
    image: bodyShapeImage,
    points: ['肩宽与胯宽比例协调，腰部线条明显。', '适合收腰设计、高腰下装和垂坠面料。', '避免完全无腰线的宽松廓形。']
  },
  {
    icon: 'fa-id-card',
    title: '脸型：圆形脸温柔款',
    image: faceShapeImage,
    points: ['面部轮廓圆润，下颌线柔和。', '优先 V 领、U 领、方领，拉长颈部和脸部比例。', '避免高领、紧圆领带来的压缩感。']
  }
];

const skinToneProfile: SkinToneData = {
  title: '肤色：春季型肤色',
  traits: [
    { label: '毛发', value: '棕色系' },
    { label: '眼睛', value: '眼珠呈棕色，眼白略带湖蓝色' },
    { label: '皮肤', value: '肤色偏白皙，脸颊带有珊瑚粉色红晕' }
  ],
  rules: [
    { label: '明度', value: '中高' },
    { label: '纯度', value: '中高' },
    { label: '冷暖', value: '暖色' }
  ],
  colorGroups: [
    {
      label: '外套',
      colors: [
        { name: '浅灰', value: '#D8D8D2', darkText: true },
        { name: '灰绿', value: '#A8B4A6', darkText: true },
        { name: '卡其', value: '#C8B48D', darkText: true }
      ]
    },
    {
      label: '内搭',
      colors: [
        { name: '浅蓝', value: '#BFD7EA', darkText: true },
        { name: '米白', value: '#F9F7F4', darkText: true },
        { name: '浅绿', value: '#CFE3C3', darkText: true }
      ]
    },
    {
      label: '点缀',
      colors: [
        { name: '薄荷绿', value: '#BFE4D2', darkText: true },
        { name: '亮黄', value: '#F5D44B', darkText: true },
        { name: '橙黄', value: '#F0A64A', darkText: true }
      ]
    }
  ]
};

const reportLookDetails: Record<string, ReportLookDetail[]> = {
  'suit-1': [
    { label: '上装', value: '奶茶色 V 领短款针织衫' },
    { label: '下装', value: '同色系高腰 A 字半身裙' }
  ],
  'suit-2': [
    { label: '上装', value: '白色方领泡泡袖衬衫' },
    { label: '下装', value: '浅蓝色高腰直筒牛仔裤' }
  ],
  'suit-3': [
    { label: '单品', value: '雾霾蓝 V 领收腰雪纺连衣裙' }
  ]
};

const mallSingleCategories: MallCategory[] = [
  { id: 'set', name: '套装' },
  { id: 'dress', name: '连衣裙' },
  { id: 'soloTop', name: '单穿上衣' }
];

const mallTopCategories: MallCategory[] = [
  { id: 'shirt', name: '春夏衬衫' },
  { id: 'knit', name: '轻薄针织' },
  { id: 'summerTop', name: '通勤上衣' }
];

const mallBottomCategories: MallCategory[] = [
  { id: 'skirt', name: '半身裙' },
  { id: 'pants', name: '直筒裤' }
];

const mallSetProducts: Product[] = [
  ...Object.values(suitData).map((suit, index) => ({
    id: `set-${index + 1}`,
    name: suit.name,
    type: 'inner' as const,
    typeName: '套装',
    icon: 'fa-shirt',
    color: suit.innerColor
  })),
  {
    id: 'set-4',
    name: '米白通勤套装',
    type: 'inner',
    typeName: '套装',
    icon: 'fa-shirt',
    color: '#F9F7F4'
  }
];

const mallProductsByCategory: Record<MallCategoryId, Product[]> = {
  set: mallSetProducts,
  dress: products.filter((product) => product.type === 'dress').slice(3, 9).map((product) => ({ ...product, typeName: '连衣裙' })),
  soloTop: products.filter((product) => product.type === 'inner').slice(0, 6).map((product) => ({ ...product, typeName: '单穿上衣' })),
  shirt: products.filter((product) => product.type === 'inner').filter((_, index) => [1, 6, 10].includes(index)).map((product) => ({ ...product, typeName: '春夏衬衫' })),
  knit: products.filter((product) => product.type === 'inner').filter((_, index) => [2, 7, 11].includes(index)).map((product) => ({ ...product, typeName: '轻薄针织' })),
  summerTop: products.filter((product) => product.type === 'inner').filter((_, index) => [3, 5, 8].includes(index)).map((product) => ({ ...product, typeName: '通勤上衣' })),
  skirt: products.filter((product) => product.type === 'dress').slice(0, 3).map((product) => ({ ...product, typeName: '半身裙' })),
  pants: products.filter((product) => product.type === 'bottom').slice(0, 6).map((product) => ({ ...product, typeName: '直筒裤' }))
};

const mallPageSize = 4;

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredOption<ThemeMode>('atelier-theme', 'classic', ['classic', 'monochrome', 'tech']));
  const [language, setLanguage] = useState<Language>(() => readStoredOption<Language>('atelier-language', 'zh', ['zh', 'en']));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qrType, setQrType] = useState<QrType | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [userHasCaptured, setUserHasCaptured] = useState(false);
  const [demoAvatarEnabled, setDemoAvatarEnabled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('inner');
  const [draftItems, setDraftItems] = useState<Product[]>([]);
  const [savedPlans, setSavedPlans] = useState<OutfitPlan[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  const [generationSource, setGenerationSource] = useState<GenerationSource>('recommend');
  const [generationPlans, setGenerationPlans] = useState<OutfitPlan[]>([]);
  const [generationProgress, setGenerationProgress] = useState(8);
  const [results, setResults] = useState<TryOnResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string>('');
  const [tryOnStatus, setTryOnStatus] = useState<TryOnStatus>('idle');
  const [mallMode, setMallMode] = useState<MallMode>('single');
  const [mallPhotoReady, setMallPhotoReady] = useState(false);
  const [mallCaptureCountdown, setMallCaptureCountdown] = useState<number | null>(null);
  const [mallFlashOn, setMallFlashOn] = useState(false);
  const [singleCategory, setSingleCategory] = useState<MallCategoryId>('set');
  const [topCategory, setTopCategory] = useState<MallCategoryId>('shirt');
  const [bottomCategory, setBottomCategory] = useState<MallCategoryId>('skirt');
  const [activeSlot, setActiveSlot] = useState<MallSlot>('top');
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [topProduct, setTopProduct] = useState<Product | null>(null);
  const [bottomProduct, setBottomProduct] = useState<Product | null>(null);
  const [mallPage, setMallPage] = useState(0);

  const t = copy[language];
  const avatarReady = userHasCaptured || demoAvatarEnabled;
  const recommendPlans = useMemo(() => Object.values(suitData).map(suitToPlan), []);
  const currentCategoryName = categories.find((category) => category.id === activeCategory)?.name ?? '全部';
  const visibleProducts = useMemo(
    () => activeCategory === 'all' ? products : products.filter((product) => product.type === activeCategory),
    [activeCategory]
  );
  const currentDraftPlan = useMemo(() => createPlanFromProducts(draftItems, savedPlans.length), [draftItems, savedPlans.length]);
  const canSavePlan = avatarReady && draftItems.length > 0 && savedPlans.length < 3;
  const generationCount = savedPlans.length || (draftItems.length ? 1 : 0);
  const activeResult = results.find((result) => result.id === activeResultId) ?? results[0];
  const mallSelectedItems = useMemo(
    () => mallMode === 'single' ? (singleProduct ? [singleProduct] : []) : [topProduct, bottomProduct].filter(Boolean) as Product[],
    [bottomProduct, mallMode, singleProduct, topProduct]
  );
  const mallActiveCategories = mallMode === 'single' ? mallSingleCategories : activeSlot === 'top' ? mallTopCategories : mallBottomCategories;
  const mallActiveCategory = mallMode === 'single' ? singleCategory : activeSlot === 'top' ? topCategory : bottomCategory;
  const mallVisibleProducts = mallProductsByCategory[mallActiveCategory] ?? [];
  const mallTotalPages = Math.max(1, Math.ceil(mallVisibleProducts.length / mallPageSize));
  const mallPagedProducts = mallVisibleProducts.slice(mallPage * mallPageSize, mallPage * mallPageSize + mallPageSize);
  const localizedMallCategories = mallActiveCategories.map((category) => ({
    ...category,
    name: t.productType[category.id]
  }));

  useEffect(() => {
    window.localStorage.setItem('atelier-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('atelier-language', language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  useEffect(() => {
    if (screen !== 'generating') return;

    setGenerationProgress(8);
    const interval = window.setInterval(() => {
      setGenerationProgress((current) => {
        const next = Math.min(100, current + 14);
        if (next === 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            const generated = generationPlans.map(planToResult);
            setResults(generated);
            setActiveResultId(generated[0]?.id ?? '');
            setScreen('results');
          }, 420);
        }
        return next;
      });
    }, 520);

    return () => window.clearInterval(interval);
  }, [screen, generationPlans]);

  useEffect(() => {
    if (screen !== 'results' || !activeResultId || tryOnStatus !== 'loading') return;

    const timeout = window.setTimeout(() => {
      setTryOnStatus('ready');
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [screen, activeResultId, tryOnStatus]);

  function switchScreen(nextScreen: Screen) {
    setScreen(nextScreen);
    setSettingsOpen(false);
    if (nextScreen !== 'camera') {
      setCountdown(null);
      setFlashOn(false);
    }
  }

  function showToast(title: string, content: string) {
    setToast({ title, content });
  }

  function triggerCountdown() {
    let count = 3;
    setCountdown(count);

    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        return;
      }

      window.clearInterval(interval);
      setCountdown(null);
      setFlashOn(true);
      window.setTimeout(() => {
        setFlashOn(false);
        setUserHasCaptured(true);
        switchScreen('loading');
        window.setTimeout(() => switchScreen('report'), 1700);
      }, 180);
    }, 800);
  }

  function toggleProduct(product: Product) {
    const selected = draftItems.some((item) => item.id === product.id);
    if (selected) {
      setDraftItems((items) => items.filter((item) => item.id !== product.id));
      return;
    }

    if (!avatarReady) {
      showToast(
        language === 'zh' ? '请先创建试穿形象' : 'Create a profile first',
        language === 'zh' ? '完成拍照建档或启用示范模特后，才能选择款式生成试穿预览。' : 'Capture a profile before selecting pieces for try-on preview.'
      );
      return;
    }

    if (draftItems.length >= 4) {
      showToast(
        language === 'zh' ? '当前方案已满' : 'Plan is full',
        language === 'zh' ? '每套方案最多支持 4 件单品，请先移除一件后再继续选择。' : 'Each plan supports up to 4 pieces. Remove one before adding another.'
      );
      return;
    }

    setDraftItems((items) => [...items, product]);
  }

  function saveCurrentPlan() {
    if (!canSavePlan) return;
    setSavedPlans((plans) => [...plans, currentDraftPlan]);
    setDraftItems([]);
    setTrayOpen(true);
  }

  function removeDraftItem(productId: string) {
    setDraftItems((items) => items.filter((item) => item.id !== productId));
  }

  function removeSavedPlan(planId: string) {
    setSavedPlans((plans) => plans.filter((plan) => plan.id !== planId).map((plan, index) => ({ ...plan, name: planNames[index] })));
  }

  function startCustomGeneration() {
    if (!avatarReady) {
      showToast(
        language === 'zh' ? '请先创建试穿形象' : 'Create a profile first',
        language === 'zh' ? '试穿生成需要用户形象，请先拍照建档或使用示范模特体验。' : 'Try-on generation needs a profile. Please capture one first.'
      );
      return;
    }

    const plans = savedPlans.length ? savedPlans : draftItems.length ? [currentDraftPlan] : [];
    if (!plans.length) {
      showToast(
        language === 'zh' ? '请先选择款式' : 'Select a style first',
        language === 'zh' ? '请至少选择 1 件单品，或保存一套方案后再生成试穿预览。' : 'Select at least one piece or save a plan before generating a preview.'
      );
      return;
    }

    setGenerationSource('custom');
    openTryOnResults(plans, plans[0]?.id);
  }

  function startMallCapture() {
    let count = 3;
    setMallCaptureCountdown(count);
    setMallFlashOn(false);

    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setMallCaptureCountdown(count);
        return;
      }

      window.clearInterval(interval);
      setMallCaptureCountdown(null);
      setMallFlashOn(true);
      window.setTimeout(() => {
        setMallFlashOn(false);
        setMallPhotoReady(true);
      }, 180);
    }, 700);
  }

  function changeMallMode(nextMode: MallMode) {
    setMallMode(nextMode);
    setMallPage(0);
  }

  function changeMallSlot(nextSlot: MallSlot) {
    setActiveSlot(nextSlot);
    setMallPage(0);
  }

  function changeMallCategory(categoryId: MallCategoryId) {
    if (mallMode === 'single') {
      setSingleCategory(categoryId);
    } else if (activeSlot === 'top') {
      setTopCategory(categoryId);
    } else {
      setBottomCategory(categoryId);
    }
    setMallPage(0);
  }

  function selectMallProduct(product: Product) {
    if (mallMode === 'single') {
      setSingleProduct(product);
      return;
    }

    if (activeSlot === 'top') {
      setTopProduct(product);
      return;
    }

    setBottomProduct(product);
  }

  function startMallTryOn() {
    if (!mallPhotoReady) {
      showToast(t.toastNeedPhotoTitle, t.toastNeedPhotoContent);
      return;
    }

    if (!mallSelectedItems.length) {
      showToast(t.toastNeedStyleTitle, t.toastNeedStyleContent);
      return;
    }

    const plan = createPlanFromProducts(mallSelectedItems, 0);
    setGenerationSource('custom');
    openTryOnResults([plan], plan.id);
  }

  function openTryOnResults(plans: OutfitPlan[], activePlanId?: string) {
    const generated = plans.map(planToResult);
    const active = generated.find((result) => result.planId === activePlanId) ?? generated[0];
    setGenerationPlans(plans);
    setResults(generated);
    setActiveResultId(active?.id ?? '');
    setTryOnStatus(active ? 'loading' : 'idle');
    switchScreen('results');
  }

  function startPlanTryOn(planId?: string) {
    setGenerationSource('recommend');
    openTryOnResults(recommendPlans, planId);
  }

  function selectResult(resultId: string) {
    if (resultId === activeResultId) return;
    setActiveResultId(resultId);
    setTryOnStatus('loading');
  }

  function appendDerivedResult(kind: TryOnResult['kind']) {
    if (!activeResult) return;
    const titleMap = {
      background: `${activeResult.title} · 艺术馆背景`,
      video: `${activeResult.title} · 秀场视频`,
      photo: `${activeResult.title} · 封面大片`,
      tryon: activeResult.title
    };
    const subtitleMap = {
      background: '已替换为高级艺术馆场景',
      video: '已生成可扫码带走的动态视频',
      photo: '已生成高保真静态大片',
      tryon: activeResult.subtitle
    };
    const next: TryOnResult = {
      ...activeResult,
      id: `${activeResult.id}-${kind}-${Date.now()}`,
      title: titleMap[kind],
      subtitle: subtitleMap[kind],
      kind
    };
    setResults((items) => [...items, next]);
    setActiveResultId(next.id);
    if (kind === 'background') showToast(t.toastBackgroundTitle, t.toastBackgroundContent);
    if (kind === 'video') showToast(t.toastVideoTitle, t.toastVideoContent);
  }

  function resetExperience() {
    setUserHasCaptured(false);
    setDemoAvatarEnabled(false);
    setDraftItems([]);
    setSavedPlans([]);
    setResults([]);
    setActiveResultId('');
    setMallPhotoReady(false);
    setMallCaptureCountdown(null);
    setMallFlashOn(false);
    setMallMode('single');
    setActiveSlot('top');
    setSingleProduct(null);
    setTopProduct(null);
    setBottomProduct(null);
    setMallPage(0);
    switchScreen('home');
  }

  return (
    <main id="screenCanvas" className={`app theme-${theme}`} data-language={language}>
      <ScreenShell active={screen === 'home'} className="home">
        <HomeTopBar onSettings={() => setSettingsOpen(true)} t={t} />
        <div className="brand-block">
          <div>
            <div className="brand-title">Atelier Privé</div>
            <div className="eyebrow">{t.brandEyebrow}</div>
          </div>
          <div className="kv" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="M16 22C16 16 22 14 32 14C42 14 48 16 48 22C48 30 42 54 32 54C22 54 16 30 16 22Z" fill="currentColor" fillOpacity="0.03" />
              <path d="M24 14H40" strokeLinecap="round" />
              <path d="M32 8V14" />
              <path d="M32 14C36 17 38 19 40 22C42 25 44 26 48 26" />
              <path d="M32 14C28 17 26 19 24 22C22 25 20 26 16 26" />
            </svg>
          </div>
          <div>
            <h1>{t.homeTitle}</h1>
            <p className="home-subtitle">{t.homeSubtitle}</p>
          </div>
        </div>

        <div className="entry-list">
          <button className="entry-card panel" onClick={() => switchScreen('consent')}>
            <span className="entry-icon"><i className="fa-solid fa-camera-retro" /></span>
            <span>
              <span className="eyebrow">{t.homeReportEyebrow}</span>
              <h3>{t.homeReportTitle}</h3>
              <p>{t.homeReportDesc}</p>
            </span>
            <i className="fa-solid fa-chevron-right brand-text" />
          </button>

          <button className="entry-card panel" onClick={() => switchScreen('mall')}>
            <span className="entry-icon"><i className="fa-solid fa-shirt" /></span>
            <span>
              <span className="eyebrow">{t.homeTryOnEyebrow}</span>
              <h3>{t.homeTryOnTitle}</h3>
              <p>{t.homeTryOnDesc}</p>
            </span>
            <i className="fa-solid fa-chevron-right brand-text" />
          </button>
        </div>

        <p className="home-signature">{t.poweredBy}</p>
      </ScreenShell>

      <ScreenShell active={screen === 'consent'} className="consent-screen">
        <TopBar title={t.consentTop} onBack={() => switchScreen('home')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <div className="center-zone">
          <div className="consent-card panel">
            <div className="shield"><i className="fa-solid fa-user-shield" /></div>
            <div>
              <div className="eyebrow">{t.consentEyebrow}</div>
              <h2>{t.consentTitle}</h2>
              <p>{t.consentDesc}</p>
            </div>
            <div className="prepare-list">
              <div><b>1.</b> {t.consentStep1}</div>
              <div><b>2.</b> {t.consentStep2}</div>
            </div>
            <button className="primary-btn" onClick={() => switchScreen('camera')}><i className="fa-solid fa-camera" /> {t.startProfile}</button>
          </div>
        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'camera'}>
        <TopBar title={t.cameraTop} onBack={() => switchScreen('consent')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <div className="camera-stage">
          <div className="camera-status">
            <span className="status-dot" />
            <span>{countdown === null ? t.cameraStatusIdle : t.cameraStatusCounting}</span>
          </div>
          <div className="silhouette">
            <svg viewBox="0 0 200 400">
              <circle cx="100" cy="55" r="26" />
              <path d="M50 120 C 50 120, 100 85, 150 120 L 138 230 L 122 380 L 78 380 L 62 230 Z" />
              <path d="M 100 100 L 100 380" strokeDasharray="2 4" />
              <path d="M 60 170 L 140 170" strokeDasharray="2 4" />
              <path d="M 70 240 L 130 240" strokeDasharray="2 4" />
            </svg>
          </div>
          <div className="scan-line" />
          <button className="capture-btn" onClick={triggerCountdown}><span><i className="fa-solid fa-camera" /></span></button>
          <div className={`flash ${flashOn ? 'on' : ''}`} />
          <div className={`overlay ${countdown !== null ? 'active' : ''}`}>{countdown ?? 3}</div>
        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'loading'}>
        <TopBar title={t.reportLoadingTop} onBack={() => switchScreen('camera')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <div className="center-zone">
          <div className="loading-module panel">
            <div className="loading-spinner"><i className="fa-solid fa-crown" /></div>
            <div className="loading-copy">
              <div className="eyebrow">{t.reportLoadingEyebrow}</div>
              <h2>{t.reportLoadingTitle}</h2>
              <p>{t.reportLoadingDesc}</p>
              <div className="loading-steps">
                <div className="active"><i className="fa-solid fa-check" />{t.loadingStepProfile}</div>
                <div><i className="fa-solid fa-circle" />{t.loadingStepStyle}</div>
                <div><i className="fa-solid fa-circle" />{t.loadingStepScene}</div>
              </div>
            </div>
          </div>
        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'report'} className="report-screen">
        <TopBar title={t.reportTop} onBack={() => switchScreen('home')} onSettings={() => setSettingsOpen(true)} home homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <TakeawayQrFloat title={t.takeReport} description={t.takeReportDesc} scanLabel={t.scanToSave} closeLabel={t.closeQr} />
        <div className="report-page">
          <section className="report-block">
            <ReportHeading icon="fa-circle-user" title={t.reportFeature} />
            <div className="feature-layout">
              <div className="feature-profile-grid">
                {featureProfileCards.map((card) => (
                  <FeatureProfileCard card={card} key={card.title} />
                ))}
              </div>
              <SkinToneCard data={skinToneProfile} />
            </div>
          </section>

          <section className="report-block">
            <ReportHeading icon="fa-paintbrush" title={t.reportStyle} />
            <div className="style-report-card">
              <div className="style-left">
                <div className="style-verdict">
                  <span>{t.coreStyleLabel}</span>
                  <strong>优雅休闲风</strong>
                  <div>
                    <em>轻甜气质</em>
                    <em>日常休闲</em>
                    <em>柔和低饱和</em>
                  </div>
                </div>
                <div className="style-main-grid">
                  <div className="style-core-list">
                    <h3>{t.coreElements}</h3>
                    {reportStyleElements.map((item) => (
                      <div className="style-core-row" key={item.label}>
                        <b>{item.label}</b>
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="style-color-panel">
                    <h3>{t.recommendedColors}</h3>
                    <div className="compact-color-grid">
                      {reportColors.map((color) => (
                        <div className="style-color-card" key={color.name}>
                          <span
                            className="compact-color-swatch"
                            style={{ '--swatch': color.value } as CSSProperties}
                            aria-label={color.name}
                          />
                          <b>{color.name}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="occasion-box">
                  <b>{t.occasion}</b>
                  <strong>日常休闲（逛街 / 咖啡 / 短途出行）</strong>
                  <p>兼顾舒适度与精致感，适合日常高频穿着。</p>
                </div>
              </div>
            </div>
          </section>

          <section className="report-block">
            <ReportHeading icon="fa-bag-shopping" title={t.reportLooks} />
            <div className="report-look-grid">
              {recommendPlans.map((plan) => (
                <ReportLookCard key={plan.id} plan={plan} onTryOn={() => startPlanTryOn(plan.id)} t={t} />
              ))}
            </div>
          </section>

          <section className="report-block">
            <ReportHeading icon="fa-star" title={t.reportAdvice} />
            <div className="report-advice">
              <div className="advice-card tips">
                <h2><i className="fa-solid fa-star" /> {t.tipsTitle}</h2>
                {detailTips.map((item, index) => (
                  <div className="advice-row" key={item.name}>
                    <span>{index + 1}</span>
                    <div>
                      <b>{item.name}</b>
                      <p>{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="advice-card avoid">
                <h2><i className="fa-solid fa-circle-xmark" /> {t.avoidTitle}</h2>
                {avoidItems.map((item, index) => (
                  <div className="advice-row" key={item.name}>
                    <span>{index + 1}</span>
                    <div>
                      <b>{item.name}</b>
                      <p>{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'mall'} className="mall-screen">
        <TopBar title={t.mallTop} onBack={() => switchScreen('home')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <div className="mall-workbench">
          <section className="mall-top-row">
            <div className="mall-camera-card panel">
              <div className="mall-section-head">
                <span><i className="fa-solid fa-camera" /></span>
                <h2>{t.photoSection}</h2>
              </div>
              <div className={`mall-camera-preview ${mallPhotoReady ? 'ready' : ''}`}>
                {mallPhotoReady ? (
                  <div className="mall-avatar-preview">
                    <span />
                    <b>{t.photoReady}</b>
                  </div>
                ) : (
                  <div className="mall-camera-guide">
                    <i className="fa-solid fa-user" />
                    <p>{t.photoGuide}</p>
                  </div>
                )}
                {mallCaptureCountdown !== null && <div className="mall-countdown">{mallCaptureCountdown}</div>}
                <div className={`mall-flash ${mallFlashOn ? 'on' : ''}`} />
                <button className="mall-camera-button" onClick={startMallCapture} disabled={mallCaptureCountdown !== null}>
                  <i className="fa-solid fa-camera" /> {mallPhotoReady ? t.retake : t.takePhoto}
                </button>
              </div>
            </div>

            <div className="mall-select-card panel">
              <div className="mall-section-head">
                <span><i className="fa-solid fa-shirt" /></span>
                <h2>{t.selectTryOn}</h2>
              </div>
              <div className="mall-mode-tabs">
                <button className={mallMode === 'single' ? 'active' : ''} onClick={() => changeMallMode('single')}>{t.singleMode}</button>
                <button className={mallMode === 'free' ? 'active' : ''} onClick={() => changeMallMode('free')}>{t.freeMode}</button>
              </div>

              {mallMode === 'single' ? (
                <div className="mall-single-pick">
                  <MallPickSlot title={t.singleMode} product={singleProduct} active t={t} />
                </div>
              ) : (
                <div className="mall-free-slots">
                  <button className={`mall-slot-button ${activeSlot === 'top' ? 'active' : ''}`} onClick={() => changeMallSlot('top')}>
                    <MallPickSlot title={t.topSlot} product={topProduct} active={activeSlot === 'top'} t={t} />
                  </button>
                  <button className={`mall-slot-button ${activeSlot === 'bottom' ? 'active' : ''}`} onClick={() => changeMallSlot('bottom')}>
                    <MallPickSlot title={t.bottomSlot} product={bottomProduct} active={activeSlot === 'bottom'} t={t} />
                  </button>
                </div>
              )}

              <div className="mall-generate-row">
                <div>
                  <b>{mallSelectedItems.length ? `${t.selectedCount} ${mallSelectedItems.length} ${t.itemCountSuffix}` : t.pleaseSelectStyle}</b>
                </div>
                <button className="primary-btn compact" onClick={startMallTryOn} disabled={!mallPhotoReady || !mallSelectedItems.length}>
                  <i className="fa-solid fa-wand-magic-sparkles" /> {t.generateTryOn}
                </button>
              </div>
            </div>
          </section>

          <section className="mall-catalog-panel panel">
            <div className="mall-catalog-toolbar">
              <div className="mall-category-tabs">
                {localizedMallCategories.map((category) => (
                  <button className={category.id === mallActiveCategory ? 'active' : ''} key={category.id} onClick={() => changeMallCategory(category.id)}>
                    {category.name}
                  </button>
                ))}
              </div>
              <div className="mall-pager">
                <button onClick={() => setMallPage((page) => Math.max(0, page - 1))} disabled={mallPage === 0} aria-label={t.previousPage}><i className="fa-solid fa-chevron-left" /></button>
                <span>{mallPage + 1} / {mallTotalPages}</span>
                <button onClick={() => setMallPage((page) => Math.min(mallTotalPages - 1, page + 1))} disabled={mallPage >= mallTotalPages - 1} aria-label={t.nextPage}><i className="fa-solid fa-chevron-right" /></button>
              </div>
            </div>

            <div className="mall-product-grid">
              {mallPagedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={mallSelectedItems.some((item) => item.id === product.id)}
                  onClick={() => selectMallProduct(product)}
                  t={t}
                />
              ))}
            </div>
          </section>
        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'generating'}>
        <TopBar title={t.generatingTop} onBack={() => switchScreen(generationSource === 'recommend' ? 'report' : 'mall')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <div className="center-zone">
          <div className="generation-card panel">
            <div className="progress-ring"><span>{generationProgress}%</span></div>
            <div className="generation-copy">
              <div className="eyebrow">{t.generatingEyebrow}</div>
              <h2>{generationSource === 'recommend' ? t.generatingRecommend : t.generatingCustom}</h2>
              <p>{t.generatingDescPrefix} {generationPlans.length} {t.generatingDescSuffix}</p>
              <div className="stage-list">
                {generationStages.map((stage) => (
                  <div className={`stage-item ${generationProgress >= stage.threshold ? 'active' : ''}`} key={stage.key}>
                    <i className={`fa-solid ${generationProgress >= stage.threshold ? 'fa-check' : 'fa-circle'}`} />
                    <span>{t.generationStages[stage.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScreenShell>

      <ScreenShell active={screen === 'results'} className="results-screen">
        <TopBar title={t.resultsTop} onBack={() => switchScreen(generationSource === 'recommend' ? 'report' : 'mall')} onSettings={() => setSettingsOpen(true)} homeLabel={t.home} backLabel={t.back} settingsLabel={t.settings} />
        <TakeawayQrFloat title={t.takeResults} description={t.takeResultsDesc} scanLabel={t.scanToSave} closeLabel={t.closeQr} />
        <section className="result-studio">
          <aside className="result-strip">
            {results.map((result) => (
              <button className={`result-strip-item ${result.id === activeResult?.id ? 'active' : ''}`} key={result.id} onClick={() => selectResult(result.id)}>
                <img className="result-thumb" src={result.image} alt="" />
              </button>
            ))}
          </aside>

          <div className="result-stage">
            <div className="result-canvas-card">
              {activeResult && tryOnStatus === 'loading' && <TryOnLoading label={t.tryOnLoading} />}
              {activeResult && tryOnStatus !== 'loading' && <TryOnModel image={activeResult.image} />}
            </div>
          </div>

          <aside className="result-tools">
            <button className="tool-icon" onClick={() => appendDerivedResult('background')} aria-label={t.changeBackground}><BackgroundToolIcon /><span>{t.changeBackground}</span></button>
            <button className="tool-icon" onClick={() => appendDerivedResult('video')} aria-label={t.generateVideo}><VideoToolIcon /><span>{t.generateVideo}</span></button>
          </aside>
        </section>
      </ScreenShell>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={resetExperience} theme={theme} language={language} onThemeChange={setTheme} onLanguageChange={setLanguage} t={t} />
      <QrModal type={qrType} onClose={() => setQrType(null)} resultCount={results.length} t={t} />
      <ToastModal toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}

function ScreenShell({ active, className = '', children }: { active: boolean; className?: string; children: ReactNode }) {
  return <section className={`screen ${active ? 'active' : ''} ${className}`}>{children}</section>;
}

function ReportHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="report-heading">
      <span><i className={`fa-solid ${icon}`} /></span>
      <h2>{title}</h2>
    </div>
  );
}

function FeatureProfileCard({ card }: { card: FeatureProfileData }) {
  return (
    <article className="feature-profile-card">
      <div className={`feature-image-placeholder ${card.image ? 'has-image' : ''}`}>
        {card.image ? <img src={card.image} alt="" /> : <><i className={`fa-solid ${card.icon}`} /><span>参考图</span></>}
      </div>
      <div className="feature-card-copy">
        <h3>{card.title}</h3>
        {card.points.map((point) => (
          <p key={point}><i className="fa-solid fa-circle-check" />{point}</p>
        ))}
      </div>
    </article>
  );
}

function SkinToneCard({ data }: { data: SkinToneData }) {
  return (
    <article className="skin-tone-card">
      <h3>{data.title}</h3>
      <div className="skin-tone-content">
        <div className="skin-tone-section skin-tone-summary">
          <h4>人体色特征</h4>
          {data.traits.map((trait) => (
            <p className="skin-info-row" key={trait.label}>
              <b>{trait.label}</b>
              <span>{trait.value}</span>
            </p>
          ))}
        </div>
        <div className="skin-tone-section">
          <h4>色彩适配原则</h4>
          {data.rules.map((rule) => (
            <p className="skin-info-row" key={rule.label}>
              <b>{rule.label}</b>
              <span>{rule.value}</span>
            </p>
          ))}
        </div>
        <div className="skin-tone-section skin-tone-colors">
          <h4>推荐用色</h4>
          {data.colorGroups.map((group) => (
            <div className="skin-color-row" key={group.label}>
              <b>{group.label}</b>
              <div>
                {group.colors.map((color) => (
                  <span
                    className="skin-color-chip"
                    key={`${group.label}-${color.name}`}
                    style={{ '--swatch': color.value } as CSSProperties}
                    aria-label={color.name}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ReportLookCard({ plan, onTryOn, t }: { plan: OutfitPlan; onTryOn: () => void; t: typeof copy[Language] }) {
  const details = reportLookDetails[plan.id] ?? [];
  const detailLabelMap: Record<string, string> = {
    '上装': t.reportDetailLabels.top,
    '下装': t.reportDetailLabels.bottom,
    '单品': t.reportDetailLabels.item
  };
  return (
    <article className="report-look-card">
      <div className="report-look-image">
        <img src={lookImages[plan.id]} alt="" />
      </div>
      <div className="report-look-copy">
        <div className="report-look-title">
          <h3>{plan.name}：{plan.title}</h3>
        </div>
        <div className="report-look-lines">
          {details.map((detail) => (
            <p key={detail.label}><b>{detailLabelMap[detail.label] ?? detail.label}：</b>{detail.value}</p>
          ))}
          {details.length < 2 && <p aria-hidden="true" />}
        </div>
        <button className="primary-btn compact report-look-btn" onClick={onTryOn}><i className="fa-solid fa-wand-magic-sparkles" /> {t.tryOn}</button>
      </div>
    </article>
  );
}

function TakeawayQrFloat({ title, description, scanLabel, closeLabel }: { title: string; description: string; scanLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`takeaway-float ${open ? 'open' : ''}`}>
      {!open ? (
        <button className="takeaway-trigger" onClick={() => setOpen(true)}>
          <i className="fa-solid fa-qrcode" />
          <span>{scanLabel}</span>
        </button>
      ) : (
        <div className="takeaway-panel">
          <div className="takeaway-head">
            <b>{title}</b>
            <button onClick={() => setOpen(false)} aria-label={closeLabel}><i className="fa-solid fa-xmark" /></button>
          </div>
          <div className="takeaway-qr">QR</div>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

function HomeTopBar({ onSettings, t }: { onSettings: () => void; t: typeof copy[Language] }) {
  return (
    <div className="topbar home-nav">
      <div />
      <div />
      <button className="icon-btn" onClick={onSettings} aria-label={t.settings}><i className="fa-solid fa-gear" /></button>
    </div>
  );
}

function TopBar({
  title,
  onBack,
  onSettings,
  home,
  homeLabel,
  backLabel,
  settingsLabel
}: {
  title: string;
  onBack: () => void;
  onSettings: () => void;
  home?: boolean;
  homeLabel: string;
  backLabel: string;
  settingsLabel: string;
}) {
  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label={home ? homeLabel : backLabel}><i className={`fa-solid ${home ? 'fa-house' : 'fa-chevron-left'}`} /></button>
      <div className="topbar-title">{title}</div>
      <button className="icon-btn" onClick={onSettings} aria-label={settingsLabel}><i className="fa-solid fa-gear" /></button>
    </div>
  );
}

function SuitCard({ plan, featured = false }: { plan: OutfitPlan; featured?: boolean }) {
  return (
    <div className={`suit-card ${featured ? 'featured' : ''}`} style={{ '--tryon-inner': plan.innerColor, '--tryon-outer': plan.outerColor } as CSSProperties}>
      <div className="suit-art">
        {plan.composition.slice(0, 4).map((item, index) => (
          <span className={`piece piece-${index + 1}`} key={`${plan.id}-${item}`}><em>{item}</em></span>
        ))}
      </div>
      <div>
        <span>{plan.name}</span>
        <h3>{plan.title}</h3>
        <p>{plan.reason}</p>
        <div className="composition-line">{plan.composition.join(' / ')}</div>
      </div>
    </div>
  );
}

function PortraitLookCard({ plan, featured = false }: { plan: OutfitPlan; featured?: boolean }) {
  return (
    <article className={`portrait-look-card ${featured ? 'featured' : ''}`}>
      <div className="look-collage" style={{ '--tryon-inner': plan.innerColor, '--tryon-outer': plan.outerColor } as CSSProperties}>
        <span className="look-silhouette" />
        <span className="look-block block-main" />
        <span className="look-block block-soft" />
        <span className="look-block block-accent" />
      </div>
      <div className="look-copy">
        <span>{plan.name}</span>
        <h3>{plan.title}</h3>
        <p>{plan.reason}</p>
        <div className="look-meta">{plan.scene} · {plan.composition.slice(0, 3).join(' / ')}</div>
      </div>
    </article>
  );
}

function PlanTray({
  avatarReady,
  draftItems,
  savedPlans,
  trayOpen,
  currentPlan,
  generationCount,
  canSavePlan,
  onToggleOpen,
  onRemoveDraftItem,
  onClearDraft,
  onSavePlan,
  onRemoveSavedPlan,
  onGenerate
}: {
  avatarReady: boolean;
  draftItems: Product[];
  savedPlans: OutfitPlan[];
  trayOpen: boolean;
  currentPlan: OutfitPlan;
  generationCount: number;
  canSavePlan: boolean;
  onToggleOpen: () => void;
  onRemoveDraftItem: (productId: string) => void;
  onClearDraft: () => void;
  onSavePlan: () => void;
  onRemoveSavedPlan: (planId: string) => void;
  onGenerate: () => void;
}) {
  const ctaLabel = savedPlans.length > 1 ? `生成 ${savedPlans.length} 套试穿预览` : savedPlans.length === 1 ? '生成方案试穿预览' : '生成当前方案试穿预览';

  return (
    <div className="plan-tray panel">
      <div className="plan-tray-main">
        <div>
          <div className="eyebrow">CURRENT PLAN</div>
          <h2>{savedPlans.length ? `已保存 ${savedPlans.length} 套方案` : `${currentPlan.name} · 已选 ${draftItems.length}/4`}</h2>
          <p>{avatarReady ? '选择单品组成方案，保存多套后可统一生成试穿预览。' : '请先创建试穿形象，再选择款式生成预览。'}</p>
        </div>
        <div className="plan-actions">
          <button className="secondary-btn compact" onClick={onToggleOpen}><i className="fa-solid fa-layer-group" /> 查看已选</button>
          <button className="primary-btn compact" onClick={onGenerate} disabled={!avatarReady || generationCount === 0}><i className="fa-solid fa-wand-magic-sparkles" /> {ctaLabel}</button>
        </div>
      </div>

      {trayOpen && (
        <div className="plan-tray-detail">
          <div className="selected-row">
            <div>
              <b>{currentPlan.name}</b>
              <span>当前编辑 · {draftItems.length}/4 件</span>
            </div>
            <div className="row-actions">
              <button onClick={onSavePlan} disabled={!canSavePlan}>保存为方案</button>
              <button onClick={onClearDraft} disabled={!draftItems.length}>清空</button>
            </div>
          </div>
          <div className="chip-list">
            {!draftItems.length ? <span className="empty-hint">请从下方款式大图中选择单品。</span> : draftItems.map((item) => (
              <button className="selected-chip" key={item.id} onClick={() => onRemoveDraftItem(item.id)}>
                {item.typeName} · {item.name}<i className="fa-solid fa-xmark" />
              </button>
            ))}
          </div>
          {!!savedPlans.length && (
            <div className="saved-plan-list">
              {savedPlans.map((plan) => (
                <div className="saved-plan" key={plan.id}>
                  <span>{plan.name}</span>
                  <b>{plan.title}</b>
                  <em>{plan.items.length} 件</em>
                  <button onClick={() => onRemoveSavedPlan(plan.id)}><i className="fa-solid fa-xmark" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MallPickSlot({ title, product, active, t }: { title: string; product: Product | null; active?: boolean; t: typeof copy[Language] }) {
  const image = product ? getProductImage(product) : '';
  return (
    <div className={`mall-pick-slot ${active ? 'active' : ''} ${product ? 'filled' : ''}`}>
      <div className="mall-pick-image">
        {image ? <img src={image} alt="" /> : <i className="fa-solid fa-plus" />}
      </div>
      <div>
        <span>{title}</span>
        <b>{product?.name ?? t.waitSelect}</b>
        <p>{product ? product.typeName : t.chooseFromBelow}</p>
      </div>
    </div>
  );
}

function ProductCard({ product, selected, onClick, t }: { product: Product; selected: boolean; onClick: () => void; t: typeof copy[Language] }) {
  const image = getProductImage(product);
  return (
    <button className={`product-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <span className={`product-art ${image ? 'with-image' : ''}`} style={{ '--item-color': product.color } as CSSProperties}>
        {image ? <img src={image} alt="" /> : <i className={`fa-solid ${product.icon}`} />}
      </span>
      <span className="product-meta">
        <em>{product.typeName} · {getStyleWord(product)}</em>
        <b>{product.name}</b>
      </span>
      <span className="product-state">{selected ? t.selected : t.choose}</span>
    </button>
  );
}

function TryOnModel({ image }: { image: string }) {
  return <img className="result-model-image" src={image} alt="" />;
}

function BackgroundToolIcon() {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <path d="M56.96 700.864a32 32 0 0 1 43.136-13.632L512 900.864l105.408-54.592a32 32 0 0 1 29.44 56.768l-120.128 62.336a32 32 0 0 1-29.44 0l-426.624-221.376a32 32 0 0 1-13.632-43.136z m711.808-91.776a44.288 44.288 0 0 1 80.64 0 221.44 221.44 0 0 0 110.656 110.592 44.288 44.288 0 0 1 0 80.64 221.312 221.312 0 0 0-110.592 110.592 44.288 44.288 0 0 1-80.704 0 221.248 221.248 0 0 0-110.592-110.528 44.288 44.288 0 0 1 0-80.64 221.312 221.312 0 0 0 110.592-110.72zM56.96 497.28a32 32 0 0 1 43.072-13.632L512 697.28l116.608-60.48a32 32 0 0 1 29.44 56.832L526.72 761.728a32 32 0 0 1-29.44 0L70.72 540.352A32 32 0 0 1 56.96 497.28z m447.488-421.76a32.128 32.128 0 0 1 22.208 2.752l426.752 220.736a32 32 0 0 1 0.192 56.704L526.976 581.952a32.064 32.064 0 0 1-29.888 0L70.4 355.712a32 32 0 0 1 0.256-56.704l426.688-220.8 7.168-2.624z m419.456 408.128a32 32 0 1 1 29.44 56.704l-58.24 30.272a32 32 0 0 1-29.44-56.832l58.24-30.144zM154.368 327.68L512 517.376l357.696-189.632L512 142.72 154.368 327.68z" />
    </svg>
  );
}

function VideoToolIcon() {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <path d="M68.266667 170.666667a25.6 25.6 0 0 0-25.6 25.6v290.133333a25.6 25.6 0 0 0 25.6 25.6h34.133333a25.6 25.6 0 0 0 25.6-25.6V281.6a25.6 25.6 0 0 1 25.6-25.6h546.133333a25.6 25.6 0 0 1 25.6 25.6v460.8a25.6 25.6 0 0 1-25.6 25.6h-247.466666a25.6 25.6 0 0 0-25.6 25.6v34.133333a25.6 25.6 0 0 0 25.6 25.6h332.8a25.6 25.6 0 0 0 25.6-25.6v-133.76a17.066667 17.066667 0 0 1 24.704-15.232l108.928 54.442667a25.6 25.6 0 0 0 37.034666-22.912V313.728a25.6 25.6 0 0 0-37.034666-22.912l-108.928 54.485333A17.066667 17.066667 0 0 1 810.666667 330.026667V196.266667a25.6 25.6 0 0 0-25.6-25.6H68.266667zM810.666667 555.136V468.906667a25.6 25.6 0 0 1 14.165333-22.912l34.133333-17.066667a25.6 25.6 0 0 1 37.034667 22.912v120.405333a25.6 25.6 0 0 1-37.034667 22.912l-34.133333-17.066666A25.6 25.6 0 0 1 810.666667 555.093333zM58.709333 747.605333a23.466667 23.466667 0 0 1 0-44.544l88.106667-29.397333a23.466667 23.466667 0 0 0 14.848-14.848l29.397333-88.106667a23.466667 23.466667 0 0 1 44.544 0l29.397334 88.106667a23.466667 23.466667 0 0 0 14.848 14.848l88.106666 29.397333a23.466667 23.466667 0 0 1 0 44.544l-88.106666 29.397334a23.466667 23.466667 0 0 0-14.848 14.848l-29.397334 88.106666a23.466667 23.466667 0 0 1-44.544 0l-29.397333-88.106666a23.466667 23.466667 0 0 0-14.848-14.848l-88.106667-29.397334z" />
    </svg>
  );
}

function TryOnLoading({ label }: { label: string }) {
  return (
    <div className="tryon-loading">
      <div className="tryon-loading-ring"><i className="fa-solid fa-shirt" /></div>
      <h2>{label}</h2>
    </div>
  );
}

function SettingsModal({
  open,
  onClose,
  onReset,
  theme,
  language,
  onThemeChange,
  onLanguageChange,
  t
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  theme: ThemeMode;
  language: Language;
  onThemeChange: (theme: ThemeMode) => void;
  onLanguageChange: (language: Language) => void;
  t: typeof copy[Language];
}) {
  return (
    <div className={`modal ${open ? 'active' : ''}`}>
      <div className="modal-card settings-card">
        <div className="modal-head">
          <h3>{t.settings}</h3>
          <button className="icon-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="settings-grid">
          <div className="setting-item">
            <span>{t.currentAccount}</span>
            <b>Atelier Retail Demo</b>
          </div>
          <div className="setting-item">
            <span>{t.deviceInfo}</span>
            <b>{t.deviceValue}</b>
          </div>
          <div className="setting-item">
            <span>{t.theme}</span>
            <label className="setting-select">
              <select value={theme} onChange={(event) => onThemeChange(event.target.value as ThemeMode)}>
                {themeOptions.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down" />
            </label>
          </div>
          <div className="setting-item">
            <span>{t.language}</span>
            <label className="setting-select">
              <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
                {languageOptions.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down" />
            </label>
          </div>
          <button className="secondary-btn compact" onClick={onClose}><i className="fa-solid fa-shield-heart" /> {t.privacy}</button>
          <button className="primary-btn compact" onClick={onReset}><i className="fa-solid fa-right-from-bracket" /> {t.exitExperience}</button>
        </div>
      </div>
    </div>
  );
}

function QrModal({ type, onClose, resultCount, t }: { type: QrType | null; onClose: () => void; resultCount: number; t: typeof copy[Language] }) {
  const isProfile = type === 'profile';
  return (
    <div className={`modal ${type ? 'active' : ''}`}>
      <div className="modal-card qr-card">
        <div className="modal-head">
          <h3>{isProfile ? t.qrProfileTitle : t.qrResultTitle}</h3>
          <button className="icon-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="qr-box">
          <div className="qr">QR</div>
          <div>
            <div className="eyebrow">ATELIER TAKE AWAY</div>
            <h2>{isProfile ? t.qrProfilePacked : t.qrResultPacked}</h2>
            <p>{isProfile ? t.qrProfileDesc : `${t.qrResultDescPrefix} ${Math.max(resultCount, 1)} ${t.qrResultDescSuffix}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToastModal({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div className={`modal ${toast ? 'active' : ''}`}>
      <div className="modal-card toast-card">
        <div className="modal-head">
          <h3>{toast?.title}</h3>
          <button className="icon-btn" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <p>{toast?.content}</p>
      </div>
    </div>
  );
}

function suitToPlan(suit: Suit): OutfitPlan {
  const meta: Record<string, Pick<OutfitPlan, 'title' | 'reason' | 'composition'>> = {
    'suit-1': {
      title: '奶茶色针织套装',
      reason: 'V 领拉长脸型，收腰设计凸显沙漏曲线，柔色匹配小量感气质。',
      composition: ['V 领短款针织', '高腰 A 字裙', '玛丽珍鞋', '米色帆布包']
    },
    'suit-2': {
      title: '白衬衫 + 直筒裤',
      reason: '方领平衡圆形脸，高腰直筒裤优化比例，休闲中保留精致感。',
      composition: ['方领泡泡袖衬衫', '高腰直筒牛仔裤', '白色帆布鞋', '棕色细腰带']
    },
    'suit-3': {
      title: '雾霾蓝连衣裙',
      reason: 'V 领收腰连衣裙一站式解决搭配，雪纺面料增加灵动性。',
      composition: ['V 领雪纺连衣裙', '一字带凉鞋', '珍珠耳钉']
    }
  };
  const content = meta[suit.id];
  return {
    id: suit.id,
    name: suit.tag,
    title: content.title,
    scene: suit.scene,
    tone: '美学推荐',
    reason: content.reason,
    composition: content.composition,
    items: [],
    innerColor: suit.innerColor,
    outerColor: suit.outerColor
  };
}

function createPlanFromProducts(items: Product[], index: number): OutfitPlan {
  const colors = getTryOnColors(items);
  return {
    id: `custom-${index + 1}-${items.map((item) => item.id).join('-') || 'draft'}`,
    name: planNames[Math.min(index, 2)] ?? '方案',
    title: items.length ? items.map((item) => item.name).slice(0, 2).join(' + ') : '未选择款式',
    scene: items.length > 2 ? '完整造型' : '轻量搭配',
    tone: '自选方案',
    reason: '根据当前选择生成试穿预览，可继续在结果页调整背景与影像形式。',
    composition: items.map((item) => item.typeName),
    items,
    innerColor: colors.inner,
    outerColor: colors.outer
  };
}

function planToResult(plan: OutfitPlan): TryOnResult {
  return {
    id: `result-${plan.id}`,
    planId: plan.id,
    title: `${plan.name} · 原始试穿`,
    subtitle: `${plan.title} / ${plan.scene}`,
    kind: 'tryon',
    innerColor: plan.innerColor,
    outerColor: plan.outerColor,
    image: resultImages[plan.id] ?? getProductImage(plan.items[0]) ?? Object.values(resultImages)[0]
  };
}

function getTryOnColors(items: Product[]) {
  const inner = items.find((item) => item.type === 'inner' || item.type === 'dress') ?? items[0];
  const outer = items.find((item) => item.type === 'outerwear') ?? items[1] ?? items[0];
  return {
    inner: inner?.color ?? '#EADCCB',
    outer: outer?.color ?? '#8E4F51'
  };
}

function getStyleWord(product: Product) {
  const words: Record<Product['type'], string> = {
    inner: '柔和内搭',
    outerwear: '轮廓外套',
    dress: '优雅裙装',
    bottom: '比例修饰',
    shoes: '场景鞋履',
    bag: '精致包袋',
    accessory: '点睛配饰'
  };
  return words[product.type];
}

function getProductImage(product?: Product) {
  if (!product) return '';
  const pool = productImagePools[product.type];
  if (!pool.length) return '';
  const parts = product.id.split('-');
  const index = Number(parts[parts.length - 1] ?? 1) - 1;
  return pool[index % pool.length];
}

function readStoredOption<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  return allowed.includes(value as T) ? value as T : fallback;
}

export default App;
