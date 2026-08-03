import { getWindowInfo, getMenuButtonBoundingClientRect } from '@tarojs/taro'
import dayjs from 'dayjs'

/** cdn图片域名地址 */
export function getImageCdnUrl(url: string): string {
  return url ? `${STATIC_BASE_URL}/travel/img/${url}?imageView2/1/w/750` : "";
}

/** 接口返回的图片域名地址 */
export function getImageUrl(url = "") {
  if (!url) return url;
  // 增加对微信本地临时路径（wxfile://）的判断，如果是本地路径则直接返回
  if (
    url.startsWith("travel/")
  ) {
    return `${STATIC_BASE_URL}/` + url + "?imageView2/1/w/750";
  }
  return url;
}

/**
 * 评论区友好时间格式化
 * @param {string | number | Date} originTime 原始时间（时间戳/字符串/Date）
 * @returns {string} 格式化文案
 */
export function formatTime(originTime) {
  if (!originTime) return ''
  const target = dayjs(originTime)
  const now = dayjs()

  const diffSecond = now.diff(target, 'second')
  const diffMinute = now.diff(target, 'minute')
  const diffDay = now.diff(target, 'day')

  // 1分钟内 → 刚刚
  if (diffSecond < 60) {
    return '刚刚'
  }

  // 1小时内 → X分钟前
  if (diffMinute < 60) {
    return `${diffMinute}分钟前`
  }

  // 当天 → 今天 时分
  if (target.isSame(now, 'day')) {
    return `今天 ${target.format('HH:mm')}`
  }

  // 昨天 → 昨天 时分
  if (diffDay === 1) {
    return `昨天 ${target.format('HH:mm')}`
  }

  // 7天以内 → N天前
  if (diffDay <= 7) {
    return `${diffDay}天前`
  }

  // 超过7天：同年 月日时分；跨年 年月日时分
  return target.isSame(now, 'year')
    ? target.format('MM-DD HH:mm')
    : target.format('YYYY-MM-DD HH:mm')
}

/** 获取状态栏 + 导航栏（含胶囊按钮）高度，避开右上角胶囊按钮 */
export function getHeaderHeight(): number {
  try {
    const info = getWindowInfo()
    const statusBarHeight = info.statusBarHeight || 20
    const menuButton = getMenuButtonBoundingClientRect()
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    return statusBarHeight + navBarHeight
  } catch {
    return 20 + 44 // H5 兜底：状态栏20px + 导航栏44px
  }
}
