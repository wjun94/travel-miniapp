import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRef, useState } from 'react'
import { NavBar, ScrollLoadList, Image, Modal } from '@/components'
import { getPartnerList, applyPartner } from '@/api/partner'
import type { PartnerItem } from '@/api/partner'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: '招募中', color: 'bg-green-500' },
  1: { label: '已满员', color: 'bg-gray-400' },
  2: { label: '已结束', color: 'bg-red-400' },
}

export default function PartnerList() {
  const listRef = useRef<any>(null)
  const [applyVisible, setApplyVisible] = useState(false)
  const [applyPartnerId, setApplyPartnerId] = useState('')
  const [applyRemark, setApplyRemark] = useState('')
  const [applying, setApplying] = useState(false)

  const handleApply = async () => {
    if (!applyPartnerId) return
    setApplying(true)
    try {
      await applyPartner(applyPartnerId, { remark: applyRemark })
      Taro.showToast({ title: '申请已发送', icon: 'success' })
      setApplyVisible(false)
      setApplyRemark('')
      listRef.current?.refresh()
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'none' })
    } finally {
      setApplying(false)
    }
  }

  return (
    <View className='min-h-screen bg-gray-50'>
      <NavBar title='搭子列表' showBack />

      <ScrollLoadList
        ref={listRef}
        request={(page, pageSize) =>
          getPartnerList({ page, pageSize }).then((res: any) => ({
            list: res?.list?.list || res?.list || [],
            total: res?.list?.total || res?.total || 0,
          }))
        }
        pageSize={10}
        emptyText='暂无搭子信息'
        renderItem={(item: PartnerItem) => {
          const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS[0]
          return (
            <View
              className='mx-4 mt-3 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:opacity-90'
              onClick={() => Taro.navigateTo({ url: `/pages/partner/detail/index?id=${item.id}` })}
            >
              {/* 封面图 */}
              <View className='relative h-40'>
                <Image
                  src={item.cover || ''}
                  mode='aspectFill'
                  className='w-full h-full bg-gray-200'
                />
                <View className='absolute top-3 left-3 flex flex-row space-x-2'>
                  <View className={`${statusInfo.color} text-white text-[20px] px-2 py-0.5 rounded-full`}>
                    {statusInfo.label}
                  </View>
                  {item.type > 0 && (
                    <View className='bg-black/50 text-white text-[20px] px-2 py-0.5 rounded-full'>
                      {TYPE_LABELS[item.type]}
                    </View>
                  )}
                </View>
                <View className='absolute bottom-3 right-3 bg-black/50 text-white text-[20px] px-2 py-0.5 rounded-full'>
                  ❤️ {item.viewCount ?? 0}
                </View>
              </View>

              {/* 内容区 */}
              <View className='p-3'>
                <Text className='text-base font-bold text-gray-800 line-clamp-1'>{item.title || item.destination}</Text>
                {item.desc && (
                  <Text className='text-[24px] text-gray-400 mt-1 line-clamp-1'>{item.desc}</Text>
                )}

                {/* 时间与人数 */}
                <View className='flex flex-row items-center justify-between mt-2'>
                  <View className='flex flex-row items-center space-x-2'>
                    <Text className='text-[22px] text-gray-400'>{item.startDate || '待定'}</Text>
                    {item.days > 0 && (
                      <Text className='text-[22px] text-gray-400'>{item.days}天</Text>
                    )}
                  </View>
                  <View className='flex flex-row items-center'>
                    <Text className='text-[22px] text-gray-400'>
                      👥 {item.currentMembers}/{item.maxMembers}人
                    </Text>
                  </View>
                </View>

                {/* 目的地标签+预算 */}
                <View className='flex flex-row items-center justify-between mt-2'>
                  <View className='flex flex-row items-center flex-1 overflow-hidden'>
                    {item.destination && (
                      <Text className='text-[22px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded'>
                        📍 {item.destination}
                      </Text>
                    )}
                    {item.travelTags && (
                      <Text className='text-[22px] text-gray-400 ml-2 truncate'>
                        {item.travelTags}
                      </Text>
                    )}
                  </View>
                  {item.budgetPerPerson > 0 && (
                    <Text className='text-[22px] text-red-400 font-medium flex-shrink-0'>
                      ¥{item.budgetPerPerson}/人
                    </Text>
                  )}
                </View>

                {/* 申请按钮 */}
                <View
                  className='mt-3 bg-[#F97316] text-white text-center py-2 rounded-lg font-semibold text-[26px] active:opacity-90'
                  onClick={(e) => {
                    e.stopPropagation()
                    setApplyPartnerId(item.id)
                    setApplyRemark('')
                    setApplyVisible(true)
                  }}
                >
                  申请加入
                </View>
              </View>
            </View>
          )
        }}
      />

      <Modal
        visible={applyVisible}
        title='申请加入'
        confirmText='发送申请'
        confirmLoading={applying}
        showCancel
        onConfirm={handleApply}
        onCancel={() => {
          setApplyVisible(false)
          setApplyRemark('')
        }}
      >
        <Textarea
          value={applyRemark}
          onInput={(e) => setApplyRemark(e.detail.value)}
          placeholder='给队长留个言吧~'
          className='w-full bg-gray-50 rounded-lg px-3 py-2 text-[26px] border border-gray-100 mt-2'
          style={{ minHeight: '80px' }}
        />
      </Modal>
    </View>
  )
}