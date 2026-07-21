import { useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useRequest } from 'ahooks'
import { NavBar, Image, Modal } from '@/components'
import { getPartnerDetail, applyPartner } from '@/api/partner'
import { useAuthStore } from '@/store/authStore'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const GENDER_LABELS: Record<number, string> = { 0: '不限', 1: '仅限男', 2: '仅限女' }
const STATUS_LABELS: Record<number, { label: string; bg: string; text: string }> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90', text: 'text-white' },
  1: { label: '已满员', bg: 'bg-gray-500/80', text: 'text-white' },
  2: { label: '已结束', bg: 'bg-rose-500/80', text: 'text-white' },
}

export default function PartnerDetail() {
  const { id } = useRouter().params
  const currentUserId = String(useAuthStore.getState().userId || '')

  const [applyVisible, setApplyVisible] = useState(false)
  const [applyRemark, setApplyRemark] = useState('')
  const [applying, setApplying] = useState(false)

  const { data: partner, refresh } = useRequest(
    () => getPartnerDetail(id || ''),
    { refreshDeps: [id] },
  )

  const isSelf = partner?.userId === currentUserId
  const statusInfo = STATUS_LABELS[partner?.status ?? 0] || STATUS_LABELS[0]
  const canApply = !isSelf && (partner?.status ?? 0) === 0

  const handleApply = async () => {
    if (!id) return
    setApplying(true)
    try {
      await applyPartner(id, { remark: applyRemark })
      Taro.showToast({ title: '申请已发送', icon: 'success' })
      setApplyVisible(false)
      setApplyRemark('')
      refresh()
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'none' })
    } finally {
      setApplying(false)
    }
  }

  if (!partner) return null

  return (
    <View className='min-h-screen bg-gray-100/70 flex flex-col pb-24'>
      <NavBar title='搭子详情' showBack />

      {/* 封面 Header */}
      <View className='relative w-full h-60 bg-gray-900 overflow-hidden'>
        {partner.cover ? (
          <Image
            src={partner.cover}
            mode='aspectFill'
            className='w-full h-full opacity-90'
          />
        ) : (
          <View className='w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center'>
            <Text className='text-white/40 text-4xl font-bold'>TRAVEL</Text>
          </View>
        )}

        {/* 顶部状态浮层 */}
        <View className='absolute top-3 left-4 flex items-center space-x-2 z-10'>
          <View className={`${statusInfo.bg} ${statusInfo.text} text-[22px] px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md`}>
            {statusInfo.label}
          </View>
        </View>

        {/* 渐变遮罩 (保证顶部文字清晰) */}
        <View className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

        {/* 底部标题与浏览量 */}
        <View className='absolute bottom-3 left-4 right-4 flex items-end justify-between z-10'>
          <View className='flex-1 mr-3'>
            <Text className='text-white text-2xl font-bold leading-tight line-clamp-2 drop-shadow-md'>
              {partner.title || partner.destination}
            </Text>
          </View>
          <View className='bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center'>
            <Text className='text-white/90 text-[22px] font-medium'>👁 {partner.viewCount ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* 主体内容列表 */}
      <View className='px-4 pt-3 space-y-3.5'>
        {/* 卡片 1：基本行程参数 */}
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3'>
          <Text className='text-[28px] font-bold text-gray-800 block border-b border-gray-100 pb-2.5'>
            行程信息
          </Text>

          {/* 目的地 */}
          <View className='flex items-center justify-between'>
            <Text className='text-[26px] text-gray-500'>目的地</Text>
            <Text className='text-[28px] text-gray-900 font-semibold'>📍 {partner.destination}</Text>
          </View>

          {/* 出行时间 */}
          <View className='flex items-center justify-between'>
            <Text className='text-[26px] text-gray-500'>出行时间</Text>
            <View className='text-right'>
              <Text className='text-[26px] text-gray-800 font-medium'>
                {partner.startDate || '时间待定'}
              </Text>
              {partner.days > 0 && (
                <Text className='text-[22px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded ml-1.5 font-medium'>
                  {partner.days}天
                </Text>
              )}
            </View>
          </View>

          {/* 人均预算 */}
          {partner.budgetPerPerson > 0 && (
            <View className='flex items-center justify-between'>
              <Text className='text-[26px] text-gray-500'>人均预算</Text>
              <Text className='text-[32px] text-orange-600 font-bold'>
                ¥{partner.budgetPerPerson}
              </Text>
            </View>
          )}

          {/* 出行方式 */}
          {partner.type > 0 && (
            <View className='flex items-center justify-between'>
              <Text className='text-[26px] text-gray-500'>出行方式</Text>
              <Text className='text-[26px] text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100'>
                {TYPE_LABELS[partner.type]}
              </Text>
            </View>
          )}

          {/* 描述说明 */}
          {partner.desc && (
            <View className='pt-2 border-t border-gray-50'>
              <Text className='text-[24px] text-gray-400 block mb-1.5'>计划说明</Text>
              <Text className='text-[26px] text-gray-700 leading-relaxed bg-gray-50/80 p-3 rounded-xl block border border-gray-100/60'>
                {partner.desc}
              </Text>
            </View>
          )}
        </View>

        {/* 卡片 2：队伍限制与要求 */}
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3'>
          <Text className='text-[28px] font-bold text-gray-800 block border-b border-gray-100 pb-2.5'>
            招募要求
          </Text>

          {/* 队伍状态 */}
          <View className='flex items-center justify-between'>
            <Text className='text-[26px] text-gray-500'>当前成员</Text>
            <View className='flex items-center space-x-1'>
              <Text className='text-[28px] text-gray-900 font-semibold'>
                👥 {partner.currentMembers} / {partner.maxMembers} 人
              </Text>
            </View>
          </View>

          {/* 性别要求 */}
          <View className='flex items-center justify-between'>
            <Text className='text-[26px] text-gray-500'>性别限制</Text>
            <Text className='text-[26px] text-gray-800'>
              {GENDER_LABELS[partner.genderLimit]}
            </Text>
          </View>

          {/* 补充要求 */}
          {partner.requirement && (
            <View className='pt-2 border-t border-gray-50'>
              <Text className='text-[24px] text-gray-400 block mb-1.5'>加入条件</Text>
              <Text className='text-[26px] text-gray-700 bg-orange-50/50 border border-orange-100/80 rounded-xl p-3 leading-relaxed block'>
                {partner.requirement}
              </Text>
            </View>
          )}
        </View>

        {/* 卡片 3：标签 */}
        {partner.travelTags && (
          <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100'>
            <Text className='text-[28px] font-bold text-gray-800 block mb-3'>
              旅行标签
            </Text>
            <View className='flex flex-row flex-wrap gap-2'>
              {partner.travelTags.split(',').map((tag, i) => (
                <View
                  key={i}
                  className='bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 px-3 py-1 rounded-full'
                >
                  <Text className='text-[24px] text-orange-600 font-medium'>
                    #{tag.trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 底部固定操作栏 (Fixed Bottom) */}
      <View className='fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-30 shadow-lg pb-[max(12px,env(safe-area-inset-bottom))]'>
        {canApply ? (
          <View
            onClick={() => setApplyVisible(true)}
            className='w-full bg-[#F97316] active:bg-[#EA580C] text-white text-center py-3 rounded-xl font-bold text-[30px] shadow-md transition-all active:scale-[0.98]'
          >
            申请加入
          </View>
        ) : isSelf ? (
          <View className='w-full bg-gray-100 text-gray-400 text-center py-3 rounded-xl font-medium text-[28px]'>
            你创建的搭子行程
          </View>
        ) : (
          <View className='w-full bg-gray-100 text-gray-400 text-center py-3 rounded-xl font-medium text-[28px]'>
            招募已结束或已满员
          </View>
        )}
      </View>

      {/* 申请弹窗 */}
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
        <View className='pt-2'>
          <Text className='text-[24px] text-gray-500 mb-2 block'>
            打个招呼吧，让队长更了解你：
          </Text>
          <Textarea
            value={applyRemark}
            onInput={(e) => setApplyRemark(e.detail.value)}
            placeholder='例如：有丰富自驾经验 / 时间可微调 / 随和好相处…'
            placeholderClass='text-gray-400'
            className='w-full bg-gray-50 rounded-xl p-3 text-[26px] text-gray-800 border border-gray-200 box-border'
            style={{ minHeight: '100px' }}
          />
        </View>
      </Modal>
    </View>
  )
}