import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type SeedCard = {
  name: string
  aliases: string[]
  arcana: string
  suit: string | null
  number: string
  uprightMeaning: string
  reversedMeaning: string
  description: string
  imageUrl: string
}

// Complete 78-card tarot deck adapted from Jiangween/tarot-app (MIT).
// Images point at the upstream raw GitHub assets to keep this demo lightweight.
const cards: SeedCard[] = [
  {
    name: "愚者",
    aliases: ["The Fool"],
    arcana: "major",
    suit: null,
    number: "0",
    uprightMeaning: "新的开始、冒险、纯真、自发性、自由精神",
    reversedMeaning: "鲁莽、不负责任、过度冒险、愚蠢、不切实际",
    description: "一个年轻人站在悬崖边缘，背着简单的行囊，怀抱着白玫瑰，身边有一只小狗。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheFool.png"
  },
  {
    name: "魔术师",
    aliases: ["The Magician"],
    arcana: "major",
    suit: null,
    number: "I",
    uprightMeaning: "创造力、技能、意志力、自信、主动性",
    reversedMeaning: "操纵、欺骗、才能误用、自我怀疑",
    description: "一位魔术师站在祭坛前，手持魔杖指向天空，桌上摆放着圣杯、宝剑、钱币和权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheMagician.png"
  },
  {
    name: "女祭司",
    aliases: ["The High Priestess"],
    arcana: "major",
    suit: null,
    number: "II",
    uprightMeaning: "直觉、神秘、内在知识、精神力量",
    reversedMeaning: "表面性、混乱、缺乏洞察力、隐藏的动机",
    description: "一位女祭司坐在两根柱子之间，膝上放着一本书，身后是一块帷幕。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheHighPriestess.png"
  },
  {
    name: "女皇",
    aliases: ["The Empress"],
    arcana: "major",
    suit: null,
    number: "III",
    uprightMeaning: "丰饶、创造力、母性、爱、自然",
    reversedMeaning: "依赖、过度保护、创造力受阻、自我怀疑",
    description: "一位华贵的女性坐在舒适的座椅上，周围是繁茂的花园。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheEmpress.png"
  },
  {
    name: "皇帝",
    aliases: ["The Emperor"],
    arcana: "major",
    suit: null,
    number: "IV",
    uprightMeaning: "权威、领导力、结构、稳定、父性",
    reversedMeaning: "专制、僵化、过度控制、无能",
    description: "一位威严的统治者坐在石头宝座上，手持权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheEmperor.png"
  },
  {
    name: "教皇",
    aliases: ["The Hierophant"],
    arcana: "major",
    suit: null,
    number: "V",
    uprightMeaning: "传统、精神指引、教育、信仰、道德",
    reversedMeaning: "叛逆、非传统的方法、过时的思想",
    description: "一位宗教领袖坐在两根柱子之间，手持权杖，两位信徒跪在他面前。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheHierophant.png"
  },
  {
    name: "恋人",
    aliases: ["The Lovers"],
    arcana: "major",
    suit: null,
    number: "VI",
    uprightMeaning: "爱情、和谐、关系、价值观、选择",
    reversedMeaning: "不和谐、失衡、错误的选择、价值观冲突",
    description: "一对年轻的恋人站在天使之下，象征着选择和结合。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheLovers.png"
  },
  {
    name: "战车",
    aliases: ["The Chariot"],
    arcana: "major",
    suit: null,
    number: "VII",
    uprightMeaning: "胜利、意志力、自我控制、决心、进步",
    reversedMeaning: "失控、阻碍、缺乏方向、侵略性",
    description: "一位战士站在由两只狮身人面兽拉动的战车上。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheChariot.png"
  },
  {
    name: "力量",
    aliases: ["Strength"],
    arcana: "major",
    suit: null,
    number: "VIII",
    uprightMeaning: "力量、勇气、耐心、温柔、自信",
    reversedMeaning: "软弱、自我怀疑、缺乏信心、滥用力量",
    description: "一位女性温柔地抚摸着一只狮子，展示内在的力量。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Strength.png"
  },
  {
    name: "隐士",
    aliases: ["The Hermit"],
    arcana: "major",
    suit: null,
    number: "IX",
    uprightMeaning: "内省、寻求真理、独处、指引、智慧",
    reversedMeaning: "孤独、隔离、退缩、迷失方向",
    description: "一位老者独自站在山顶，手持明灯，寻求智慧。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheHermit.png"
  },
  {
    name: "命运之轮",
    aliases: ["Wheel of Fortune"],
    arcana: "major",
    suit: null,
    number: "X",
    uprightMeaning: "命运、转折点、机会、变化、进展",
    reversedMeaning: "厄运、阻碍、不良的变化、外部控制",
    description: "一个巨大的轮盘在转动，象征着命运的循环。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/WheelOfFortune.png"
  },
  {
    name: "正义",
    aliases: ["Justice"],
    arcana: "major",
    suit: null,
    number: "XI",
    uprightMeaning: "正义、公平、真理、因果、平衡",
    reversedMeaning: "不公、失衡、不诚实、否认",
    description: "一位手持天平和剑的女性形象，象征着公平与正义。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Justice.png"
  },
  {
    name: "倒吊人",
    aliases: ["The Hanged Man"],
    arcana: "major",
    suit: null,
    number: "XII",
    uprightMeaning: "牺牲、暂停、新视角、放下、智慧",
    reversedMeaning: "拖延、抵抗、无用的牺牲",
    description: "一个人倒挂在树上，但表情平静，象征着牺牲和洞察。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheHangedMan.png"
  },
  {
    name: "死神",
    aliases: ["Death"],
    arcana: "major",
    suit: null,
    number: "XIII",
    uprightMeaning: "结束、转变、蜕变、新生",
    reversedMeaning: "停滞、抗拒改变、无法放下",
    description: "骑在白马上的死神，象征着结束和新生。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Death.png"
  },
  {
    name: "节制",
    aliases: ["Temperance"],
    arcana: "major",
    suit: null,
    number: "XIV",
    uprightMeaning: "平衡、节制、耐心、调和、适度",
    reversedMeaning: "失衡、过度、冲突、缺乏耐心",
    description: "一位天使在两个杯子之间倾倒液体，象征着平衡与融合。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Temperance.png"
  },
  {
    name: "恶魔",
    aliases: ["The Devil"],
    arcana: "major",
    suit: null,
    number: "XV",
    uprightMeaning: "束缚、欲望、执着、物质主义",
    reversedMeaning: "释放、觉醒、摆脱束缚",
    description: "恶魔坐在王座上，两个人被锁链束缚。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheDevil.png"
  },
  {
    name: "塔",
    aliases: ["The Tower"],
    arcana: "major",
    suit: null,
    number: "XVI",
    uprightMeaning: "突变、崩塌、启示、解放",
    reversedMeaning: "避免灾难、渐进的改变",
    description: "一座高塔被闪电击中，人们从塔上坠落。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheTower.png"
  },
  {
    name: "星星",
    aliases: ["The Star"],
    arcana: "major",
    suit: null,
    number: "XVII",
    uprightMeaning: "希望、启发、宁静、更新",
    reversedMeaning: "失望、缺乏信心、悲观",
    description: "一位女子在星空下倾倒水罐，象征着希望与启发。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheStar.png"
  },
  {
    name: "月亮",
    aliases: ["The Moon"],
    arcana: "major",
    suit: null,
    number: "XVIII",
    uprightMeaning: "直觉、幻想、恐惧、潜意识",
    reversedMeaning: "困惑、欺骗、隐藏的敌人",
    description: "月亮照耀着一条通向远方的路，两只狗在月下嚎叫。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheMoon.png"
  },
  {
    name: "太阳",
    aliases: ["The Sun"],
    arcana: "major",
    suit: null,
    number: "XIX",
    uprightMeaning: "快乐、成功、活力、光明",
    reversedMeaning: "暂时的快乐、过度乐观",
    description: "太阳照耀着一个骑马的孩子，象征着纯真与喜悦。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheSun.png"
  },
  {
    name: "审判",
    aliases: ["Judgement"],
    arcana: "major",
    suit: null,
    number: "XX",
    uprightMeaning: "重生、觉醒、救赎、召唤",
    reversedMeaning: "自我怀疑、错过机会",
    description: "天使吹响号角，人们从棺材中复活。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Judgement.png"
  },
  {
    name: "世界",
    aliases: ["The World"],
    arcana: "major",
    suit: null,
    number: "XXI",
    uprightMeaning: "完成、整合、成就、旅程",
    reversedMeaning: "未完成、停滞、拖延",
    description: "一位舞者在四个生物环绕的花环中跳舞。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/TheWorld.png"
  },
  {
    name: "权杖王牌",
    aliases: ["Ace of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Ace",
    uprightMeaning: "新的开始、灵感、创造力、潜力",
    reversedMeaning: "延迟、创意受阻、缺乏动力",
    description: "一只手从云中伸出，握着一根开花的权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands01.png"
  },
  {
    name: "权杖二",
    aliases: ["Two of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Two",
    uprightMeaning: "规划、决策、未来展望、进展",
    reversedMeaning: "犹豫不决、缺乏规划、恐惧前进",
    description: "一个人站在城堡顶端，手持权杖，眺望远方。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands02.png"
  },
  {
    name: "权杖三",
    aliases: ["Three of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Three",
    uprightMeaning: "扩展、机会、探索、贸易",
    reversedMeaning: "障碍、延迟、失去机会",
    description: "一个人背对观者，望着远处的船只。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands03.png"
  },
  {
    name: "权杖四",
    aliases: ["Four of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Four",
    uprightMeaning: "庆祝、和谐、家庭、完成",
    reversedMeaning: "不安、过渡期、缺乏支持",
    description: "装饰着花环的四根权杖，下方是庆祝的人群。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands04.png"
  },
  {
    name: "权杖五",
    aliases: ["Five of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Five",
    uprightMeaning: "竞争、冲突、挑战、争论",
    reversedMeaning: "避免冲突、协调、和解",
    description: "五个年轻人用权杖互相打斗。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands05.png"
  },
  {
    name: "权杖六",
    aliases: ["Six of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Six",
    uprightMeaning: "胜利、成功、公众认可、自信",
    reversedMeaning: "自负、傲慢、失去支持",
    description: "一位骑士胜利地骑马前进，周围是欢呼的人群。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands06.png"
  },
  {
    name: "权杖七",
    aliases: ["Seven of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Seven",
    uprightMeaning: "防御、坚持、挑战、勇气",
    reversedMeaning: "压力、退缩、放弃立场",
    description: "一个人站在高处，用权杖抵御下方的攻击。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands07.png"
  },
  {
    name: "权杖八",
    aliases: ["Eight of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Eight",
    uprightMeaning: "快速行动、进展、消息、旅行",
    reversedMeaning: "延迟、受阻、内部冲突",
    description: "八根权杖在空中飞行。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands08.png"
  },
  {
    name: "权杖九",
    aliases: ["Nine of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Nine",
    uprightMeaning: "坚持、防御、毅力、最后的努力",
    reversedMeaning: "精疲力竭、放弃、缺乏耐力",
    description: "一个受伤的人警惕地守护着八根权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands09.png"
  },
  {
    name: "权杖十",
    aliases: ["Ten of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Ten",
    uprightMeaning: "负担、责任、压力、完成",
    reversedMeaning: "压力过大、放下负担、委托他人",
    description: "一个人背负着十根沉重的权杖艰难前行。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands10.png"
  },
  {
    name: "权杖侍从",
    aliases: ["Page of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Page",
    uprightMeaning: "探索、热情、发现、可能性",
    reversedMeaning: "缺乏方向、优柔寡断、坏消息",
    description: "一个年轻人热情地举着一根开花的权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands11.png"
  },
  {
    name: "权杖骑士",
    aliases: ["Knight of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Knight",
    uprightMeaning: "行动、冒险、热情、冲动",
    reversedMeaning: "鲁莽、急躁、缺乏耐心",
    description: "一位骑士骑着奔腾的马，手持权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands12.png"
  },
  {
    name: "权杖王后",
    aliases: ["Queen of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "Queen",
    uprightMeaning: "自信、热情、独立、社交能力",
    reversedMeaning: "专横、要求过高、情绪化",
    description: "一位充满活力的女性坐在王座上，手持权杖，身边有一只黑猫。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands13.png"
  },
  {
    name: "权杖国王",
    aliases: ["King of Wands"],
    arcana: "minor",
    suit: "wands",
    number: "King",
    uprightMeaning: "领导力、远见、创造力、魅力",
    reversedMeaning: "专制、傲慢、脾气暴躁",
    description: "一位充满魅力的国王坐在王座上，手持开花的权杖。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Wands14.png"
  },
  {
    name: "圣杯王牌",
    aliases: ["Ace of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Ace",
    uprightMeaning: "新的感情、直觉、灵感、爱的开始",
    reversedMeaning: "情感封闭、创意受阻、新关系的错失",
    description: "一只手从云中伸出，托着一个溢出水的圣杯。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups01.png"
  },
  {
    name: "圣杯二",
    aliases: ["Two of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Two",
    uprightMeaning: "伙伴关系、爱情、和谐、吸引力",
    reversedMeaning: "关系破裂、不和谐、缺乏平衡",
    description: "一对男女交换圣杯，象征着结合与承诺。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups02.png"
  },
  {
    name: "圣杯三",
    aliases: ["Three of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Three",
    uprightMeaning: "庆祝、友谊、欢乐、群体活动",
    reversedMeaning: "过度放纵、排外、社交倦怠",
    description: "三个女子举杯庆祝，象征着欢乐与友谊。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups03.png"
  },
  {
    name: "圣杯四",
    aliases: ["Four of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Four",
    uprightMeaning: "沉思、倦怠、重新评估、不满足",
    reversedMeaning: "新机会、觉醒、接受现实",
    description: "一个人坐在树下沉思，面前有三个杯子，一只手从云中递出第四个杯子。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups04.png"
  },
  {
    name: "圣杯五",
    aliases: ["Five of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Five",
    uprightMeaning: "失望、遗憾、悲伤、失去",
    reversedMeaning: "接受、前进、找到希望",
    description: "一个人披着黑斗篷，注视着三个倒下的杯子，背后还有两个直立的杯子。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups05.png"
  },
  {
    name: "圣杯六",
    aliases: ["Six of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Six",
    uprightMeaning: "怀旧、童年记忆、纯真、给予",
    reversedMeaning: "沉溺过去、停滞不前、天真",
    description: "两个孩子在花园中，一个给另一个递花。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups06.png"
  },
  {
    name: "圣杯七",
    aliases: ["Seven of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Seven",
    uprightMeaning: "选择、幻想、机会、梦想",
    reversedMeaning: "现实、清醒、做出选择",
    description: "七个杯子漂浮在云中，每个杯子里都有不同的幻象。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups07.png"
  },
  {
    name: "圣杯八",
    aliases: ["Eight of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Eight",
    uprightMeaning: "放下、转变、寻求更深的意义",
    reversedMeaning: "恐惧改变、安于现状、徘徊不前",
    description: "一个人在月光下离开八个摆放整齐的杯子。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups08.png"
  },
  {
    name: "圣杯九",
    aliases: ["Nine of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Nine",
    uprightMeaning: "满足、愿望成真、幸福、满足感",
    reversedMeaning: "物质主义、空虚、过度放纵",
    description: "一个满足的人坐在九个圣杯前面，象征着愿望实现。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups09.png"
  },
  {
    name: "圣杯十",
    aliases: ["Ten of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Ten",
    uprightMeaning: "家庭和谐、完美的爱、持久的幸福",
    reversedMeaning: "破碎的家庭、不和谐、价值观冲突",
    description: "一对夫妇和孩子在彩虹下欢庆，象征着完美的家庭幸福。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups10.png"
  },
  {
    name: "圣杯侍从",
    aliases: ["Page of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Page",
    uprightMeaning: "感性、创意、直觉、新的感情",
    reversedMeaning: "情感不成熟、幻想、缺乏创意",
    description: "一个年轻人凝视着杯中跃出的鱼，象征着感情的开始。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups11.png"
  },
  {
    name: "圣杯骑士",
    aliases: ["Knight of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Knight",
    uprightMeaning: "浪漫、魅力、追求理想、艺术气质",
    reversedMeaning: "情感欺骗、虚幻的承诺、失望",
    description: "一位骑士骑着白马，优雅地捧着圣杯前行。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups12.png"
  },
  {
    name: "圣杯王后",
    aliases: ["Queen of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "Queen",
    uprightMeaning: "同理心、关怀、直觉、情感智慧",
    reversedMeaning: "情感依赖、直觉混乱、情绪化",
    description: "一位温柔的女性坐在海边的王座上，凝视着精美的圣杯。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups13.png"
  },
  {
    name: "圣杯国王",
    aliases: ["King of Cups"],
    arcana: "minor",
    suit: "cups",
    number: "King",
    uprightMeaning: "情感平衡、同理心、智慧、外交手腕",
    reversedMeaning: "情感操纵、缺乏同理心、冷漠",
    description: "一位成熟的国王坐在汹涌的海面上，平静地手持圣杯。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Cups14.png"
  },
  {
    name: "宝剑王牌",
    aliases: ["Ace of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Ace",
    uprightMeaning: "突破、清晰、真理、胜利、新思维",
    reversedMeaning: "混乱、缺乏清晰度、破坏性想法",
    description: "一只手从云中伸出，握着一把宝剑，剑尖上戴着王冠。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords01.png"
  },
  {
    name: "宝剑二",
    aliases: ["Two of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Two",
    uprightMeaning: "选择、平衡、决策、僵局",
    reversedMeaning: "优柔寡断、开放、紧张释放",
    description: "一位蒙眼女子手持两把交叉的剑，背景是海洋和满月。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords02.png"
  },
  {
    name: "宝剑三",
    aliases: ["Three of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Three",
    uprightMeaning: "心碎、悲伤、痛苦、背叛",
    reversedMeaning: "恢复、宽恕、释放痛苦",
    description: "三把剑刺穿一颗红心，背景是暴风雨的天空。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords03.png"
  },
  {
    name: "宝剑四",
    aliases: ["Four of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Four",
    uprightMeaning: "休息、恢复、冥想、撤退",
    reversedMeaning: "焦虑、不安、重返生活",
    description: "一位骑士躺在石棺上休息，头顶悬挂着一把剑。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords04.png"
  },
  {
    name: "宝剑五",
    aliases: ["Five of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Five",
    uprightMeaning: "冲突、失败、羞辱、不公平竞争",
    reversedMeaning: "和解、放下、重新开始",
    description: "一个人得意地收集战利品，而失败者黯然离去。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords05.png"
  },
  {
    name: "宝剑六",
    aliases: ["Six of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Six",
    uprightMeaning: "过渡、离开、移动、治愈",
    reversedMeaning: "停滞、无法前进、过去的包袱",
    description: "一个船夫载着乘客渡过平静的水面，船上插着六把剑。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords06.png"
  },
  {
    name: "宝剑七",
    aliases: ["Seven of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Seven",
    uprightMeaning: "欺骗、策略、秘密行动",
    reversedMeaning: "坦白、后悔、被发现",
    description: "一个人偷偷携带五把剑离开营地，留下两把剑。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords07.png"
  },
  {
    name: "宝剑八",
    aliases: ["Eight of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Eight",
    uprightMeaning: "束缚、限制、受困、自我设限",
    reversedMeaning: "释放、新视角、自由",
    description: "一位被蒙眼绑住的女子被八把剑围绕。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords08.png"
  },
  {
    name: "宝剑九",
    aliases: ["Nine of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Nine",
    uprightMeaning: "焦虑、噩梦、忧虑、精神压力",
    reversedMeaning: "希望、释放恐惧、走出阴霾",
    description: "一个人在夜晚惊醒，九把剑挂在墙上。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords09.png"
  },
  {
    name: "宝剑十",
    aliases: ["Ten of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Ten",
    uprightMeaning: "结束、失败、痛苦、新的开始",
    reversedMeaning: "恢复、重生、解脱",
    description: "一个人倒在地上，背上插着十把剑，远处黎明将至。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords10.png"
  },
  {
    name: "宝剑侍从",
    aliases: ["Page of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Page",
    uprightMeaning: "好奇心、敏锐、观察、新想法",
    reversedMeaning: "仓促行动、缺乏准备、轻率",
    description: "一个年轻人站在风中，高举宝剑观察。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords11.png"
  },
  {
    name: "宝剑骑士",
    aliases: ["Knight of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Knight",
    uprightMeaning: "行动迅速、果断、智慧、勇气",
    reversedMeaning: "鲁莽、攻击性、不计后果",
    description: "一位骑士骑着战马冲锋，手持宝剑。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords12.png"
  },
  {
    name: "宝剑王后",
    aliases: ["Queen of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "Queen",
    uprightMeaning: "独立、清晰、智慧、直接",
    reversedMeaning: "刻薄、苦涩、冷酷",
    description: "一位独立的女性坐在王座上，手持宝剑指向天空。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords13.png"
  },
  {
    name: "宝剑国王",
    aliases: ["King of Swords"],
    arcana: "minor",
    suit: "swords",
    number: "King",
    uprightMeaning: "理性、权威、真理、正义",
    reversedMeaning: "滥用权力、残酷、独裁",
    description: "一位威严的国王坐在王座上，手持直立的宝剑。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Swords14.png"
  },
  {
    name: "钱币王牌",
    aliases: ["Ace of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Ace",
    uprightMeaning: "新的机会、繁荣、物质回报、实际的开始",
    reversedMeaning: "错失机会、物质损失、贪婪",
    description: "一只手从云中伸出，托着一枚金币，下方是一座美丽的花园。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles01.png"
  },
  {
    name: "钱币二",
    aliases: ["Two of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Two",
    uprightMeaning: "平衡、适应性、时间管理、优先级",
    reversedMeaning: "失衡、混乱、压力过大",
    description: "一个人在杂耍般地平衡两枚钱币，背景是波涛汹涌的海洋。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles02.png"
  },
  {
    name: "钱币三",
    aliases: ["Three of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Three",
    uprightMeaning: "团队合作、技能、认可、学习",
    reversedMeaning: "缺乏合作、粗心、低质量",
    description: "三个人在教堂中讨论建筑计划，象征着合作与专业技能。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles03.png"
  },
  {
    name: "钱币四",
    aliases: ["Four of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Four",
    uprightMeaning: "安全感、保守、占有、控制",
    reversedMeaning: "贪婪、失去安全感、放手",
    description: "一个人紧紧抱着一枚钱币，脚下和头顶各放着钱币。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles04.png"
  },
  {
    name: "钱币五",
    aliases: ["Five of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Five",
    uprightMeaning: "困难、贫困、孤立、健康问题",
    reversedMeaning: "恢复、帮助、精神富足",
    description: "两个贫困的人在风雪中经过教堂彩窗。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles05.png"
  },
  {
    name: "钱币六",
    aliases: ["Six of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Six",
    uprightMeaning: "慷慨、分享、接受帮助、公平",
    reversedMeaning: "自私、债务、不平等",
    description: "一个富人施舍钱币给跪着的穷人，手中持着天平。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles06.png"
  },
  {
    name: "钱币七",
    aliases: ["Seven of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Seven",
    uprightMeaning: "评估、耐心、投资、努力的回报",
    reversedMeaning: "缺乏进展、工作无果、重新评估",
    description: "一个园丁靠在锄头上，观察他种植的作物。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles07.png"
  },
  {
    name: "钱币八",
    aliases: ["Eight of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Eight",
    uprightMeaning: "技能提升、专注、细节、勤奋",
    reversedMeaning: "完美主义、缺乏动力、低质量工作",
    description: "一个工匠专注地雕刻钱币，象征着技艺的精进。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles08.png"
  },
  {
    name: "钱币九",
    aliases: ["Nine of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Nine",
    uprightMeaning: "独立、奢华、自律、成就",
    reversedMeaning: "虚荣、物质依赖、失去独立",
    description: "一位优雅的女士站在丰收的花园中，手上栖息着一只猎鹰。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles09.png"
  },
  {
    name: "钱币十",
    aliases: ["Ten of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Ten",
    uprightMeaning: "财富、家族、传承、安全",
    reversedMeaning: "家族问题、财产损失、不安全感",
    description: "一个富有的家庭在城堡前，周围有狗和仆人。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles10.png"
  },
  {
    name: "钱币侍从",
    aliases: ["Page of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Page",
    uprightMeaning: "学习、新机会、务实、勤奋",
    reversedMeaning: "缺乏目标、懒惰、机会浪费",
    description: "一个年轻人专注地研究手中的钱币。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles11.png"
  },
  {
    name: "钱币骑士",
    aliases: ["Knight of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Knight",
    uprightMeaning: "可靠、勤勉、耐心、保守",
    reversedMeaning: "停滞、完美主义、工作狂",
    description: "一位骑士骑在静止的马上，仔细端详手中的钱币。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles12.png"
  },
  {
    name: "钱币王后",
    aliases: ["Queen of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "Queen",
    uprightMeaning: "富足、实用、滋养、慷慨",
    reversedMeaning: "物质主义、自私、嫉妒",
    description: "一位富有的女性坐在繁茂的花园中，怀抱一枚金币。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles13.png"
  },
  {
    name: "钱币国王",
    aliases: ["King of Pentacles"],
    arcana: "minor",
    suit: "pentacles",
    number: "King",
    uprightMeaning: "富有、实业家、稳定、可靠",
    reversedMeaning: "贪婪、物质执着、缺乏远见",
    description: "一位成功的国王坐在王座上，周围是繁荣的景象。",
    imageUrl: "https://raw.githubusercontent.com/Jiangween/tarot-app/main/data/tarot/cards/Pentacles14.png"
  }
]

async function main() {
  for (const card of cards) {
    const { aliases, ...data } = card
    const existing = await prisma.tarotCard.findUnique({
      where: { name: data.name }
    }) ?? await prisma.tarotCard.findFirst({
      where: {
        name: {
          in: aliases
        }
      }
    })

    if (existing) {
      await prisma.tarotCard.update({
        where: { id: existing.id },
        data
      })
    } else {
      await prisma.tarotCard.create({ data })
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})
