import { View, Text } from '@tarojs/components'
import { Image } from '@/components'

interface Props {
  src?: string
  title?: string
  className?: string
  titleClassName?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** 封面图片组件：有图展示图片，无图显示标题占位，children 作为顶层遮罩渲染 */
export default function CoverImage({ src, title, className = '', titleClassName, style, children }: Props) {
  return (
    <View
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ backgroundColor: src ? undefined : '#ffedd5', ...style }}
    >
      {src ? (
        <Image src={src} mode='aspectFill' className='w-full h-full' />
      ) : (
        <View className='w-full h-full flex items-center justify-center'>
          <Text
            className={`font-bold text-stone-700 text-center leading-relaxed ${titleClassName || 'text-32px'} max-w-220px`}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Text>
        </View>
      )}
      {children && <View className='absolute inset-0'>{children}</View>}
    </View>
  )
}
