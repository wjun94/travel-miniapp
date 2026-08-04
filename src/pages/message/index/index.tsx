import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { NavBar, Avatar } from '@/components'
import { useRequest } from 'ahooks'
import { getUnreadNotificationCount, markNotificationTypeAllRead } from '@/api/message'
import { getMyConversations, clearSystemMessages, type ConversationItem } from '@/api/conversation'
import { formatTime } from '@/utils'

export default function MessagePage() {
  // 1. 获取未读统计
  const { data: unreadData, refresh: refreshUnread } = useRequest(getUnreadNotificationCount)

  // 2. 获取统一会话列表（系统消息+私聊+群聊，按最后消息时间倒序）
  const { data: chatList = [], loading, refresh: refreshList } = useRequest(getMyConversations)

  // 下拉刷新
  usePullDownRefresh(async () => {
    await Promise.all([refreshUnread(), refreshList()])
    Taro.stopPullDownRefresh()
  })

  useDidShow(async () => {
    await Promise.all([refreshUnread(), refreshList()])
  })

  const categories = useMemo(() => [
    { id: 1, title: '搭子申请', icon: 'icon-apply', bgColor: '#EAF5F1', textColor: '#56A88E', badge: unreadData?.partnerApplyCount || 0 },
    { id: 2, title: '评论点赞', icon: 'icon-follow-fill', bgColor: '#FFF0E6', textColor: '#FA8C4F', badge: unreadData?.likeCount || 0 },
    { id: 3, title: '新增关注', icon: 'icon-people', bgColor: '#FFF0E6', textColor: '#FA8C4F', badge: unreadData?.followCount || 0 },
    { id: 5, title: '新增评论', icon: 'icon-msg', bgColor: '#EBF2FC', textColor: '#5C94E0', badge: unreadData?.commentCount || 0 },
  ], [unreadData])

  // 点击会话：系统消息清空，群聊进群聊页，私聊进聊天页
  const handleClickItem = (item: ConversationItem) => {
    if (item.type === 'system') {
      // 点击系统消息：确认后清空
      Taro.showModal({
        title: '系统消息',
        content: '点击"确定"后清空全部系统消息',
        confirmText: '清空',
        success: async (res) => {
          if (res.confirm) {
            try {
              await clearSystemMessages()
              refreshList()
              refreshUnread()
            } catch { /* ignore */ }
          }
        },
      })
      return
    }
    if (item.type === 'group') {
      Taro.navigateTo({ url: `/pages/message/group-chat/index?id=${item.id}&name=${encodeURIComponent(item.name)}` })
      return
    }
    // 私聊已读由进入聊天页时接口自动处理
    Taro.navigateTo({ url: `/pages/message/chat/index?userId=${item.id}` })
  }

  // 点击分类：按类型批量标记已读后进入列表
  const handleCategoryClick = async (item: (typeof categories)[number]) => {
    try {
      await markNotificationTypeAllRead(item.id)
      refreshUnread()
    } catch { /* ignore */ }
    Taro.navigateTo({ url: `/pages/message/list/index?type=${item.id}` })
  }

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-4 font-sans'>
      <NavBar title='消息中心' />

      {/* 1. 顶部功能区 */}
      <View className='mt-2 mb-6 bg-white rounded-2xl px-3 py-5 shadow-sm'>
        <View className='grid grid-cols-4 gap-1 text-center'>
          {categories.map((item) => (
            <View key={item.id} onClick={() => handleCategoryClick(item)} className='flex flex-col items-center active:scale-95 transition-transform'>
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

      {/* 2. 会话列表区（系统消息+私聊+群聊统一展示） */}
      {loading ? (
        <View className='py-20 flex items-center justify-center'>
          <Text className='text-[28px] text-stone-400'>加载中...</Text>
        </View>
      ) : chatList.length === 0 ? (
        <View className='py-20 flex flex-col items-center justify-center space-y-2 text-stone-400'>
          <Text className='iconfont icon-message text-72px' />
          <Text className='text-[26px]'>暂无消息</Text>
        </View>
      ) : (
        <View className='bg-white rounded-2xl overflow-hidden shadow-sm'>
          {chatList.map((item, index) => (
            <View
              key={item.id}
              className={`flex flex-row items-center px-3 py-3.5 active:bg-stone-50 transition-colors ${index > 0 ? 'border-t border-stone-100' : ''}`}
              onClick={() => handleClickItem(item)}
            >
              {/* 左侧头像：系统消息用系统图标，群聊用方头像+人数，私聊用圆头像 */}
              <View className='relative w-[64px] h-[64px] flex-shrink-0'>
                {item.type === 'system' ? (
                  <View className='w-full h-full rounded-2xl bg-blue-50 flex items-center justify-center'>
                    <Text className='iconfont icon-msg text-blue-500 text-40px' />
                  </View>
                ) : (
                  <Avatar
                    name={item.name}
                    src={item.avatarUrl || ''}
                    mode='aspectFill'
                    className={`w-full h-full ${item.type === 'group' ? 'rounded-2xl' : 'rounded-full'} text-24px`}
                  />
                )}
                {item.type === 'group' && (
                  <View className='absolute -bottom-1 -right-1 bg-orange-500 text-white text-[18px] rounded-full px-1 border border-white'>
                    {item.memberCount}
                  </View>
                )}
              </View>

              {/* 中间文本区：标题+时间 与 消息+未读 两行对齐 */}
              <View className='flex-1 ml-3 overflow-hidden flex flex-col justify-center'>
                <View className='flex flex-row items-center'>
                  <Text className='font-bold text-stone-800 text-[28px] leading-snug tracking-wide truncate flex-1'>
                    {item.name}
                  </Text>
                  <Text className='text-[20px] text-stone-300 flex-shrink-0 ml-2'>
                    {item.lastTime ? formatTime(item.lastTime) : ''}
                  </Text>
                </View>
                <View className='flex flex-row items-center mt-1'>
                  <Text className='text-[24px] text-stone-400 truncate flex-1'>
                    {item.lastContent || '暂无消息'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View className='bg-[#FF3B30] text-white text-[20px] font-bold min-w-[18px] h-[28px] rounded-full flex items-center justify-center px-1 ml-2 flex-shrink-0'>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
