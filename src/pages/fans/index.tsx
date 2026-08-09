import { useCallback, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList, Avatar } from '@/components'
import { getMyFollowers, removeFollower } from '@/api/follow'
import type { UserFollowInfo } from '@/api/follow'

export default function FansPage() {
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

    const handleClickItem = (userId: string) => {
        Taro.navigateTo({ url: `/pages/user/index?id=${userId}` })
    }

    const handleRemove = async (userId: string, e: any) => {
        e.stopPropagation()
        await removeFollower(userId)
        Taro.showToast({ title: '已移除', icon: 'success' })
        setRemovedIds(prev => new Set(prev).add(userId))
    }

    const renderItem = useCallback((item: UserFollowInfo) => {
        const isRemoved = removedIds.has(item.userId)
        return (
            <View
                className='flex items-center justify-between px-4 py-4 bg-white border-b border-stone-100 active:bg-stone-50 transition-colors'
                onClick={() => handleClickItem(item.userId)}
            >
                <View className='flex items-center flex-1 min-w-0 space-x-3'>
                    <Avatar name={item.nickname} src={item.avatarUrl} className='w-[76px] h-[76px] rounded-full flex-shrink-0 shadow-sm' />
                    <View className='flex-1 min-w-0'>
                        <View className='flex flex-row items-center space-x-2'>
                            <Text className='text-[28px] font-bold text-stone-800 truncate max-w-[200px]'>{item.nickname}</Text>
                            {!isRemoved && item.isMutual && (
                                <View className='bg-orange-50 border border-orange-100 rounded-md px-1.5 py-0.5'>
                                    <Text className='text-[18px] text-orange-500 font-semibold'>互关</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                {!isRemoved && (
                    <View
                        className='px-4 py-1.5 border border-stone-300 rounded-full active:scale-95 transition-transform'
                        onClick={(e) => handleRemove(item.userId, e)}
                    >
                        <Text className='text-[24px] text-stone-500 font-medium'>移除</Text>
                    </View>
                )}
                {isRemoved && (
                    <View className='px-4 py-1.5 bg-stone-50 rounded-full'>
                        <Text className='text-[24px] text-stone-300 font-medium'>已移除</Text>
                    </View>
                )}
            </View>
        )
    }, [removedIds])

    return (
        <View className='min-h-screen bg-[#FAFAF9] font-sans box-border'>
            <ScrollLoadList
                request={(page, pageSize) => getMyFollowers({ page, pageSize })}
                renderItem={renderItem}
                pageSize={20}
                emptyText='暂无粉丝'
                scrollViewProps={{
                    className: 'box-border',
                    style: { height: '100vh' }
                }}
            />
        </View>
    )
}
