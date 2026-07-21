import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRef, useState } from 'react'
import { NavBar, ScrollLoadList, Image, Modal } from '@/components'
import { getPartnerList, applyPartner } from '@/api/partner'
import type { PartnerItem } from '@/api/partner'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const STATUS_LABELS: Record<number, { label: string; bg: string }> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90' },
  1: { label: '已满员', bg: 'bg-gray-500/80' },
  2: { label: '已结束', bg: 'bg-rose-500/80' },
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
    <View className='min-h-screen bg-gray-100/70 pb-6'>
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
              key={item.id}
              className='mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 active:scale-[0.99] transition-transform duration-150'
              onClick={() => Taro.navigateTo({ url: `/pages/partner/detail/index?id=${item.id}` })}
            >
              {/* 封面图区域 */}
              <View className='relative h-44 bg-gray-900 overflow-hidden'>
                {item.cover ? (
                  <Image
                    src={item.cover}
                    mode='aspectFill'
                    className='w-full h-full'
                  />
                ) : (
                  <View className='w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center'>
                    <Text className='text-white/40 text-3xl font-bold'>TRAVEL</Text>
                  </View>
                )}

                {/* 顶部左侧状态 Badges */}
                <View className='absolute top-3 left-3 flex flex-row space-x-1.5 z-10'>
                  <View className={`${statusInfo.bg} text-white text-[20px] px-2.5 py-0.5 rounded-full font-medium shadow-sm backdrop-blur-md`}>
                    {statusInfo.label}
                  </View>
                  {item.type > 0 && (
                    <View className='bg-black/40 backdrop-blur-md text-white text-[20px] px-2.5 py-0.5 rounded-full font-light'>
                      {TYPE_LABELS[item.type]}
                    </View>
                  )}
                </View>

                {/* 浏览量 */}
                <View className='absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white text-[20px] px-2.5 py-0.5 rounded-full z-10'>
                  👁 {item.viewCount ?? 0}
                </View>

                {/* 底部黑 gradient 渐变 */}
                <View className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none' />

                {/* 封面底部的目的地提示 */}
                {item.destination && (
                  <View className='absolute bottom-2.5 left-3 z-10 flex items-center'>
                    <Text className='text-white text-[22px] font-medium drop-shadow-sm'>
                      📍 {item.destination}
                    </Text>
                  </View>
                )}
              </View>

              {/* 内容主体 */}
              <View className='p-3.5 space-y-2.5'>
                {/* 标题 & 描述 */}
                <View>
                  <Text className='text-[28px] font-bold text-gray-800 leading-snug line-clamp-1 block'>
                    {item.title || item.destination}
                  </Text>
                  {item.desc && (
                    <Text className='text-[24px] text-gray-500 mt-1 line-clamp-1 block leading-normal'>
                      {item.desc}
                    </Text>
                  )}
                </View>

                {/* 行程时间与人数信息 */}
                <View className='flex flex-row items-center justify-between pt-1 border-t border-gray-50'>
                  <View className='flex flex-row items-center space-x-2 text-gray-500 text-[24px]'>
                    <Text className='font-medium text-gray-700'>
                      📅 {item.startDate || '时间待定'}
                    </Text>
                    {item.days > 0 && (
                      <Text className='text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded text-[20px] font-medium'>
                        {item.days}天
                      </Text>
                    )}
                  </View>

                  <Text className='text-[24px] font-medium text-gray-700'>
                    👥 {item.currentMembers}/{item.maxMembers} 人
                  </Text>
                </View>

                {/* 标签与预算、操作按钮 */}
                <View className='flex flex-row items-center justify-between pt-1'>
                  {/* 标签列表 */}
                  <View className='flex flex-row items-center flex-1 mr-2 overflow-hidden space-x-1'>
                    {item.travelTags ? (
                      item.travelTags.split(',').slice(0, 2).map((tag, idx) => (
                        <Text
                          key={idx}
                          className='text-[22px] text-gray-500 bg-gray-100/80 border border-gray-200/60 px-2 py-0.5 rounded-md truncate'
                        >
                          #{tag.trim()}
                        </Text>
                      ))
                    ) : (
                      <Text className='text-[22px] text-gray-400 italic'>暂无标签</Text>
                    )}
                  </View>

                  {/* 价格预算 */}
                  {item.budgetPerPerson > 0 && (
                    <View className='flex flex-row items-baseline flex-shrink-0'>
                      <Text className='text-[22px] text-orange-600 font-bold mr-0.5'>¥</Text>
                      <Text className='text-[30px] text-orange-600 font-bold'>
                        {item.budgetPerPerson}
                      </Text>
                      <Text className='text-[20px] text-gray-400 ml-0.5'>/人</Text>
                    </View>
                  )}
                </View>

                {/* 底部动作按钮 */}
                <View className='pt-1'>
                  <View
                    className='w-full bg-[#F97316] active:bg-[#EA580C] text-white text-center py-2.5 rounded-xl font-bold text-[28px] shadow-sm transition-all active:scale-[0.98]'
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
            </View>
          )
        }}
      />

      {/* 申请弹窗 */}
      <Modal
        visible={applyVisible}
        title='申请加入搭子'
        confirmText='发送申请'
        confirmLoading={applying}
        showCancel
        onConfirm={handleApply}
        onCancel={() => {
          setApplyVisible(false)
          setApplyRemark('')
        }}
      >
        <View className='pt-2'>
          <Text className='text-[24px] text-gray-500 mb-2 block'>
            打个招呼吧，让队长更了解你：
          </Text>
          <Textarea
            value={applyRemark}
            onInput={(e) => setApplyRemark(e.detail.value)}
            placeholder='例如：随和好相处，时间和预算都 OK…'
            placeholderClass='text-gray-400'
            className='w-full bg-gray-50 rounded-xl p-3 text-[26px] text-gray-800 border border-gray-200 box-border'
            style={{ minHeight: '90px' }}
          />
        </View>
      </Modal>
    </View>
  )
}