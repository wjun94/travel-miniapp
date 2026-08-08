import { useState, useEffect, memo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { createComment } from '@/api/comment';
import { addFavorite, deleteFavorite } from '@/api/favorite';
import { likeTravelGuide, unlikeTravelGuide } from '@/api/guide';
import { useUpdate } from 'ahooks';

interface BottomActionBarProps {
    isLiked: boolean;
    targetType: string;
    isCollected: boolean;
    likeCount: number;
    commentCount: number;
    favoriteCount: number;
    onLikeToggle: () => void;
    onCollectToggle: () => void;
    onCommentIconClick?: () => void;
    guideId: string;
    onCommentSuccess?: () => void;
    /** 自定义点赞函数（不传则使用默认 guide 点赞 API） */
    onLike?: (id: string) => Promise<unknown>;
    /** 自定义取消点赞函数 */
    onUnlike?: (id: string) => Promise<unknown>;
    /** 回复目标（点回复时传入） */
    replyTo?: { parentId: string; nickname: string } | null;
    /** 清除回复目标 */
    onClearReply?: () => void;
}

export default memo(function BottomActionBar({
    isLiked,
    targetType,
    isCollected,
    likeCount,
    commentCount,
    favoriteCount,
    onLikeToggle,
    onCollectToggle,
    onCommentIconClick,
    guideId,
    onCommentSuccess,
    onLike,
    onUnlike,
    replyTo,
    onClearReply
}: BottomActionBarProps) {
    const update = useUpdate();
    const [showInput, setShowInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 接收外部 replyTo 时自动打开输入面板
    useEffect(() => {
        if (replyTo?.parentId) {
            setShowInput(true);
        }
    }, [replyTo]);

    const handleCloseInput = () => {
        setShowInput(false);
        setCommentText('');
        onClearReply?.();
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || submitting) return;
        setSubmitting(true);
        try {
            await createComment({
                content: commentText.trim(),
                targetId: guideId,
                targetType,
                parentId: replyTo?.parentId || undefined
            });
            Taro.showToast({ title: '评论成功', icon: 'success' });
            setShowInput(false);
            setCommentText('');
            onClearReply?.();
            onCommentSuccess?.();
        } catch {
            Taro.showToast({ title: '发布失败', icon: 'none' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async () => {
        try {
            if (!isLiked) {
                if (onLike) await onLike(guideId);
                else await likeTravelGuide(guideId);
            } else {
                if (onUnlike) await onUnlike(guideId);
                else await unlikeTravelGuide(guideId);
            }
            update();
            onLikeToggle();
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' });
        }
    };

    const handleCollect = async () => {
        try {
            if (!isCollected) {
                await addFavorite({ targetId: guideId, targetType });
            } else {
                await deleteFavorite(guideId, targetType);
            }
            update();
            onCollectToggle();
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' });
        }
    };

    const isButtonDisabled = submitting || !commentText.trim();

    return (
        <>
            {/* 底部操作栏 */}
            <View className='fixed bottom-0 left-0 right-0 h-[110px] bg-white/95 backdrop-blur-md border-t border-stone-100 flex flex-row items-center justify-between px-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.02)] z-50'>
                {/* 左侧留言气泡触发 */}
                <View
                    onClick={() => setShowInput(true)}
                    className='flex-1 h-[68px] bg-stone-50 border border-stone-100/80 rounded-full flex flex-row items-center px-4 mr-4 active:opacity-80 active:scale-[0.99] transition-all'
                >
                    <Text className='iconfont icon-edit text-[28px] text-stone-400 mr-2' />
                    <Text className='text-[24px] text-stone-400 font-medium'>说点什么...</Text>
                </View>

                {/* 右侧 Bento 图标组 */}
                <View className='flex flex-row items-center space-x-4'>
                    {/* 点赞 */}
                    <View
                        onClick={handleLike}
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform'
                    >
                        <Text
                            className={`iconfont ${isLiked ? 'icon-follow-fill text-[36px]' : 'icon-follow text-[36px]'}`}
                            style={{ color: isLiked ? '#f87171' : '#57534e' }}
                        />
                        <Text className='text-[18px] mt-0.5 font-medium' style={{ color: isLiked ? '#F97316' : '#78716c' }}>
                            {likeCount || '点赞'}
                        </Text>
                    </View>

                    {/* 留言锚点 */}
                    <View
                        onClick={onCommentIconClick}
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform text-stone-700'
                    >
                        <Text className='iconfont icon-message text-[36px]' />
                        <Text className='text-[18px] text-stone-500 mt-0.5 font-medium'>{commentCount}</Text>
                    </View>

                    {/* 收藏 */}
                    <View
                        onClick={handleCollect}
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform'
                    >
                        <Text
                            className={`iconfont ${isCollected ? 'icon-shoucang text-[36px]' : 'icon-weishoucang text-[36px]'}`}
                            style={{ color: isCollected ? '#F97316' : '#57534e' }}
                        />
                        <Text className='text-[18px] mt-0.5 font-medium' style={{ color: isCollected ? '#F97316' : '#78716c' }}>
                            {favoriteCount || '收藏'}
                        </Text>
                    </View>

                    {/* 原生转发 */}
                    <Button
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform bg-transparent p-0 m-0 border-0 text-stone-700 after:border-0'
                        openType="share"
                    >
                        <Text className='iconfont icon-share text-[36px]' />
                        <Text className='text-[18px] text-stone-500 mt-0.5 font-medium'>分享</Text>
                    </Button>
                </View>
            </View>

            {/* 底部弹出评论输入面板 */}
            <View className={`fixed inset-0 z-50 transition-all duration-300 ${showInput ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
                {/* 磨砂玻璃遮罩层 */}
                <View
                    className='absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300'
                    onClick={handleCloseInput}
                />

                {/* 输入面板主体 */}
                <View
                    className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out transform ${showInput ? 'translate-y-0' : 'translate-y-full'
                        }`}
                >
                    {/* 回复对象提示栏 (Bento胶囊样式) */}
                    {replyTo && (
                        <View className='flex flex-row items-center justify-between mb-3 px-3 py-2 bg-orange-50/60 rounded-xl border border-orange-100/50'>
                            <View className='flex flex-row items-center'>
                                <Text className='text-[20px] bg-[#F97316] text-white px-2 py-0.5 rounded-md mr-2 font-bold'>回复</Text>
                                <Text className='text-[24px] text-stone-700 font-medium'>@{replyTo.nickname}</Text>
                            </View>
                            <Text
                                onClick={() => {
                                    setCommentText('');
                                    onClearReply?.();
                                }}
                                className='text-[22px] text-stone-400 active:text-stone-600 px-2'
                            >
                                取消回复
                            </Text>
                        </View>
                    )}

                    {/* 输入主区域 */}
                    <View className='flex flex-row items-center space-x-3'>
                        <Input
                            type='text'
                            placeholder={replyTo ? `回复 ${replyTo.nickname}...` : '分享你的出游心得或提问...'}
                            value={commentText}
                            onInput={(e) => setCommentText(e.detail.value)}
                            className='flex-1 h-12 bg-stone-50 border border-stone-100 rounded-2xl px-4 text-[26px] placeholder-stone-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]'
                            focus={showInput}
                            confirmType="send"
                            adjustPosition={true} // 动态顶起，防止键盘遮挡
                            onConfirm={handleSubmitComment}
                        />
                        <View
                            onClick={handleSubmitComment}
                            className={`h-12 px-6 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isButtonDisabled
                                    ? 'bg-stone-100 text-stone-400 opacity-60'
                                    : 'bg-[#F97316] text-white shadow-[0_4px_12px_rgba(249,115,22,0.2)]'
                                }`}
                        >
                            <Text className={`text-[24px] font-bold ${isButtonDisabled ? 'text-stone-400' : 'text-white'}`}>
                                发布
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
});