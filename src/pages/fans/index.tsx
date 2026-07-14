import { useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList } from '@/components'
import { getMyFollowers, removeFollower } from '@/api/follow'
import type { UserFollowInfo } from '@/api/follow'

export default function FansPage() {
    const handleRemoveFollower = async (userId: string, e: any) => {
        e.stopPropagation()
        try {
            await removeFollower(userId)
            Taro.showToast({ title: '已移除', icon: 'success' })
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' })
        }
    }

    const renderItem = useCallback((item: UserFollowInfo) => {
        return (
            <View className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-50">
                <View className="flex items-center flex-1 min-w-0">
                    <Image src={item.avatarUrl} className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0" />
                    <View className="ml-3 flex-1 min-w-0">
                        <Text className="text-[28px] font-medium text-gray-800 truncate block">{item.nickname}</Text>
                        {item.isMutual && (
                            <Text className="text-[22px] text-gray-400">互相关注</Text>
                        )}
                    </View>
                </View>
                <View
                    className="px-4 py-1.5 border border-gray-300 rounded-full active:opacity-60"
                    onClick={(e) => handleRemoveFollower(item.userId, e)}
                >
                    <Text className="text-[24px] text-gray-500">移除</Text>
                </View>
            </View>
        )
    }, [])

    return (
        <View className="min-h-screen bg-[#FCFBF7] font-sans box-border">
            <ScrollLoadList
                request={(page, pageSize) => getMyFollowers({ page, pageSize })}
                renderItem={renderItem}
                pageSize={20}
                emptyText="暂无粉丝"
                scrollViewProps={{
                    className: 'box-border',
                    style: { height: '100vh' }
                }}
            />
        </View>
    )
}
