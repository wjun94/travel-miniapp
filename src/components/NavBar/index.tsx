import { View } from '@tarojs/components'
import { getHeaderHeight } from '@/utils'

interface NavBarProps {
  /** 背景色，默认 #FCFBF7 */
  backgroundColor?: string
  /** 自定义 class */
  className?: string
  /** 导航栏标题（可选） */
  title?: string
  /** 标题对齐方式，默认 center */
  titleAlign?: 'left' | 'center'
  /** 是否显示返回按钮 */
  showBack?: boolean
}

/** 自定义导航栏：占据状态栏 + 胶囊按钮区域高度，防止内容被遮挡 */
export default function NavBar({ backgroundColor = '#FCFBF7', className = '', title, titleAlign = 'center', showBack }: NavBarProps) {
  const headerHeight = getHeaderHeight()

  return (
    <View
      className={`sticky top-0 z-30 flex flex-row items-end box-border ${className}`}
      style={{
        height: headerHeight,
        backgroundColor,
        paddingBottom: 8,
        paddingLeft: showBack ? 12 : 0,
      }}
    >
      {showBack && (
        <View style={{ fontSize: 20, lineHeight: 1, marginRight: 8 }}>{'‹'}</View>
      )}
      {title && (
        <View style={{ fontSize: 16, fontWeight: 600, color: '#333', flex: 1, textAlign: titleAlign, marginRight: showBack ? 32 : 0 }}>
          {title}
        </View>
      )}
    </View>
  )
}
