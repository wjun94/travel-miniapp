import { useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useRequest } from 'ahooks'
import { NavBar, Image, Modal } from '@/components'
import { getPartnerDetail, applyPartner } from '@/api/partner'
import { useAuthStore } from '@/store/authStore'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const GENDER_LABELS: Record<number, string> = { 0: '不限', 1: '仅限男', 2: '仅限女' }
const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: '招募中', color: 'text-green-500 bg-green-50' },
  1: { label: '已满员', color: 'text-gray-400 bg-gray-100' },
  2: { label: '已结束', color: 'text-red-400 bg-red-50' },
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
    <View className='min-h-screen bg-gray-50'>
      <NavBar title='搭子详情' showBack />

      {/* 封面图 */}
      <View className='relative h-52'>
        <Image
          src={partner.cover || ''}
          mode='aspectFill'
          className='w-full h-full bg-gray-200'
        />
        <View className={`absolute top-4 left-4 ${statusInfo.color} text-[22px] px-3 py-1 rounded-full font-medium`}>
          {statusInfo.label}
        </View>
        <View className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent' />
        <View className='absolute bottom-3 left-4 right-4 flex flex-row items-center justify-between'>
          <Text className='text-white text-xl font-bold line-clamp-1'>{partner.title || partner.destination}</Text>
          <Text className='text-white/80 text-[22px]'>❤️ {partner.viewCount ?? 0}</Text>
        </View>
      </View>

      <View className='px-4 pt-4 space-y-4'>
        {/* 基本信息 */}
        <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
          <Text className='text-base font-bold text-gray-800 mb-3'>基本信息</Text>

          <View className='flex flex-row items-center justify-between mb-2'>
            <Text className='text-[24px] text-gray-400'>目的地</Text>
            <Text className='text-[26px] text-gray-800 font-medium'>📍 {partner.destination}</Text>
          </View>

          {partner.desc && (
            <View className='mb-2'>
              <Text className='text-[24px] text-gray-400 block mb-1'>描述</Text>
              <Text className='text-[26px] text-gray-600 leading-relaxed'>{partner.desc}</Text>
            </View>
          )}

          <View className='flex flex-row items-center justify-between mb-2'>
            <Text className='text-[24px] text-gray-400'>出行时间</Text>
            <Text className='text-[26px] text-gray-800'>
              {partner.startDate || '待定'} {partner.days > 0 ? `（${partner.days}天）` : ''}
            </Text>
          </View>

          {partner.budgetPerPerson > 0 && (
            <View className='flex flex-row items-center justify-between mb-2'>
              <Text className='text-[24px] text-gray-400'>人均预算</Text>
              <Text className='text-[26px] text-red-400 font-medium'>¥{partner.budgetPerPerson}</Text>
            </View>
          )}

          {partner.type > 0 && (
            <View className='flex flex-row items-center justify-between'>
              <Text className='text-[24px] text-gray-400'>出行方式</Text>
              <Text className='text-[26px] text-gray-800'>{TYPE_LABELS[partner.type]}</Text>
            </View>
          )}
        </View>

        {/* 成员与限制 */}
        <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
          <Text className='text-base font-bold text-gray-800 mb-3'>成员与限制</Text>

          <View className='flex flex-row items-center justify-between mb-2'>
            <Text className='text-[24px] text-gray-400'>当前成员</Text>
            <Text className='text-[26px] text-gray-800 font-medium'>👥 {partner.currentMembers}/{partner.maxMembers}人</Text>
          </View>

          <View className='flex flex-row items-center justify-between mb-2'>
            <Text className='text-[24px] text-gray-400'>性别限制</Text>
            <Text className='text-[26px] text-gray-800'>{GENDER_LABELS[partner.genderLimit]}</Text>
          </View>

          {partner.requirement && (
            <View>
              <Text className='text-[24px] text-gray-400 block mb-1'>加入要求</Text>
              <Text className='text-[26px] text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed'>
                {partner.requirement}
              </Text>
            </View>
          )}
        </View>

        {/* 标签 */}
        {partner.travelTags && (
          <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
            <Text className='text-base font-bold text-gray-800 mb-3'>标签</Text>
            <View className='flex flex-row flex-wrap gap-2'>
              {partner.travelTags.split(',').map((tag, i) => (
                <Text key={i} className='text-[22px] text-orange-500 bg-orange-50 px-3 py-1 rounded-full'>
                  {tag.trim()}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 申请按钮 */}
        {canApply ? (
          <View
            onClick={() => setApplyVisible(true)}
            className='bg-[#F97316] text-white text-center py-3 rounded-xl font-bold text-[30px] active:opacity-90'
          >
            申请加入
          </View>
        ) : isSelf ? (
          <View className='bg-gray-200 text-gray-500 text-center py-3 rounded-xl font-bold text-[30px]'>
            你创建的搭子
          </View>
        ) : (
          <View className='bg-gray-200 text-gray-500 text-center py-3 rounded-xl font-bold text-[30px]'>
            已结束或满员
          </View>
        )}

        <View className='h-4' />
      </View>

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