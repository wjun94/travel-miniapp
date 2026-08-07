import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getNotificationDetail, markNotificationRead, NotificationItem } from '@/api/message';
import { NavBar } from '@/components';
import { formatTime } from '@/utils';

export default function MessageDetail() {
    const router = useRouter();
    const id = router.params?.id || '';
    const [detail, setDetail] = useState<NotificationItem | null>(null);
    const [loading, setLoading] = useState(true);

    // 拉取详情并自动标记已读
    useEffect(() => {
        if (!id) return;
        getNotificationDetail(id)
            .then((res) => {
                setDetail(res);
                markNotificationRead(id).catch(() => { });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    // 打开跳转链接
    const handleOpenLink = () => {
        if (!detail?.linkUrl) return;
        Taro.navigateTo({ url: `/pages/webview/index?src=${encodeURIComponent(detail.linkUrl)}` });
    };

    return (
        <>
            <NavBar showBack title='消息详情' />
            <View className='min-h-screen bg-gray-50 px-4 pt-4'>
                {loading ? (
                    <View className='py-20 text-center text-[24px] text-gray-400'>加载中...</View>
                ) : detail ? (
                    <View className='bg-white rounded-2xl px-5 py-6 shadow-sm'>
                        {/* 标题：系统消息显示消息标题，其余显示触发者昵称 */}
                        <Text className='text-[34px] font-bold text-gray-900 leading-snug block'>
                            {detail.type === 4 ? (detail.title || '公告') : (detail.fromUser?.nickname || '公告')}
                        </Text>

                        {/* 时间 + 未读标记 */}
                        <View className='flex flex-row items-center mt-3'>
                            <Text className='text-[22px] text-gray-400'>{formatTime(detail.createdAt)}</Text>
                            {!detail.isRead && (
                                <View className='w-[10px] h-[10px] rounded-full bg-[#F97316] ml-2' />
                            )}
                        </View>

                        {/* 分割线 */}
                        <View className='h-[1px] bg-gray-100 my-5' />

                        {/* 内容全文 */}
                        <Text className='text-[28px] leading-[1.8] text-gray-800 whitespace-pre-wrap'>
                            {detail.content}
                        </Text>

                        {/* 跳转链接 */}
                        {detail.linkUrl && (
                            <View className='mt-8' onClick={handleOpenLink}>
                                <View className='h-20 rounded-full bg-[#F97316] text-white text-[28px] font-medium flex items-center justify-center active:bg-[#EA580C]'>
                                    查看详情
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className='py-20 text-center text-[24px] text-gray-400'>消息不存在或已删除</View>
                )}
            </View>
        </>
    );
}
