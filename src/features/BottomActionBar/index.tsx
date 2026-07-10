import { useState, memo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { createComment } from '@/api/comment';
import { addFavorite, deleteFavorite } from '@/api/favorite'
import { likeTravelGuide, unlikeTravelGuide } from '@/api/guide'
import { useUpdate } from 'ahooks'

interface BottomActionBarProps {
    isLiked: boolean;
    isCollected: boolean;
    likeCount: number;
    commentCount: number;
    favoriteCount: number
    onLikeToggle: () => void;
    onCollectToggle: () => void;
    onCommentIconClick?: () => void;
    guideId: string;
    onCommentSuccess?: () => void;
}

export default memo(function BottomActionBar({
    isLiked,
    isCollected,
    likeCount,
    commentCount,
    favoriteCount,
    onLikeToggle,
    onCollectToggle,
    onCommentIconClick,
    guideId,
    onCommentSuccess
}: BottomActionBarProps) {
    const update = useUpdate();
    const [showInput, setShowInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || submitting) return;
        setSubmitting(true);
        try {
            await createComment({
                content: commentText.trim(),
                targetId: guideId,
                targetType: 'guide'
            });
            Taro.showToast({ title: '评论成功', icon: 'none' });
            setShowInput(false);
            setCommentText('');
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
                await likeTravelGuide(guideId);
            } else {
                await unlikeTravelGuide(guideId);
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
                await addFavorite({ targetId: guideId, targetType: 'guide' });
            } else {
                await deleteFavorite(guideId, 'guide');
            }
            update();
            onCollectToggle();
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' });
        }
    };

    return (
        <>
            {/* 底部操作栏 */}
            <View className='absolute bottom-0 left-0 right-0 h-[110px] bg-white/95 backdrop-blur-md border-t border-stone-100 flex flex-row items-center justify-between px-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.02)] z-50'>
                {/* 左侧留言气泡触发 */}
                <View
                    onClick={() => setShowInput(true)}
                    className='flex-1 h-[68px] bg-stone-50 border border-stone-100 rounded-full flex flex-row items-center px-4 mr-4 active:opacity-80 transition-all'
                >
                    <Text className='iconfont icon-edit text-[28px] text-stone-400 mr-2' />
                    <Text className='text-[24px] text-stone-400 font-medium'>说点什么...</Text>
                </View>

                {/* 右侧 Bento 紧凑质感图标组 */}
                <View className='flex flex-row items-center space-x-4'>
                    {/* 点赞：激活状态使用 #F97316 */}
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

                    {/* 留言锚点滚动 */}
                    <View
                        onClick={onCommentIconClick}
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform text-stone-700'
                    >
                        <Text className='iconfont icon-message text-[36px]' />
                        <Text className='text-[18px] text-stone-500 mt-0.5 font-medium'>{commentCount}</Text>
                    </View>

                    {/* 收藏：激活状态使用 #F97316 */}
                    <View
                        onClick={handleCollect}
                        className='flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform'
                    >
                        <Text
                            className={`iconfont ${isCollected ? 'icon-shoucang text-[36px]' : 'icon-weishoucang text-[36px]'}`}
                            style={{ color: isCollected ? '#F97316' : '#57534e' }}
                        />
                        <Text className='text-[18px] mt-0.5 font-medium' style={{ color: isCollected ? '#F97316' : '#78716c' }}>
                            {isCollected ? favoriteCount : '收藏'}
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
            <View className={`fixed inset-0 z-999 ${showInput ? 'block' : 'hidden'}`}>
                {/* 遮罩 */}
                <View
                    className='absolute inset-0 bg-black/40'
                    onClick={() => {
                        setShowInput(false);
                        setCommentText('');
                    }}
                />
                {/* 输入面板 */}
                <View className='absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 pb-safe shadow-lg'>
                    <View className='flex flex-row items-center space-x-3'>
                        <Input
                            type='text'
                            placeholder='分享你的出游心得或提问...'
                            value={commentText}
                            onInput={(e) => setCommentText(e.detail.value)}
                            className='flex-1 h-11 bg-stone-50 rounded-xl px-4 text-[26px] placeholder-stone-400 border-none'
                            focus
                            confirmType="send"
                            onConfirm={handleSubmitComment}
                        />
                        <View
                            onClick={handleSubmitComment}
                            className={`h-11 px-6 rounded-xl flex items-center justify-center transition-colors ${submitting || !commentText.trim() ? 'bg-stone-200' : 'bg-[#F97316]'}`}
                        >
                            <Text className='text-white text-[24px] font-bold'>发布</Text>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
});