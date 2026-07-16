import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Image } from '@/components'
import { useRequest } from 'ahooks'
import { getUnreadNotificationCount, getConversationList, type Conversation } from '@/api/message'
import { formatTime } from '@/utils'

export default function MessagePage() {
  // 1. 获取未读统计
  const { data: unreadData } = useRequest(getUnreadNotificationCount)

  // 2. 获取会话列表
  const { data: conversationList = [], loading } = useRequest(getConversationList)

  const categories = useMemo(() => [
    { id: 1, title: '搭子申请', icon: 'icon-apply', bgColor: '#EAF5F1', textColor: '#56A88E', badge: unreadData?.partnerApplyCount || 0 },
    { id: 2, title: '评论点赞', icon: 'icon-follow-fill', bgColor: '#FFF0E6', textColor: '#FA8C4F', badge: unreadData?.likeCount || 0 },
    { id: 3, title: '新增关注', icon: 'icon-people', bgColor: '#FFF0E6', textColor: '#FA8C4F', badge: unreadData?.followCount || 0 },
    { id: 5, title: '新增评论', icon: 'icon-msg', bgColor: '#EBF2FC', textColor: '#5C94E0', badge: unreadData?.commentCount || 0 },
  ], [unreadData])

  const handleClickItem = (item: Conversation) => {
    Taro.navigateTo({ url: `/pages/message/chat/index?userId=${item.otherUserId}` })
  }

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-4 font-sans'>
      <NavBar title='消息中心' />

      {/* 1. 顶部功能区 */}
      <View className='mt-2 mb-6 bg-white rounded-2xl px-3 py-5 shadow-sm'>
        <View className='grid grid-cols-4 gap-1 text-center'>
          {categories.map((item) => (
            <View key={item.id} onClick={() => Taro.navigateTo({ url: `/pages/message/list/index?type=${item.id}` })} className='flex flex-col items-center active:scale-95 transition-transform'>
              <View style={{ backgroundColor: item.bgColor }} className='w-14 h-14 rounded-full flex items-center justify-center relative mb-2 shadow-sm'>
                <Text style={{ color: item.textColor }} className={`iconfont ${item.icon} text-52px`} />
                {item.badge > 0 && (
                  <View className='absolute -top-1 -right-1 bg-[#FF3B30] text-white text-22px font-bold px-12px py-6px rounded-full flex items-center justify-center border border-white'>
                    {item.badge > 99 ? '99+' : item.badge}
                  </View>
                )}
              </View>
              <Text className='text-[26px] font-medium tracking-wide'>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 2. 会话列表区 */}
      {loading ? (
        <View className='py-20 flex items-center justify-center'>
          <Text className='text-[28px] text-stone-400'>加载中...</Text>
        </View>
      ) : conversationList.length === 0 ? (
        <View className='py-20 flex flex-col items-center justify-center space-y-2 text-stone-400'>
          <Text className='iconfont icon-message text-72px' />
          <Text className='text-[26px]'>暂无消息</Text>
        </View>
      ) : (
        <View className='flex flex-col'>
          {conversationList.map((item) => (
            <View
              key={item.otherUserId}
              className='flex flex-row items-center py-3.5 border-b border-stone-100 last:border-0 active:bg-stone-50 transition-colors'
              onClick={() => handleClickItem(item)}
            >
              {/* 左侧头像 */}
              <View className='relative w-[52px] h-[52px] flex-shrink-0'>
                <Image
                  src={item.avatarUrl || ''}
                  mode='aspectFill'
                  className='w-full h-full rounded-full bg-stone-100'
                />
              </View>

              {/* 中间文本区 */}
              <View className='flex-1 ml-3.5 overflow-hidden flex flex-col justify-center'>
                <Text className='font-bold text-stone-800 text-[28px] leading-snug tracking-wide'>
                  {item.nickname}
                </Text>
                <Text className='text-[24px] text-stone-400 mt-1 truncate tracking-normal'>
                  {item.lastContent}
                </Text>
              </View>

              {/* 右侧时间与未读状态 */}
              <View className='ml-3 flex flex-col items-end justify-between h-10 flex-shrink-0'>
                <Text className='text-[22px] text-stone-400'>{formatTime(item.lastTime)}</Text>
                {item.unreadCount > 0 ? (
                  <View className='bg-[#FF3B30] text-white text-[12px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1'>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </View>
                ) : (
                  <View className='h-[18px]' />
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
