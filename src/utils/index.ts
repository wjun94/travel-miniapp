import { getSystemInfoSync, getMenuButtonBoundingClientRect } from '@tarojs/taro'

/** cdn图片域名地址 */
export function getImageCdnUrl(url: string): string {
  return url ? `${STATIC_BASE_URL}/photo-print/img/${url}?imageView2/1/w/750` : "";
}

/** 接口返回的图片域名地址 */
export function getImageUrl(url = "") {
  if (!url) return url;
  // 增加对微信本地临时路径（wxfile://）的判断，如果是本地路径则直接返回
  if (
    url.startsWith("photo-print/")
  ) {
    return `${STATIC_BASE_URL}/` + url + "?imageView2/1/w/750";
  }
  return url;
}

/** 获取状态栏 + 导航栏（含胶囊按钮）高度，避开右上角胶囊按钮 */
export function getHeaderHeight(): number {
  try {
    const info = getSystemInfoSync()
    const statusBarHeight = info.statusBarHeight || 20
    const menuButton = getMenuButtonBoundingClientRect()
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    return statusBarHeight + navBarHeight
  } catch {
    return 20 + 44 // H5 兜底：状态栏20px + 导航栏44px
  }
}
