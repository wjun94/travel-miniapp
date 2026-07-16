import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getNotificationList, markNotificationAsRead, NotificationItem } from '@/api/message';
import { NavBar, ScrollLoadList, Image } from '@/components';
import { formatTime } from '@/utils';

const TYPE_ICONS: Record<number, { icon: string; bg: string }> = {
    1: { icon: '🤝', bg: 'bg-blue-50' },
    2: { icon: '👍', bg: 'bg-red-50' },
    3: { icon: '👤', bg: 'bg-green-50' },
    4: { icon: '📢', bg: 'bg-orange-50' },
    5: { icon: '💬', bg: 'bg-purple-50' },
};

export default function MessageList() {
    const router = useRouter();
    const defaultType = router.params?.type ? Number(router.params.type) : undefined;
    const [listKey, setListKey] = useState(0);

    const handleItemClick = async (item: NotificationItem) => {
        // 标记已读
        if (!item.isRead) {
            try {
                await markNotificationAsRead(item.id);
                setListKey(v => v + 1);
            } catch { /* ignore */ }
        }

        // 根据 targetType/targetId 跳转
        const routeMap: Record<string, string> = {
            guide: '/pages/guide/detail/index',
            trip: '/pages/trip/detail/index',
            partner: '/pages/partner/detail/index',
        };
        const basePath = routeMap[item.targetType];
        if (basePath && item.targetId) {
            Taro.navigateTo({ url: `${basePath}?id=${item.targetId}` });
        } else if (item.targetType === 'follow') {
            Taro.navigateTo({ url: '/pages/fans/index' });
        }
    };

    return (
        <View className='min-h-screen bg-gray-50 flex flex-col'>
            <NavBar showBack title='消息中心' />

            {/* 通知列表 */}
            <ScrollLoadList
                key={listKey}
                className='flex-1'
                request={(page, pageSize) =>
                    getNotificationList({ type: defaultType, page, pageSize })
                }
                renderItem={(item) => {
                    const info = item.type ? TYPE_ICONS[item.type] : TYPE_ICONS[4];
                    return (
                        <View
                            onClick={() => handleItemClick(item)}
                            className={`
                                relative flex flex-row items-start px-4 py-4 border-b border-gray-100 transition-all duration-150 active:scale-[0.99]
                                ${item.isRead
                                    ? 'bg-white active:bg-gray-50'
                                    : 'bg-orange-50/10 active:bg-orange-50/30'
                                }
                            `}
                        >
                            {/* 未读状态左侧主题色竖条：改用圆角，视觉更柔和 */}
                            {!item.isRead && (
                                <View className='absolute left-0 top-3 bottom-3 w-[4px] rounded-r-md bg-[#F97316]' />
                            )}

                            {/* 用户头像 + 类型小标：改为 items-start 顶部对齐 */}
                            <View className='relative shrink-0 mt-0.5'>
                                <Image
                                    isAvatar
                                    src={item.fromUser?.avatarUrl}
                                    className='w-[80px] h-[80px] rounded-full ring-2 ring-white shadow-sm'
                                />
                                <View className={`absolute -bottom-1 -right-1 w-[32px] h-[32px] rounded-full flex items-center justify-center text-[16px] border-2 border-white shadow-sm ${info.bg}`}>
                                    <Text>{info.icon}</Text>
                                </View>
                            </View>

                            {/* 内容区：去除了固定的 h-[80px]，改为自适应高度，配合 space-y 控制间距 */}
                            <View className='flex-1 ml-3 min-w-0 flex flex-col justify-start py-0.5 space-y-1'>
                                {/* 第一行：昵称 + 时间 */}
                                <View className='flex flex-row items-center justify-between'>
                                    <View className='flex flex-row items-center min-w-0'>
                                        <Text className={`text-[26px] font-semibold truncate ${item.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {item.fromUser?.nickname || ''}
                                        </Text>
                                        {!item.isRead && (
                                            <View className='w-[10px] h-[10px] rounded-full bg-[#F97316] shrink-0 ml-2 animate-pulse' />
                                        )}
                                    </View>
                                    {/* 时间戳移到右上角，更符合主流社交 App 规范 */}
                                    <Text className='text-[20px] text-gray-400 shrink-0 ml-4'>{formatTime(item.createdAt)}</Text>
                                </View>

                                {/* 第二行：消息正文 */}
                                <Text className={`text-[24px] leading-relaxed line-clamp-2 ${item.isRead ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {item.content}
                                </Text>

                                {/* 第三行：评论/回复气泡背景 */}
                                {item.commentContent && (
                                    <View className='mt-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg max-w-full'>
                                        <Text className='text-[22px] text-gray-500 line-clamp-2 leading-relaxed'>
                                            {item.commentContent}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                }}
                emptyText='暂无通知消息'
                pageSize={20}
            />
        </View>
    );
}