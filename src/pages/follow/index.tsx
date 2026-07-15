import { useCallback, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList, Image } from '@/components'
import { getMyFollowing, followUser, unfollowUser } from '@/api/follow'
import type { UserFollowInfo } from '@/api/follow'

export default function FollowPage() {
    const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set())

    const handleClickItem = (userId: string) => {
        Taro.navigateTo({ url: `/pages/user/index?id=${userId}` })
    }

    const handleToggleFollow = async (userId: string, isUnfollowed: boolean, e: any) => {
        e.stopPropagation()
        try {
            if (isUnfollowed) {
                await followUser(userId)
                Taro.showToast({ title: '关注成功', icon: 'success' })
                setUnfollowedIds(prev => {
                    const next = new Set(prev)
                    next.delete(userId)
                    return next
                })
            } else {
                await unfollowUser(userId)
                Taro.showToast({ title: '已取消关注', icon: 'success' })
                setUnfollowedIds(prev => new Set(prev).add(userId))
            }
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' })
        }
    }

    const renderItem = useCallback((item: UserFollowInfo) => {
        const isUnfollowed = unfollowedIds.has(item.userId)
        return (
            <View
                className='flex items-center justify-between px-4 py-4 bg-white border-b border-stone-100 active:bg-stone-50 transition-colors'
                onClick={() => handleClickItem(item.userId)}
            >
                <View className='flex items-center flex-1 min-w-0 space-x-3'>
                    <Image isAvatar src={item.avatarUrl} className='w-[76px] h-[76px] rounded-full flex-shrink-0 shadow-sm' />
                    <View className='flex-1 min-w-0'>
                        <View className='flex flex-row items-center space-x-2'>
                            <Text className='text-[28px] font-bold text-stone-800 truncate max-w-[200px]'>{item.nickname}</Text>
                            {!isUnfollowed && item.isMutual && (
                                <View className='bg-orange-50 border border-orange-100 rounded-md px-1.5 py-0.5'>
                                    <Text className='text-[18px] text-orange-500 font-semibold'>互关</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View
                    className={`px-4 py-1.5 rounded-full active:scale-95 transition-all ${isUnfollowed ? 'bg-[#F97316] text-white' : 'bg-stone-100 text-stone-500'}`}
                    onClick={(e) => handleToggleFollow(item.userId, isUnfollowed, e)}
                >
                    <Text className={`text-[24px] font-medium ${isUnfollowed ? 'text-white' : 'text-stone-500'}`}>
                        {isUnfollowed ? '关注' : '已关注'}
                    </Text>
                </View>
            </View>
        )
    }, [unfollowedIds])

    return (
        <View className='min-h-screen bg-[#FAFAF9] font-sans box-border'>
            <ScrollLoadList
                request={(page, pageSize) => getMyFollowing({ page, pageSize })}
                renderItem={renderItem}
                pageSize={20}
                emptyText='暂无关注'
                scrollViewProps={{
                    className: 'box-border',
                    style: { height: '100vh' }
                }}
            />
        </View>
    )
}
