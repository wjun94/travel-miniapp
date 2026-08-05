import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import {
  getComplaintDetail,
  ComplaintItem,
  COMPLAINT_TARGET_NAMES,
} from '@/api/complaint'
import { formatTime } from '@/utils'

const STATUS_STYLE = [
  { cls: 'bg-orange-100 text-orange-600', label: '待处理' },
  { cls: 'bg-green-100 text-green-600', label: '已处理' },
  { cls: 'bg-red-100 text-red-500', label: '已驳回' },
]

export default function ComplaintDetailPage() {
  const router = useRouter()
  const id = router.params.id || ''
  const [item, setItem] = useState<ComplaintItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getComplaintDetail(id)
      .then(setItem)
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [id])

  const previewImage = (current: string) => {
    if (item?.images.length) Taro.previewImage({ current, urls: item.images })
  }

  if (loading) {
    return (
      <View className='min-h-screen bg-[#FAFAF9] px-4 font-sans'>
        <View className='flex flex-col items-center py-20'>
          <Text className='iconfont icon-loading text-[40px] text-stone-300 animate-spin' />
          <Text className='text-[24px] text-stone-400 mt-3'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!item) {
    return (
      <View className='min-h-screen bg-[#FAFAF9] px-4 font-sans'>
        <View className='flex flex-col items-center py-20'>
          <Text className='text-[24px] text-stone-400'>投诉不存在或已删除</Text>
        </View>
      </View>
    )
  }

  const st = STATUS_STYLE[item.status] || STATUS_STYLE[0]

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-10 font-sans'>
      {/* 状态卡片 */}
      <View className='bg-white rounded-2xl p-4 mb-3 shadow-sm'>
        <View className='flex flex-row items-center justify-between'>
          <Text className={`text-[26px] px-3 py-1 rounded-full font-bold ${st.cls}`}>{st.label}</Text>
          <Text className='text-[22px] text-stone-400'>提交于 {formatTime(item.createdAt)}</Text>
        </View>
      </View>

      {/* 投诉内容 */}
      <View className='bg-white rounded-2xl p-4 mb-3 shadow-sm'>
        <View className='flex flex-row items-center mb-3'>
          <Text className='text-[26px] font-bold text-stone-800'>
            {COMPLAINT_TARGET_NAMES[item.targetType] || item.targetType}
          </Text>
          {item.targetId && <Text className='text-[22px] text-stone-400 ml-2 break-all'>ID: {item.targetId}</Text>}
        </View>
        <Text className='text-[26px] text-orange-600 font-medium block mb-2'>{item.reason}</Text>
        <Text className='text-[26px] text-stone-700 leading-relaxed'>{item.content}</Text>

        {/* 图片证据 */}
        {item.images.length > 0 && (
          <View className='grid grid-cols-3 gap-2 mt-4'>
            {item.images.map((img, i) => (
              <Image
                key={i}
                className='w-full h-28 rounded-xl bg-stone-100'
                src={img}
                mode='aspectFill'
                onClick={() => previewImage(img)}
              />
            ))}
          </View>
        )}
      </View>

      {/* 后台回复 */}
      {item.reply && (
        <View className='bg-white rounded-2xl p-4 mb-3 shadow-sm'>
          <View className='flex flex-row items-center mb-2'>
            <Text className='text-[26px] font-bold text-green-600'>官方回复</Text>
            {item.handledAt && (
              <Text className='text-[22px] text-stone-400 ml-2'>{formatTime(item.handledAt)}</Text>
            )}
          </View>
          <Text className='text-[26px] text-stone-700 leading-relaxed'>{item.reply}</Text>
        </View>
      )}

      {/* 处理备注 */}
      {item.handleNote && (
        <View className='bg-white rounded-2xl p-4 shadow-sm'>
          <Text className='text-[26px] font-bold text-stone-800 block mb-2'>处理备注</Text>
          <Text className='text-[26px] text-stone-600 leading-relaxed'>{item.handleNote}</Text>
        </View>
      )}

      {/* 再次投诉 */}
      <View
        className='mt-6 bg-orange-500 text-white text-center text-[30px] font-bold rounded-full py-3.5 active:opacity-80'
        onClick={() =>
          Taro.navigateTo({
            url: `/pages/complaint/index/index?targetType=${item.targetType}&targetId=${item.targetId}`,
          })
        }
      >
        再次投诉
      </View>
    </View>
  )
}
