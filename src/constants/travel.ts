// src/constants/travel.ts

/** 行程难度选项 */
export const difficultyOptions = [
  { key: 'easy', label: '轻松出行' },
  { key: 'medium', label: '强度适中' },
  { key: 'hard', label: '硬核挑战' }
];

/** 行程节点类型 */
export type SectionType = 'attraction' | 'transport' | 'hotel' | 'food' | 'shopping' | 'tips';

/** 各类型表单配置（整合颜色、图标、表单配置） */
export interface TypeConfig {
  // 基础信息
  label: string;
  icon: string;
  emoji: string;
  // 颜色配置
  dotColor: string;
  ringColor: string;
  color: string;
  bg: string;
  // 表单配置
  nameLabel: string;
  namePlaceholder: string;
  descPlaceholder: string;
  showTime: boolean;
  showLocation: boolean;
  showDualLocation: boolean;
  showImages: boolean;
  showTicket: boolean;
  showTransportMethod: boolean;
}

/** 类型配置映射（打卡地优先） */
export const typeConfigMap: Record<SectionType, TypeConfig> = {
  attraction: {
    label: '打卡地',
    icon: 'icon-attrac',
    emoji: '📍',
    dotColor: '#FF851B',
    ringColor: '#FFEADA',
    color: '#E65100',
    bg: '#FFF3E0',
    nameLabel: '打卡地',
    namePlaceholder: '如：杭州西湖',
    descPlaceholder: '写一点游玩攻略、注意事项...',
    showTime: true,
    showLocation: true,
    showDualLocation: false,
    showImages: true,
    showTicket: true,
    showTransportMethod: false,
  },
  transport: {
    label: '交通',
    icon: 'icon-bus',
    emoji: '🚄',
    dotColor: '#10B981',
    ringColor: '#E6F4EA',
    color: '#047857',
    bg: '#F0FDF4',
    nameLabel: '交通',
    namePlaceholder: '如：高铁 G7501',
    descPlaceholder: '备注交通时长、换乘信息等...',
    showTime: true,
    showLocation: false,
    showDualLocation: true,
    showImages: false,
    showTicket: false,
    showTransportMethod: true,
  },
  hotel: {
    label: '住宿',
    icon: 'icon-accom',
    emoji: '🏨',
    dotColor: '#8B5CF6',
    ringColor: '#F3E8FF',
    color: '#6D28D9',
    bg: '#F5F3FF',
    nameLabel: '住宿',
    namePlaceholder: '如：全季酒店·西湖店',
    descPlaceholder: '房型、入住体验、周边情况等...',
    showTime: true,
    showLocation: true,
    showDualLocation: false,
    showImages: true,
    showTicket: false,
    showTransportMethod: false,
  },
  food: {
    label: '美食',
    icon: 'icon-food',
    emoji: '🍜',
    dotColor: '#FF6F00',
    ringColor: '#FFEFE5',
    color: '#B45309',
    bg: '#FFF8E6',
    nameLabel: '美食',
    namePlaceholder: '如：外婆家·龙井船宴',
    descPlaceholder: '推荐菜品、人均消费、排队情况等...',
    showTime: true,
    showLocation: true,
    showDualLocation: false,
    showImages: true,
    showTicket: false,
    showTransportMethod: false,
  },
  shopping: {
    label: '购物',
    icon: 'icon-shop',
    emoji: '🛍️',
    dotColor: '#A855F7',
    ringColor: '#FAF5FF',
    color: '#7E22CE',
    bg: '#FAF5FF',
    nameLabel: '购物',
    namePlaceholder: '如：湖滨银泰 in77',
    descPlaceholder: '推荐店铺、购物体验、退税情况等...',
    showTime: true,
    showLocation: true,
    showDualLocation: false,
    showImages: true,
    showTicket: false,
    showTransportMethod: false,
  },
  tips: {
    label: '避坑',
    icon: 'icon-danger',
    emoji: '⚠️',
    dotColor: '#EF4444',
    ringColor: '#FFE5E5',
    color: '#B91C1C',
    bg: '#FEF2F2',
    nameLabel: '标题',
    namePlaceholder: '如：别在景区门口吃饭',
    descPlaceholder: '写下你的避坑经验...',
    showTime: false,
    showLocation: false,
    showDualLocation: false,
    showImages: false,
    showTicket: false,
    showTransportMethod: false,
  },
};

/** 攻略类型下拉选项（从 typeConfigMap 派生，打卡地优先） */
export const typeOptions = Object.entries(typeConfigMap)
  .map(([value, cfg]) => ({ label: cfg.label, value, icon: cfg.icon }));

/** 类型映射配置（兼容旧代码，从 typeConfigMap 派生） */
export const SECTION_MAP = Object.fromEntries(
  Object.entries(typeConfigMap).map(([key, cfg]) => [
    key,
    { label: cfg.label, icon: cfg.icon, dotColor: cfg.dotColor, ringColor: cfg.ringColor, color: cfg.color, bg: cfg.bg }
  ])
) as Record<SectionType, { label: string; icon: string; dotColor: string; ringColor: string; color: string; bg: string }>;

/** 交通方式列表 */
export const transportMethods = ['火车', '汽车', '地铁', '飞机', '轮船', '公交', '步行', '骑车'];

/** 购票渠道下拉选项 */
export const channelOptions = ['公众号', '小程序', '官方网站', '第三方平台', '线下 / 现场'];
