import { View, Text } from '@tarojs/components'
import { getHeaderHeight, getImageCdnUrl } from '@/utils'
import Taro from '@tarojs/taro'

interface NavBarProps {
  /** 背景色，默认 #FCFBF7 */
  backgroundColor?: string
  bgImg?: string
  /** 自定义 class */
  className?: string
  /** 导航栏标题（可选） */
  title?: string
  /** 标题对齐方式，默认 center */
  titleAlign?: 'left' | 'center'
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 是否显示占位区 */
  isDefault?: boolean
  /** 自定义左侧内容（返回按钮旁） */
  children?: React.ReactNode
}

/** 自定义导航栏：占据状态栏 + 胶囊按钮区域高度，防止内容被遮挡 */
export default function NavBar({ backgroundColor = '#FCFBF7', isDefault = true, children, bgImg, className = '', title, titleAlign = 'center', showBack }: NavBarProps) {
  const headerHeight = getHeaderHeight()

  return (
    <>
      <View
        className={`sticky top-0 z-40 flex flex-row items-end box-border ${className}`}
        style={{
          height: headerHeight,
          backgroundImage: bgImg ? `url(${getImageCdnUrl(bgImg)})` : undefined,
          backgroundColor,
          paddingBottom: 8,
          paddingLeft: showBack ? 12 : 0,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {showBack && (
          <Text
            onClick={() => {
              Taro.navigateBack({
                fail: () => {
                  Taro.switchTab({ url: '/pages/home/index' })
                }
              })
            }}
            className='iconfont icon-next-copy relative top-4px font-bold inline-block h-50px w-50px leading-50px'
          />

        )}
        {children ? (
          <View className='flex-1 flex flex-row items-center'>
            {children}
          </View>
        ) : title ? (
          <View className={`flex-1 text-[34px] font-semibold text-gray-700 ${titleAlign === 'left' ? 'text-left' : 'text-center'}`}
            style={{ marginRight: showBack ? 32 : 0 }}>
            {title}
          </View>
        ) : null}
      </View>

      {/* 占位区：防止固定定位遮挡页面内容 */}
      {!isDefault && <View style={{ height: headerHeight }} />}
    </>
  )
}
