export type CategoryId =
  | 'all'
  | 'inner'
  | 'outerwear'
  | 'dress'
  | 'bottom'
  | 'shoes'
  | 'bag'
  | 'accessory';

export type ProductType = Exclude<CategoryId, 'all'>;

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  typeName: string;
  icon: string;
  color: string;
}

export interface Suit {
  id: string;
  tag: string;
  name: string;
  scene: string;
  innerColor: string;
  outerColor: string;
}

export interface DiagnosisItem {
  mark: string;
  title: string;
  text: string;
}

export const suitData: Record<string, Suit> = {
  'suit-1': { id: 'suit-1', tag: 'LOOK 1', name: '奶茶色针织套装', scene: '咖啡约会', innerColor: '#D4B483', outerColor: '#F4E8D7' },
  'suit-2': { id: 'suit-2', tag: 'LOOK 2', name: '白衬衫 + 直筒裤', scene: '短途郊游', innerColor: '#F9F7F4', outerColor: '#BFD7EA' },
  'suit-3': { id: 'suit-3', tag: 'LOOK 3', name: '雾霾蓝连衣裙', scene: '闺蜜聚餐', innerColor: '#BFD7EA', outerColor: '#F9F7F4' }
};

export const diagnosis: DiagnosisItem[] = [
  { mark: '颜', title: '面部特征：小量感灵动型', text: '五官整体小巧精致，眼型偏圆、鼻头柔和，适配清新、甜美、温柔风。' },
  { mark: '脸', title: '脸型：圆形脸温柔款', text: '轮廓圆润、下颌线柔和，优先选择 V 领、U 领、方领拉长纵向比例。' },
  { mark: '形', title: '体型：X 型沙漏曲线', text: '肩宽与胯宽比例协调，腰部线条明显，穿搭核心是突出腰线与垂坠感。' },
  { mark: '格', title: '风格：优雅休闲 · 轻甜气质', text: '以低饱和柔色、柔软面料和小巧配饰，建立舒适但精致的日常形象。' },
  { mark: '境', title: '场合：逛街 / 咖啡 / 短途出行', text: '覆盖日常高频轻松场合，在舒适度、比例优化和照片表现之间取得平衡。' }
];

export const categories: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'inner', name: '内搭' },
  { id: 'outerwear', name: '外套' },
  { id: 'dress', name: '裙装' },
  { id: 'bottom', name: '下装' },
  { id: 'shoes', name: '鞋履' },
  { id: 'bag', name: '包袋' },
  { id: 'accessory', name: '配饰' }
];

const categoryMeta: Record<ProductType, { label: string; icon: string; colors: string[] }> = {
  inner: { label: '内搭', icon: 'fa-shirt', colors: ['#EADCCB', '#C4B8AD', '#F3E8DC', '#B9A899'] },
  outerwear: { label: '外套', icon: 'fa-vest', colors: ['#4B637B', '#8E4F51', '#9C7E5F', '#2F2924'] },
  dress: { label: '裙装', icon: 'fa-person-dress', colors: ['#D9C2C1', '#B8877F', '#EEE1D2', '#68798A'] },
  bottom: { label: '下装', icon: 'fa-socks', colors: ['#8D8178', '#D7CABF', '#4C5966', '#AA8F76'] },
  shoes: { label: '鞋履', icon: 'fa-shoe-prints', colors: ['#2F2924', '#B9A27D', '#7A5E50', '#D8D0C7'] },
  bag: { label: '包袋', icon: 'fa-bag-shopping', colors: ['#7A5E50', '#C5A880', '#2F2924', '#C8B6A4'] },
  accessory: { label: '配饰', icon: 'fa-gem', colors: ['#C5A880', '#D8D0C7', '#93A2AA', '#A68164'] }
};

const productNames: Record<ProductType, string[]> = {
  inner: ['法式重绉真丝连衣裙', '小立领香槟衬衫', '美利奴针织衫', '垂坠感丝缎背心', '精纺羊毛薄衫', '珍珠光泽罩衫', '高支棉衬衫', '柔雾针织上衣', '云感无袖内搭', '细罗纹羊绒衫', '丝棉混纺衬衫', '轻薄圆领针织'],
  outerwear: ['100% 双面呢羊毛大衣', '埃及长绒棉双排扣风衣', '廓形短款夹克', '精纺西装外套', '轻奢羊绒开衫', '立领羊毛短外套', '水波纹长大衣', '修身燕麦色风衣', '缎面收腰外套', '极简廓形西装', '柔雾绒面夹克', '长线条羊毛披肩'],
  dress: ['桑蚕丝半裙', '垂坠 A 字裙', '高腰直筒裙', '轻礼服连衣裙', '缎面茶歇裙', '廓形伞裙', '珍珠灰长裙', '斜裁真丝裙', '羊毛铅笔裙', '烟粉色中裙', '黑金小礼服', '湖蓝垂坠裙'],
  bottom: ['精纺直筒裤', '高腰阔腿裤', '羊毛烟管裤', '棉麻九分裤', '垂坠西装裤', '柔雾锥形裤', '褶裥长裤', '浅卡其长裤', '黑色礼服裤', '丝毛混纺裤', '米白休闲长裤', '细纹通勤裤'],
  shoes: ['细跟尖头鞋', '低跟玛丽珍鞋', '缎面浅口鞋', '羊皮乐福鞋', '珠光晚宴鞋', '短靴', '雾面高跟鞋', '金扣平底鞋', '裸色通勤鞋', '黑色缎带鞋', '杏色穆勒鞋', '柔皮芭蕾鞋'],
  bag: ['小号链条包', '结构感手提包', '珍珠扣手拿包', '通勤托特包', '皮革腋下包', '迷你晚宴包', '马鞍肩包', '柔软云朵包', '金属扣方包', '丝绒小包', '奶油色手袋', '复古口金包'],
  accessory: ['珍珠耳饰', '细金属腰带', '丝巾', '几何胸针', '轻量项链', '腕表', '发饰', '水晶耳夹', '窄版腰封', '金色手镯', '缎面发带', '小巧锁骨链']
};

export const products: Product[] = Object.entries(productNames).flatMap(([type, names]) => {
  const productType = type as ProductType;
  const meta = categoryMeta[productType];
  return names.map((name, index) => ({
    id: `${type}-${index + 1}`,
    name,
    type: productType,
    typeName: meta.label,
    icon: meta.icon,
    color: meta.colors[index % meta.colors.length]
  }));
});
