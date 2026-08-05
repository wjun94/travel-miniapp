import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList } from '@/components'
import { getComplaintList, ComplaintItem, COMPLAINT_TARGET_NAMES } from '@/api/complaint'
import { formatTime } from '@/utils'

const STATUS_STYLE = [
  { cls: 'bg-orange-100 text-orange-600', label: '待处理' },
  { cls: 'bg-green-100 text-green-600', label: '已处理' },
  { cls: 'bg-red-100 text-red-500', label: '已驳回' },
]

export default function ComplaintListPage() {
  return (
    <View className='min-h-screen bg-[#FAFAF9] p-4 pb-10 font-sans'>

      <ScrollLoadList
        request={(page, pageSize) => getComplaintList({ page, pageSize })}
        renderItem={(item: ComplaintItem) => {
          const st = STATUS_STYLE[item.status] || STATUS_STYLE[0]
          return (
            <View
              className='bg-white rounded-2xl p-4 mb-3 shadow-sm active:bg-stone-50 transition-colors'
              onClick={() => Taro.navigateTo({ url: `/pages/complaint/detail/index?id=${item.id}` })}
            >
              <View className='flex flex-row items-center justify-between mb-2'>
                <View className='flex flex-row items-center'>
                  <Text className='font-bold text-stone-800 text-[28px]'>
                    {COMPLAINT_TARGET_NAMES[item.targetType] || item.targetType}
                  </Text>
                  <Text className='text-[24px] text-stone-400 ml-2'>{item.reason}</Text>
                </View>
                <Text className={`text-[22px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${st.cls}`}>{st.label}</Text>
              </View>
              <Text className='text-[26px] text-stone-600 leading-relaxed line-clamp-2'>{item.content}</Text>
              <View className='flex flex-row items-center mt-2'>
                {item.images.length > 0 && (
                  <Text className='text-[22px] text-stone-400 mr-3'>图片 {item.images.length} 张</Text>
                )}
                <Text className='text-[22px] text-stone-400'>{formatTime(item.createdAt)}</Text>
                {item.reply && <Text className='text-[22px] text-green-600 ml-3'>已回复</Text>}
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}
