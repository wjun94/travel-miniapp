import { View, Text } from '@tarojs/components'
import { Image } from '@/components'

interface Props {
  src?: string
  title?: string
  className?: string
  style?: React.CSSProperties
}

/** 封面图片组件：有图展示图片，无图显示标题占位 */
export default function CoverImage({ src, title, className = '', style }: Props) {
  return (
    <View
      className={`w-full h-full relative ${className}`}
      style={{ backgroundColor: src ? undefined : '#ffedd5', ...style }}
    >
      {src ? (
        <Image src={src} mode='aspectFill' className='w-full h-full' />
      ) : (
        <View className='w-full h-full flex items-center justify-center'>
          <Text
            className='font-bold text-stone-700 text-center leading-relaxed text-32px max-w-220px'
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
    </View>
  )
}
