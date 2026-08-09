import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { NavBar, Avatar } from '@/components'
import { useRequest } from 'ahooks'
import { getConversationDetail, kickConversationMember } from '@/api/conversation'
import { getImageUrl } from '@/utils'

export default function GroupDetailPage() {
  const router = Taro.getCurrentInstance().router;
  const convId = router?.params?.id || '';

  const { data: detail, loading, refresh } = useRequest(() => getConversationDetail(convId))

  useDidShow(() => {
    refresh()
  })

  // 踢出成员（仅群主）
  const handleKick = (member: { userId: string; nickname: string }) => {
    Taro.showModal({
      title: '踢出成员',
      content: `确定将「${member.nickname}」移出群聊吗？`,
      confirmText: '踢出',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (!res.confirm) return
        await kickConversationMember(convId, member.userId)
        Taro.showToast({ title: '已踢出', icon: 'success' })
        refresh()
      }
    })
  }

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-4 font-sans'>

      {loading ? (
        <View className='py-20 flex items-center justify-center'>
          <Text className='text-[28px] text-stone-400'>加载中...</Text>
        </View>
      ) : (
        <>
          {/* 群信息 */}
          <View className='mt-2 mb-4 bg-white rounded-2xl px-4 py-5 shadow-sm flex items-center'>
            <Avatar name={detail?.name || '群聊'} src='' mode='aspectFill' className='w-16 h-16 rounded-2xl text-28px' />
            <View className='ml-4 flex-1 overflow-hidden'>
              <Text className='font-bold text-stone-800 text-[30px] leading-snug block'>{detail?.name}</Text>
              <Text className='text-[24px] text-stone-400 mt-1 block'>共 {detail?.members?.length || 0} 名成员</Text>
            </View>
            {detail?.partnerId && (
              <View
                className='text-[24px] text-orange-500 border border-orange-200 bg-orange-50 rounded-full px-4 py-1 active:opacity-70 flex-shrink-0'
                onClick={() => Taro.navigateTo({ url: `/pages/partner/detail/index?id=${detail.partnerId}` })}
              >
                查看搭子
              </View>
            )}
          </View>

          {/* 成员列表 */}
          <View className='bg-white rounded-2xl shadow-sm overflow-hidden'>
            <View className='px-4 py-3 border-b border-stone-100'>
              <Text className='text-[26px] font-semibold text-stone-700'>成员列表</Text>
            </View>
            {detail?.members?.map((member) => (
              <View key={member.userId} className='flex items-center px-4 py-3 border-b border-stone-50 last:border-0'>
                <Avatar name={member.nickname} src={getImageUrl(member.avatarUrl)} mode='aspectFill' className='w-11 h-11 rounded-full text-22px' />
                <View className='ml-3 flex-1 flex items-center'>
                  <Text className='text-[28px] text-stone-800 font-medium'>{member.nickname}</Text>
                  {String(member.userId) === String(detail?.ownerId) && (
                    <View className='ml-2 bg-orange-100 text-orange-500 text-[20px] px-2 py-0.5 rounded-full'>群主</View>
                  )}
                </View>
                {/* 群主可踢出非群主成员 */}
                {detail?.isOwner && String(member.userId) !== String(detail.ownerId) && (
                  <View
                    className='text-[24px] text-[#FF3B30] border border-[#FF3B30] rounded-full px-4 py-1 active:opacity-70'
                    onClick={() => handleKick(member)}
                  >
                    踢出
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}
