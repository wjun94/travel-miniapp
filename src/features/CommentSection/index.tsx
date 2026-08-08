import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Avatar } from '@/components';
import { useRequest } from 'ahooks';
import { getComments, getCommentReplies, type CommentItem } from '@/api/comment';
import { formatTime } from '@/utils';

interface CommentSectionProps {
    data: any;
    targetId: string;
    targetType: string;
    refreshKey?: number;
    className?: string;
    onLikeComment?: (id: string) => void;
    onReplyComment?: (comment: CommentItem) => void;
}

export default function CommentSection({ targetId, data, targetType, refreshKey, className = 'mx-4', onLikeComment, onReplyComment }: CommentSectionProps) {
    const { data: commentRes, loading } = useRequest(
        () => getComments({ target_type: targetType, target_id: targetId, page: 1, pageSize: 20 }),
        { ready: !!targetId, refreshDeps: [targetId, targetType, refreshKey] }
    );

    const comments: CommentItem[] = commentRes?.list || [];

    // 展开回复状态：记录已展开的评论 id
    const [expandedIds, setExpandedIds] = useState<Record<string, CommentItem[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

    /** 评论刷新后重新加载所有已展开的子回复 */
    useEffect(() => {
        if (!refreshKey) return;
        const expandedCommentIds = Object.keys(expandedIds);
        if (expandedCommentIds.length === 0) return;
        expandedCommentIds.forEach(async (commentId) => {
            setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
            try {
                const replies = await getCommentReplies({ parent_id: commentId });
                setExpandedIds(prev => ({ ...prev, [commentId]: replies || [] }));
            } catch {
                // 静默失败，保持旧数据
            } finally {
                setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
            }
        });
    }, [refreshKey]);

    const handleToggleReplies = async (commentId: string) => {
        // 已展开则收起
        if (expandedIds[commentId]) {
            setExpandedIds(prev => {
                const next = { ...prev };
                delete next[commentId];
                return next;
            });
            return;
        }
        // 未展开则加载
        setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
        try {
            const replies = await getCommentReplies({ parent_id: commentId });
            setExpandedIds(prev => ({ ...prev, [commentId]: replies || [] }));
        } catch {
            Taro.showToast({ title: '加载回复失败', icon: 'none' });
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    return (
        <View className={`mt-4 bg-white ${className} rounded-3xl p-5 shadow-sm`}>
            {/* 头部标题 */}
            <View className='flex flex-row items-baseline justify-between mb-6 pb-2 border-b border-stone-50'>
                <Text className='text-[34px] font-black text-stone-700 tracking-wider'>驴友热议</Text>
                <Text className='text-[22px] text-stone-400 font-semibold tracking-wide'>
                    共 {data?.commentCount || 0} 条互动
                </Text>
            </View>

            {loading ? (
                <View className='py-16 flex flex-col items-center justify-center space-y-3'>
                    <Text className='text-[28px] text-stone-400 animate-pulse font-medium'>努力加载中...</Text>
                </View>
            ) : comments.length === 0 ? (
                <View className='py-16 flex flex-col items-center justify-center space-y-3'>
                    <Text className='iconfont icon-message text-72px' />
                    <Text className='text-[24px] text-stone-400 font-medium'>暂无评论，快来坐个沙发吧~</Text>
                </View>
            ) : (
                <View className='space-y-6'>
                    {comments.map((item) => (
                        <View key={item.id} className='flex flex-row space-x-3 pb-6 border-b border-stone-100 last:border-0 last:pb-0'>
                            {/* 主头像 - 增加立体阴影与白色描边 */}
                            <View className='w-[80px] h-[80px] rounded-full overflow-hidden bg-stone-100 flex-shrink-0 shadow-sm border border-white ring-1 ring-stone-100'>
                                <Avatar name={item.nickname} src={item.avatarUrl} mode='aspectFill' className='w-full h-full' />
                            </View>

                            {/* 评论主体 */}
                            <View className='flex-1 flex flex-col min-w-0'>
                                {/* 顶部昵称与点赞 */}
                                <View className='flex flex-row items-center justify-between'>
                                    <View className='flex flex-row items-center space-x-2 min-w-0'>
                                        <Text className='font-bold text-stone-700 text-[28px] truncate max-w-[280px] tracking-wide'>
                                            {item.nickname || '匿名驴友'}
                                        </Text>
                                        {item.isAuthor && (
                                            <View className='bg-orange-500 rounded-md px-1.5 py-0.5 leading-0'>
                                                <Text className='text-[18px] text-white font-bold'>作者</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* 点赞按钮优化 */}
                                    <View
                                        onClick={() => onLikeComment?.(item.id)}
                                        className='flex flex-row items-center space-x-1 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-100/50 active:scale-95 active:bg-orange-50 active:border-orange-100 transition-all duration-150'
                                    >
                                        <Text className='iconfont icon-follow text-[22px] text-stone-400 active:text-orange-500' />
                                        <Text className='text-[20px] text-stone-500 font-semibold'>{item.likeCount || 0}</Text>
                                    </View>
                                </View>

                                {/* 如果是回复层级标识 */}
                                {item.parentId && (
                                    <Text
                                        onClick={() => onReplyComment?.(item)}
                                        className='text-[20px] text-orange-500 bg-orange-50/70 border border-orange-100/40 px-2 py-0.5 rounded-md w-fit my-1.5 font-bold active:opacity-75 transition-opacity'
                                    >
                                        回复层
                                    </Text>
                                )}

                                {/* 评论正文 - 优化行高与字间距 */}
                                <Text className='text-[26px] text-[#292524] leading-relaxed mt-1 break-all pr-2 tracking-wide font-normal'>
                                    {item.content}
                                </Text>

                                {/* 底部操作栏 */}
                                <View className='flex flex-row items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[22px] text-stone-400'>
                                    <Text className='font-medium'>{formatTime(item.createdAt)}</Text>
                                    <Text className='text-stone-300'>•</Text>
                                    <Text
                                        onClick={() => onReplyComment?.(item)}
                                        className='font-bold text-stone-500 active:text-orange-500 transition-colors duration-150'
                                    >
                                        回复
                                    </Text>

                                    {/* 展开/收起 触发器 */}
                                    {(item.replyCount ?? 0) > 0 && (
                                        <>
                                            <Text className='text-stone-300'>•</Text>
                                            <Text
                                                onClick={() => handleToggleReplies(item.id)}
                                                className='font-extrabold text-orange-500 active:text-orange-600 transition-colors duration-150'
                                            >
                                                {loadingReplies[item.id]
                                                    ? '加载中...'
                                                    : expandedIds[item.id]
                                                        ? '收起回复'
                                                        : `查看 ${item.replyCount} 条回复`
                                                }
                                            </Text>
                                        </>
                                    )}
                                </View>

                                {/* 优化后的子回复列表 - 嵌套质感强化 */}
                                {expandedIds[item.id] && expandedIds[item.id].length > 0 && (
                                    <View className='mt-3 bg-stone-50/60 border border-stone-100/80 rounded-2xl p-4 space-y-4 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[3px] before:bg-orange-500/20 before:rounded-full pl-5'>
                                        {expandedIds[item.id].map((reply) => (
                                            <View key={reply.id} className='flex flex-row items-start space-x-2.5 last:border-0'>
                                                {/* 子回复头像 - 微描边 */}
                                                <View className='w-[52px] h-[52px] rounded-full overflow-hidden bg-stone-200 flex-shrink-0 border border-white shadow-sm'>
                                                    <Avatar name={reply.nickname} src={reply.avatarUrl} mode='aspectFill' className='w-full h-full text-[20px]' />
                                                </View>
                                                {/* 子回复内容 */}
                                                <View className='flex-1 min-w-0 flex flex-col'>
                                                    <View className='flex flex-row items-center flex-wrap leading-0 space-x-1.5'>
                                                        <Text className='text-[22px] font-bold text-stone-700 truncate max-w-[180px]'>
                                                            {reply.nickname || '匿名驴友'}
                                                        </Text>
                                                        {reply.isAuthor && (
                                                            <View className='bg-orange-500 rounded-md px-1 py-0.5 leading-0'>
                                                                <Text className='text-[16px] text-white font-bold'>作者</Text>
                                                            </View>
                                                        )}
                                                        {reply.replyToNickname && (
                                                            <View className='flex flex-row items-center ml-1.5'>
                                                                <Text className='text-[20px] text-stone-400'>回复</Text>
                                                                <Text className='text-[20px] text-orange-500 font-semibold ml-0.5 truncate max-w-[150px]'>
                                                                    @{reply.replyToNickname}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text className='text-[24px] text-black leading-relaxed mt-1 break-all tracking-wide'>
                                                        {reply.content}
                                                    </Text>

                                                    {/* 子回复的时间与回复操作 */}
                                                    <View className='flex flex-row items-center space-x-2.5 mt-1.5 text-[20px] text-stone-400'>
                                                        <Text className='font-medium'>{formatTime(reply.createdAt)}</Text>
                                                        <Text className='text-stone-300'>•</Text>
                                                        <Text
                                                            onClick={() => onReplyComment?.(reply)}
                                                            className='font-bold text-stone-500 active:text-orange-500 transition-colors duration-150'
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
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}