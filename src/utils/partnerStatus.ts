/**
 * 搭子状态徽标统一样式（partner/detail、notes、partner/list 共用）
 * 背景一律使用具体色值 + 白色文字，避免各页面样式漂移
 */

/** 搭子状态文案 → 背景色（具体色值） */
export const PARTNER_STATUS_COLORS: Record<string, string> = {
  草稿: '#F59E0B',
  仅自己可见: '#6B7280',
  招募中: '#10B981',
  已满员: '#6B7280',
  已解散: '#F43F5E',
  已过期: '#6B7280',
  行程结束: '#6B7280',
}

/** 搭子状态徽标统一外观（白色文字胶囊） */
export const PARTNER_STATUS_BADGE_CLASS =
  'text-white text-[20px] px-2.5 py-0.5 rounded-full font-medium shadow-sm backdrop-blur-md'

/** 按状态文案取背景色（未知文案兜底灰色） */
export const getPartnerStatusColor = (label: string): string =>
  PARTNER_STATUS_COLORS[label] || '#6B7280'
