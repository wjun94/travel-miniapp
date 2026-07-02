// src/constants/travel.ts

/** 行程难度选项 */
export const difficultyOptions = [
  { key: 'easy', label: '轻松出行' },
  { key: 'medium', label: '强度适中' },
  { key: 'hard', label: '硬核挑战' }
];

/** 攻略类型下拉选项 */
export const typeOptions = [
  { label: '景点', value: 'attraction', icon: 'icon-attrac' },
  { label: '交通', value: 'transport', icon: 'icon-bus' },
  { label: '住宿', value: 'hotel', icon: 'icon-accom' },
  { label: '美食', value: 'food', icon: 'icon-food' },
  { label: '购物', value: 'shopping', icon: 'icon-shop' },
  { label: '避坑', value: 'tips', icon: 'icon-danger' }
];

/** 类型映射配置 */
export const SECTION_MAP = {
  attraction: {
    label: '景点',
    icon: 'icon-attrac',
    dotColor: '#FF851B',
    ringColor: '#FFEADA',
    color: '#E65100',
    bg: '#FFF3E0'
  },
  transport: {
    label: '交通',
    icon: 'icon-bus',
    dotColor: '#10B981',
    ringColor: '#E6F4EA',
    color: '#047857',
    bg: '#F0FDF4'
  },
  food: {
    label: '餐饮',
    icon: 'icon-food',
    dotColor: '#FF6F00',
    ringColor: '#FFEFE5',
    color: '#B45309',
    bg: '#FFF8E6'
  },
  hotel: {
    label: '住宿',
    icon: 'icon-accom',
    dotColor: '#8B5CF6',
    ringColor: '#F3E8FF',
    color: '#6D28D9',
    bg: '#F5F3FF'
  },
  shopping: {
    label: '购物',
    icon: 'icon-shop',
    dotColor: '#A855F7',
    ringColor: '#FAF5FF',
    color: '#7E22CE',
    bg: '#FAF5FF'
  },
  tips: {
    label: '避坑',
    icon: 'icon-danger',
    dotColor: '#EF4444',
    ringColor: '#FFE5E5',
    color: '#B91C1C',
    bg: '#FEF2F2'
  },
};

/** 购票渠道下拉选项 */
export const channelOptions = ['公众号', '小程序', '官方网站', '第三方平台', '线下 / 现场'];