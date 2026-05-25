import { suitData } from './catalog';

const topA = '/picture/top-a.jpg';
const topB = '/picture/top-b.jpg';
const topC = '/picture/top-c.jpg';
const skirtA = '/picture/skirt-a.jpg';
const skirtB = '/picture/skirt-b.jpg';
const pantsA = '/picture/pants-a.jpg';
const dressA = '/picture/dress-a.jpg';
const dressB = '/picture/dress-b.jpg';
const dressC = '/picture/dress-c.jpg';
const dressD = '/picture/dress-d.jpg';
export const bodyShapeImage = '/picture/body/x-shape.png';
export const faceShapeImage = '/picture/face/round-face.png';

export const lookImages: Record<string, string> = {
  'suit-1': topA,
  'suit-2': topB,
  'suit-3': topC
};

export const resultImages: Record<string, string> = {
  'suit-1': topA,
  'suit-2': topB,
  'suit-3': topC
};

export const productImagePools = {
  inner: [topA, topB, topC],
  outerwear: [topA, topB, topC],
  dress: [dressA, dressB, dressC, dressD],
  bottom: [skirtA, skirtB, pantsA],
  shoes: [],
  bag: [],
  accessory: []
};

export type MobileResultItem =
  | { id: string; type: 'image'; src: string; title: string }
  | { id: string; type: 'video'; src: string; title: string }
  | { id: string; type: 'loading'; title: string };

export const mobileResultItems: MobileResultItem[] = [
  { id: 'image-1', type: 'image' as const, src: topA, title: '轻通勤针织上装' },
  { id: 'image-2', type: 'image' as const, src: topB, title: '柔色休闲衬衫' },
  { id: 'video-1', type: 'video' as const, src: topC, title: '动态试穿预览' },
  { id: 'image-3', type: 'image' as const, src: dressA, title: '收腰连衣裙方案' },
  { id: 'image-4', type: 'image' as const, src: dressB, title: '优雅日常裙装' }
];

export const mobileReportData = {
  featureCards: [
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
  ],
  skinTone: {
    title: '肤色：春季型肤色',
    traits: [
      ['毛发', '棕色系'],
      ['眼睛', '眼珠呈棕色，眼白略带湖蓝色'],
      ['皮肤', '肤色偏白皙，脸颊带有珊瑚粉色红晕']
    ],
    rules: [
      ['明度', '中高'],
      ['纯度', '中高'],
      ['冷暖', '暖色']
    ],
    groups: [
      {
        label: '外套',
        colors: [
          { name: '浅灰', value: '#D8D8D2' },
          { name: '灰绿', value: '#A8B4A6' },
          { name: '卡其', value: '#C8B48D' }
        ]
      },
      {
        label: '内搭',
        colors: [
          { name: '浅蓝', value: '#BFD7EA' },
          { name: '米白', value: '#F9F7F4' },
          { name: '浅绿', value: '#CFE3C3' }
        ]
      },
      {
        label: '点缀',
        colors: [
          { name: '薄荷绿', value: '#BFE4D2' },
          { name: '亮黄', value: '#F5D44B' },
          { name: '橙黄', value: '#F0A64A' }
        ]
      }
    ]
  },
  style: {
    label: '你的核心风格',
    value: '优雅休闲风',
    tags: ['轻甜气质', '日常休闲', '柔和低饱和'],
    elements: [
      { label: '色彩', value: '低饱和柔色为主，奶茶色、雾霾蓝、米白色铺底，浅粉与薄荷绿少量点缀。' },
      { label: '版型', value: '短款针织衫、收腰衬衫、过膝 A 字裙、高腰直筒裤，重点保留腰线。' },
      { label: '面料', value: '针织、棉麻、雪纺等柔软触感面料，避免厚重硬挺造成压迫。' },
      { label: '配饰', value: '细链条项链、珍珠耳钉、皮质细腰带、帆布托特包，尺寸与小量感匹配。' }
    ],
    colors: [
      { name: '浅灰', value: '#D8D8D2' },
      { name: '卡其', value: '#C8B48D' },
      { name: '浅蓝', value: '#BFD7EA' },
      { name: '米白', value: '#F9F7F4' }
    ],
    occasion: {
      label: '场合适配',
      title: '日常休闲（逛街 / 咖啡 / 短途出行）',
      text: '兼顾舒适度与精致感，适合日常高频穿着。'
    }
  },
  outfits: [
    {
      title: suitData['suit-1'].name,
      image: lookImages['suit-1'],
      text: '奶茶色 V 领短款针织衫 + 同色系高腰 A 字半身裙，适合咖啡约会。'
    },
    {
      title: suitData['suit-2'].name,
      image: lookImages['suit-2'],
      text: '白色方领泡泡袖衬衫 + 浅蓝色高腰直筒牛仔裤，适合短途郊游。'
    },
    {
      title: suitData['suit-3'].name,
      image: lookImages['suit-3'],
      text: '雾霾蓝 V 领收腰雪纺连衣裙，适合闺蜜聚餐。'
    }
  ],
  tips: [
    { name: '强调腰线', reason: '选择收腰版型或细腰带，把视觉重心稳定在腰部。' },
    { name: '拉长颈部线条', reason: '优先 V 领、U 领、方领，让圆形脸更轻盈。' },
    { name: '控制面料厚度', reason: '选择轻薄、垂坠、柔软的面料，避免上半身厚重。' },
    { name: '配饰小而精', reason: '耳饰、项链、包袋选择小巧精致款，更协调。' }
  ],
  avoid: [
    { name: '高领和紧圆领', reason: '容易压缩颈部空间，让脸型显得更圆。' },
    { name: '无腰线宽松上衣', reason: '会掩盖腰部优势，让整体比例变得松散。' },
    { name: '厚重硬挺面料', reason: '硬挺廓形会增加量感，削弱轻盈和柔和气质。' },
    { name: '夸张大配饰', reason: '尺寸过大的配饰会压过五官，让整体不够精致。' }
  ]
};
