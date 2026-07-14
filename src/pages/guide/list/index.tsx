import { useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ScrollLoadList } from '@/components'
import { getMyGuides } from '@/api/guide'
import type { Guide } from '@/api/post'

export default function MyGuideListPage() {
    const renderCard = useCallback((item: Guide) => {
        return (
            <View
                className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 w-full box-border"
                onClick={() => Taro.navigateTo({ url: `/pages/guide/detail/index?id=${item.id}` })}
            >
                <View className="w-full h-44 relative bg-gray-50">
                    <Image src={item.coverImage} mode="aspectFill" className="w-full h-full" />
                </View>

                <View className="p-2.5 flex flex-col">
                    <Text className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 white-space-normal mb-1">
                        {item.title}
                    </Text>

                    {(item.tripDays || item.sectionCount) && (
                        <View className="flex flex-row items-center gap-2 mb-1">
                            {item.tripDays && (
                                <View className="bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <Text className="text-[20rpx] text-emerald-600 font-medium">📅 {item.tripDays}天</Text>
                                </View>
                            )}
                            {item.sectionCount && (
                                <View className="bg-stone-50 px-2 py-0.5 rounded-full">
                                    <Text className="text-[20rpx] text-stone-500 font-medium">📍 {item.sectionCount}个行程</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View className="flex flex-row items-center justify-between mt-auto">
                        <View className="flex flex-row items-center flex-1 min-w-0 mr-2">
                            <Image src={item.authorAvatar} className="w-4 h-4 rounded-full bg-gray-100 flex-shrink-0" />
                            <Text className="text-[22rpx] text-gray-500 ml-1 truncate flex-1">{item.authorName}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }, [])

    return (
        <View className="min-h-screen bg-[#FCFBF7] font-sans box-border">
            <ScrollLoadList
                request={getMyGuides}
                renderItem={renderCard}
                numColumns={2}
                columnGap={12}
                rowGap={12}
                masonry
                pageSize={10}
                emptyText="暂无攻略"
                scrollViewProps={{
                    className: 'px-4 pb-10 box-border',
                    style: { height: '100vh' }
                }}
            />
        </View>
    )
}