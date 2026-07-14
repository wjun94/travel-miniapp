import { useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList, Image } from '@/components'
import { getMyFollowing, unfollowUser } from '@/api/follow'
import type { UserFollowInfo } from '@/api/follow'

export default function FollowPage() {
    const handleUnfollow = async (userId: string, e: any) => {
        e.stopPropagation()
        try {
            await unfollowUser(userId)
            Taro.showToast({ title: '已取消关注', icon: 'success' })
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' })
        }
    }

    const renderItem = useCallback((item: UserFollowInfo) => {
        return (
            <View className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-50">
                <View className="flex items-center flex-1 min-w-0">
                    <Image isAvatar src={item.avatarUrl} className="w-20 h-20 rounded-full text-12px flex-shrink-0" />
                    <View className="ml-3 flex-1 min-w-0">
                        <Text className="text-[28px] font-medium text-gray-800 truncate block">{item.nickname}</Text>
                        {item.isMutual && (
                            <Text className="text-[22px] text-gray-400">互相关注</Text>
                        )}
                    </View>
                </View>
                <View
                    className="px-4 py-1.5 bg-gray-100 rounded-full active:opacity-60"
                    onClick={(e) => handleUnfollow(item.userId, e)}
                >
                    <Text className="text-[24px] text-gray-500">已关注</Text>
                </View>
            </View>
        )
    }, [])

    return (
        <View className="min-h-screen bg-[#FCFBF7] font-sans box-border">
            <ScrollLoadList
                request={(page, pageSize) => getMyFollowing({ page, pageSize })}
                renderItem={renderItem}
                pageSize={20}
                emptyText="暂无关注"
                scrollViewProps={{
                    className: 'box-border',
                    style: { height: '100vh' }
                }}
            />
        </View>
    )
}
