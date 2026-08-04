import { useCallback, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Avatar, ScrollLoadList } from '@/components'
import { getBlacklist, unblockUser } from '@/api/follow'
import type { UserFollowInfo } from '@/api/follow'
import type { ScrollLoadListRef } from '@/components/ScrollLoadList'

export default function BlacklistPage() {
  const listRef = useRef<ScrollLoadListRef>(null)
  // 记录已解除拉黑的用户ID（点击后立即置灰，同时刷新列表）
  const [unblockedIds, setUnblockedIds] = useState<Set<string>>(new Set())
  // 防止重复点击
  const [unblocking, setUnblocking] = useState(false)

  const handleClickItem = (userId: string) => {
    Taro.navigateTo({ url: `/pages/personal/index?userId=${userId}` })
  }

  const handleUnblock = async (userId: string, e: any) => {
    e.stopPropagation()
    if (unblockedIds.has(userId) || unblocking) return
    setUnblocking(true)
    try {
      await unblockUser(userId)
      Taro.showToast({ title: '已解除拉黑', icon: 'success' })
      setUnblockedIds(prev => new Set(prev).add(userId))
      // 刷新列表数据
      listRef.current?.refresh()
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setUnblocking(false)
    }
  }

  const renderItem = useCallback((item: UserFollowInfo) => {
    const isUnblocked = unblockedIds.has(item.userId)
    return (
      <View
        className="flex items-center justify-between px-4 py-4 bg-white border-b border-stone-100 active:bg-stone-50 transition-colors"
        onClick={() => handleClickItem(item.userId)}
      >
        <View className="flex items-center flex-1 min-w-0 space-x-3">
          <Avatar name={item.nickname} src={item.avatarUrl} className="w-[76px] h-[76px] rounded-full flex-shrink-0 shadow-sm" />
          <View className="flex-1 min-w-0">
            <Text className="text-[28px] font-bold text-stone-800 truncate max-w-[200px]">{item.nickname}</Text>
            <Text className="text-[22px] text-stone-400 mt-0.5 block">用户ID: {item.userId}</Text>
          </View>
        </View>
        <View
          className={`px-4 py-1.5 rounded-full active:scale-95 transition-all ${isUnblocked ? 'bg-stone-100 text-stone-400' : 'bg-red-50 border border-red-200 text-red-500'}`}
          onClick={(e) => handleUnblock(item.userId, e)}
        >
          <Text className={`text-[24px] font-medium ${isUnblocked ? 'text-stone-400' : 'text-red-500'}`}>
            {isUnblocked ? '已解除' : '解除拉黑'}
          </Text>
        </View>
      </View>
    )
  }, [unblockedIds, unblocking])

  return (
    <View className="min-h-screen bg-[#FAFAF9] font-sans flex flex-col">
      <NavBar title="拉黑列表" showBack />
      <View className="flex-1 overflow-hidden">
        <ScrollLoadList
          ref={listRef}
          request={(page, pageSize) => getBlacklist({ page, pageSize })}
          renderItem={renderItem}
          pageSize={20}
          emptyText="暂无拉黑用户"
          scrollViewProps={{ className: 'box-border' }}
        />
      </View>
    </View>
  )
}
