import { View, Text, Textarea } from '@tarojs/components'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro'
import { useRef, useState } from 'react'
import { ScrollLoadList, Image, Modal } from '@/components'
import CalendarSvg from '@/assets/img/calendar.svg'
import LocationsSvg from '@/assets/itinerary/locations.svg'
import TeamSvg from '@/assets/img/team.svg'
import { getMyPartners, applyPartner } from '@/api/partner'
import type { PartnerItem } from '@/api/partner'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const GENDER_LABELS: Record<number, string> = { 0: '不限', 1: '仅限男', 2: '仅限女' }
const FEE_LABELS: Record<number, string> = { 0: '免费', 1: 'AA制', 2: '组织者全包', 3: '人均预算' }
const STATUS_LABELS: Record<number, { label: string; bg: string }> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90' },
  1: { label: '已满员', bg: 'bg-gray-500/80' },
  2: { label: '已解散', bg: 'bg-rose-500/80' },
  3: { label: '已结束', bg: 'bg-gray-500/80' },
  4: { label: '已结束', bg: 'bg-gray-500/80' },
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '时间待定'
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}月${day}日`
}

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}.${d.getDate()}`
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
    const ok = await applyPartner(applyPartnerId, { remark: applyRemark })
      .then(() => true).catch(() => false)
    setApplying(false)
    if (!ok) return
    Taro.showToast({ title: '申请已发送', icon: 'success' })
    setApplyVisible(false)
    setApplyRemark('')
    listRef.current?.refresh()
  }

  usePullDownRefresh(async () => {
    listRef.current?.refresh()
    Taro.stopPullDownRefresh()
  })

  // 页面显示时刷新（详情页解散/退出/申请处理后返回同步数据）
  useDidShow(() => {
    listRef.current?.refresh()
  })

  return (
    <View className='min-h-screen bg-gray-100/70 pb-6'>

      <ScrollLoadList
        ref={listRef}
        request={(page, pageSize) =>
          getMyPartners({ page, pageSize }).then((res: any) => ({
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

                {/* 浏览/点赞 */}
                <View className='absolute bottom-3 right-3 flex flex-row items-center space-x-1.5 z-10'>
                  <View className='bg-black/40 backdrop-blur-md text-white text-[20px] px-2.5 py-0.5 rounded-full flex items-center'>
                    <Text className='iconfont icon-eye mr-1' />
                    <Text className='text-22px'>{item.viewCount ?? 0}</Text>
                  </View>
                  <View className='bg-black/40 backdrop-blur-md text-white text-[20px] px-2.5 py-0.5 rounded-full flex items-center'>
                    <Text className='iconfont icon-follow mr-1' />
                    <Text className='text-22px'>{item.likeCount ?? 0}</Text>
                  </View>
                </View>

                {/* 底部黑 gradient 渐变 */}
                <View className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none' />

                {/* 封面底部的目的地提示 */}
                {item.destination && (
                  <View className='absolute bottom-2.5 left-3 z-10 flex items-center'>
                    <Image src={LocationsSvg} className='h-3.5 w-3.5 mr-6px' />
                    <Text className='text-white text-[22px] font-medium drop-shadow-sm'>
                      {item.destination}
                    </Text>
                  </View>
                )}
              </View>

              {/* 内容主体 */}
              <View className='p-3.5 space-y-2.5'>
                {/* 标题 */}
                <View>
                  <Text className='text-[28px] font-bold text-gray-800 leading-snug line-clamp-1'>
                    {item.title || item.destination}
                  </Text>
                </View>

                {/* 状态标签 */}
                <View className='flex flex-row items-center flex-wrap gap-1.5'>
                  <View className={`${statusInfo.bg} text-white text-[20px] px-2 py-0.5 rounded-md font-medium`}>
                    {statusInfo.label}
                  </View>
                  {item.category && (
                    <View className='bg-orange-50 text-orange-600 text-[20px] px-2 py-0.5 rounded-md font-medium'>
                      {item.category}
                    </View>
                  )}
                  {item.type > 0 && (
                    <View className='bg-gray-100 text-gray-600 text-[20px] px-2 py-0.5 rounded-md font-medium'>
                      {TYPE_LABELS[item.type]}
                    </View>
                  )}
                </View>

                {/* 行程时间与人数信息 */}
                <View className='flex flex-row items-center justify-between pt-1 border-t border-gray-50'>
                  <View className='flex flex-row items-center space-x-2 text-gray-500 text-[24px]'>
                    <View className='flex items-center'>
                      <Image src={CalendarSvg} className='h-3.5 w-3.5 mr-6px' />
                      <Text className='font-medium text-gray-700'>
                        {formatDate(item.startDate)}
                        {item.endDate ? ` - ${formatShortDate(item.endDate)}` : ''}
                      </Text>
                    </View>
                    {item.dayCount > 0 && (
                      <Text className='text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded text-[20px] font-medium'>
                        {item.dayCount}天
                      </Text>
                    )}
                  </View>

                  <View className='flex items-center'>
                    <Image src={TeamSvg} className='h-4 w-4 mr-6px' />
                    <Text className='text-[24px] font-medium text-gray-700'>
                      {item.currentMembers}/{item.maxMembers} 人
                    </Text>
                  </View>
                </View>

                {/* 性别/年龄/费用标签 */}
                <View className='flex flex-row items-center flex-wrap gap-1.5'>
                  {item.genderLimit > 0 && (
                    <Text className='text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>
                      {GENDER_LABELS[item.genderLimit]}
                    </Text>
                  )}
                  {(item.minAge ?? 0) > 0 || (item.maxAge ?? 0) > 0 ? (
                    <Text className='text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>
                      {item.minAge || 0}-{item.maxAge || 99}岁
                    </Text>
                  ) : null}
                  {item.feeMode > 0 && (
                    <Text className='text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>
                      {FEE_LABELS[item.feeMode]}
                    </Text>
                  )}
                </View>

                {/* 简短描述 */}
                {item.desc && (
                  <Text className='text-[24px] text-gray-500 leading-relaxed line-clamp-2'>
                    {item.desc}
                  </Text>
                )}

                {/* 创建者信息与操作按钮 */}
                {!item.isSelf && (
                  <View className='flex flex-row items-center justify-end pt-1'>
                    <View
                      className={`shrink-0 px-4 py-2 rounded-xl font-bold text-[26px] shadow-sm transition-all active:scale-[0.98] ${
                        item.isApplied
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-[#F97316] active:bg-[#EA580C] text-white'
                      }`}
                      onClick={(e) => {
                        if (item.isApplied) return
                        e.stopPropagation()
                        setApplyPartnerId(item.id)
                        setApplyRemark('')
                        setApplyVisible(true)
                      }}
                    >
                      {item.isApplied ? '已申请' : '申请加入'}
                    </View>
                  </View>
                )}
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