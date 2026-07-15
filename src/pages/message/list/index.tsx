import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getNotificationList, markNotificationAsRead, NotificationItem } from '@/api/message';
import { NavBar, ScrollLoadList } from '@/components';
import { formatTime } from '@/utils';

// 优化图标背景，使第4类（公告/系统）呼应 #F97316 主题色
const TYPE_ICONS: Record<number, { icon: string; bg: string }> = {
    1: { icon: '🤝', bg: 'bg-blue-50' },
    2: { icon: '👍', bg: 'bg-red-50' },
    3: { icon: '👤', bg: 'bg-green-50' },
    4: { icon: '📢', bg: 'bg-orange-50' }, // 呼应主题色
};

export default function MessageList() {
    const router = useRouter();
    const defaultType = router.params?.type ? Number(router.params.type) : undefined;
    const [listKey, setListKey] = useState(0);

    const handleItemClick = async (item: NotificationItem) => {
        if (!item.isRead) {
            try {
                await markNotificationAsRead(item.id);
                setListKey(v => v + 1);
            } catch { /* ignore */ }
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
                                relative flex flex-row items-center px-4 py-4 border-b border-gray-100 transition-all duration-200
                                ${item.isRead
                                    ? 'bg-white active:bg-gray-50'
                                    : 'bg-orange-50/20 active:bg-orange-50/40' // 未读消息采用温和的浅橙底色
                                }
                            `}
                        >
                            {/* 未读状态左侧精致主题色竖条 */}
                            {!item.isRead && (
                                <View className='absolute left-0 top-0 bottom-0 w-[4px] bg-[#F97316]' />
                            )}

                            {/* 图标区：加入微弱阴影增加立体感 */}
                            <View className={`w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-[36px] shrink-0 shadow-sm ${info.bg}`}>
                                <Text>{info.icon}</Text>
                            </View>

                            {/* 内容区 */}
                            <View className='flex-1 ml-4 min-w-0 flex flex-col justify-between h-[88px]'>
                                <View className='flex flex-row items-start justify-between'>
                                    {/* 支持最多2行折行展示，提升可读性 */}
                                    <Text className={`
                                        flex-1 text-[26px] leading-snug line-clamp-2 pr-2
                                        ${item.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}
                                    `}>
                                        {item.content}
                                    </Text>

                                    {/* 右侧未读小红点（主题色） */}
                                    {!item.isRead && (
                                        <View className='w-[14px] h-[14px] rounded-full bg-[#F97316] shrink-0 mt-1.5' />
                                    )}
                                </View>

                                <Text className='text-[20px] text-gray-400 mt-1'>{formatTime(item.createdAt)}</Text>
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