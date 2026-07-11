import { View, Text } from '@tarojs/components';
import { Image } from '@/components';
import { useRequest } from 'ahooks';
import { getComments, type CommentItem } from '@/api/comment';

interface CommentSectionProps {
    targetId: string;
    targetType: string;
    refreshKey?: number;
    onLikeComment?: (id: string) => void;
    onReplyComment?: (comment: CommentItem) => void;
}

export default function CommentSection({ targetId, targetType, refreshKey, onLikeComment, onReplyComment }: CommentSectionProps) {
    const { data: commentRes, loading } = useRequest(
        () => getComments({ target_type: targetType, target_id: targetId, page: 1, pageSize: 20 }),
        { ready: !!targetId, refreshDeps: [targetId, targetType, refreshKey] }
    );

    const comments: CommentItem[] = commentRes?.list || [];
    return (
        <View className='mt-4 bg-white mx-4 rounded-3xl p-5 shadow-sm mb-[160px]'>
            <View className='flex flex-row items-center justify-between mb-4'>
                <Text className='text-[30px] font-extrabold text-stone-800 tracking-wide'>驴友热议</Text>
                <Text className='text-[22px] text-stone-400'>共 {comments.length} 条互动</Text>
            </View>

            {loading ? (
                <View className='py-12 flex flex-col items-center justify-center space-y-2'>
                    <Text className='text-[28px] text-stone-300'>加载中...</Text>
                </View>
            ) : comments.length === 0 ? (
                <View className='py-12 flex flex-col items-center justify-center space-y-2'>
                    <Text className='text-[44px]'>💬</Text>
                    <Text className='text-[24px] text-stone-400'>暂无评论，快来坐个沙发吧~</Text>
                </View>
            ) : (
                <View className='space-y-4'>
                    {comments.map((item) => (
                        <View key={item.id} className='flex flex-row space-x-3 pb-4 border-b border-stone-50 last:border-0 last:pb-0'>
                            {/* 头像 */}
                            <View className='w-[72px] h-[72px] rounded-full overflow-hidden bg-stone-100 flex-shrink-0'>
                                <Image isAvatar src={item.avatarUrl} mode='aspectFill' className='w-full h-full' />
                            </View>

                            {/* 评论主体 */}
                            <View className='flex-1 flex flex-col'>
                                <View className='flex flex-row items-center justify-between'>
                                    <Text className='text-[26px] font-bold text-stone-700'>{item.nickname || '匿名驴友'}</Text>

                                    {/* 点赞接口互动 */}
                                    <View
                                        onClick={() => onLikeComment?.(item.id)}
                                        className='flex flex-row items-center space-x-1 p-1 active:scale-95 transition-transform'
                                    >
                                        <Text className='iconfont icon-follow text-[24px] text-stone-400' />
                                        <Text className='text-[20px] text-stone-400'>{item.likeCount || 0}</Text>
                                    </View>
                                </View>

                                {/* 区分回复与普通评论 */}
                                {item.parentId && (
                                    <Text className='text-[20px] text-[#F97316] bg-orange-50 px-1.5 py-0.5 rounded w-fit my-1 font-medium'>
                                        回复层
                                    </Text>
                                )}

                                <Text className='text-[25px] text-stone-600 leading-relaxed mt-1'>{item.content}</Text>

                                <View className='flex flex-row items-center space-x-4 mt-2'>
                                    <Text className='text-[20px] text-stone-400'>{item.createdAt}</Text>
                                    <Text
                                        onClick={() => onReplyComment?.(item)}
                                        className='text-[22px] font-medium text-stone-500 active:text-[#F97316]'
                                    >
                                        回复
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}