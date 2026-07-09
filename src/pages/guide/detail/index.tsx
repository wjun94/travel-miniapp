import { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import { Image } from '@/components'
import Taro, { useRouter } from '@tarojs/taro';
import { getTravelGuideDetail, TravelGuide } from '@/api/guide';
import { createHistoryRecord } from '@/api/history'
import { useRequest } from 'ahooks';
import { SECTION_MAP, typeConfigMap, getTransportLabel } from '@/constants/travel';

export default function TravelGuideDetail() {
    const router = useRouter();
    const { id } = router.params || {};

    const [currentDayIdx, setCurrentDayIdx] = useState(0);
    // 控制 ScrollView 滚动到指定 id 的锚点
    const [scrollTargetId, setScrollTargetId] = useState('');

    const [isLiked, setIsLiked] = useState(false);
    const [isCollected, setIsCollected] = useState(false);
    const [likeCount, setLikeCount] = useState(128);
    const [commentCount, setCommentCount] = useState(45);

    const { data: guideData, error, loading } = useRequest(
        () => getTravelGuideDetail(id || ''),
        {
            refreshDeps: [id],
            onSuccess: (data) => {
                setCurrentDayIdx(0);
                if (data?.guide) {
                    createHistoryRecord({
                        targetId: id || '',
                        targetType: 'guide',
                        title: data.guide.title || '',
                        coverImage: data.guide.coverImage || '',
                    }).catch(() => { });
                }
            }
        }
    );

    const guide = guideData?.guide || {} as TravelGuide;
    const days = guideData?.days || [];
    const tagList = guide.tags ? guide.tags.split(',').filter(Boolean) : [];

    const getImgArray = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images.slice(0, 9);
        if (typeof images === 'string') return images.split(',').filter(Boolean).slice(0, 9);
        return [];
    };

    const formatTimeRange = (start, end) => {
        if (!start && !end) return '全天/待定';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    // 点击 Tab 切换锚点
    const handleTabClick = (idx: number) => {
        setCurrentDayIdx(idx);
        setScrollTargetId(`day-node-${idx}`);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleCollect = () => {
        setIsCollected(!isCollected);
    };

    const handleCommentClick = () => {
        console.log('点击评论');
    };

    const handleSwitchView = () => {
        console.log('切换或查看新视图');
        Taro.navigateTo({ url: `../preview/index?id=${id}` })
    };

    if (loading) {
        return (
            <View className='w-full h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-[24px]'>
                <Text>正在探索行程中...</Text>
            </View>
        );
    }

    if (error || !guideData) {
        return (
            <View className='w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400 text-[24px] space-y-2'>
                <Text className='text-[40px]'>⚠️</Text>
                <Text>行程数据加载失败或不存在</Text>
            </View>
        );
    }

    return (
        <View className='relative w-full h-screen bg-gray-50'>
            {/* 主内容滚动区域：添加 scrollIntoView 和 scrollWithAnimation 属性实现平滑锚点 */}
            <ScrollView
                scrollY
                scrollWithAnimation
                scrollIntoView={scrollTargetId}
                className='w-full h-full pb-[140px] box-border'
            >
                {/* 顶部封面 */}
                <View className='relative w-full h-[480px] bg-gray-200'>
                    {guide.coverImage && <Image src={guide.coverImage} mode='aspectFill' className='w-full h-full' />}
                </View>

                {/* 基本信息卡片 */}
                <View className='relative -mt-6 mx-4 bg-white rounded-t-3xl p-5 shadow-sm'>
                    <View className='flex flex-row items-center flex-wrap gap-2 mb-2'>
                        <Text className='text-[32px] font-bold text-gray-900 leading-snug'>{guide.title || '未命名故事'}</Text>
                        {guide.isOriginal === 1 && (
                            <Text className='bg-green-100 text-green-700 text-[20px] px-1.5 py-0.5 rounded font-medium'>
                                原创
                            </Text>
                        )}
                    </View>

                    {guide.destination && (
                        <View className='flex flex-row items-center text-gray-500 text-[24px] mb-4'>
                            <Text className='mr-1 text-[24px]'>📍</Text>
                            <Text className='text-[24px]'>{guide.destination}</Text>
                        </View>
                    )}

                    {/* 关键信息网格 */}
                    <View className='grid grid-cols-4 gap-2 py-3 border-t border-b border-gray-100 text-center'>
                        <View>
                            <Text className='block text-gray-500 mb-1 text-[22px]'>🍂 最佳季节</Text>
                            <Text className='text-gray-800 font-medium text-[24px]'>{guide.bestSeason || '不限'}</Text>
                        </View>
                        {guide.recommendedDays && <View>
                            <Text className='block text-gray-500 mb-1 text-[22px]'>⏱️ 推荐天数</Text>
                            <Text className='text-gray-800 font-medium text-[24px]'>{guide.recommendedDays}天</Text>
                        </View>}
                        {guide?.difficulty && <View>
                            <Text className='block text-gray-500 mb-1 text-[22px]'>⛰️ 难度</Text>
                            <Text className='text-[24px] text-gray-800 font-medium'>{guide.difficulty}</Text>
                        </View>}
                        {guide.crowdType && <View>
                            <Text className='block text-gray-500 mb-1 text-[22px]'>👥 适用人群</Text>
                            <Text className='text-gray-800 font-medium text-[24px]'>{guide.crowdType}</Text>
                        </View>}
                    </View>

                    {guide.summary && (
                        <Text className='text-[24px] text-gray-500 leading-relaxed block mt-3 mb-4'>
                            {guide.summary}
                        </Text>
                    )}

                    {/* 预算 */}
                    <View className='flex flex-row items-center text-[24px] mt-3'>
                        <Text className='text-[27px] text-gray-700 font-medium mr-2'>预算范围</Text>
                        <View className='bg-green-50 text-green-600 font-bold px-3 py-1 rounded-full text-[24px]'>
                            {guide.budgetMin !== null && guide.budgetMax !== null
                                ? `¥${guide.budgetMin} ~ ¥${guide.budgetMax}/人`
                                : '经济随心'}
                        </View>
                    </View>

                    {/* 标签 */}
                    {tagList.length > 0 && (
                        <View className='flex flex-row flex-wrap gap-2 mt-3'>
                            {tagList.map((tag, idx) => (
                                <Text key={idx} className='bg-gray-100 text-gray-600 text-[22px] px-3 py-1 rounded-full'>
                                    #{tag}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* 行程概览 Tab 栏 */}
                {days.length > 0 && (
                    <View className='mt-4 bg-white mx-4 rounded-2xl p-4 shadow-sm'>
                        <View className='flex flex-row justify-between items-center mb-3'>
                            <Text className='text-[28px] font-bold text-gray-900'>行程概览</Text>
                            {days[currentDayIdx]?.title && (
                                <Text className='text-[22px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg'>
                                    {days[currentDayIdx].title}
                                </Text>
                            )}
                        </View>

                        <ScrollView scrollX scrollWithAnimation className='w-full whitespace-nowrap pb-2' showScrollbar={false}>
                            {days.map((day, idx) => {
                                const isSelected = currentDayIdx === idx;
                                return (
                                    <View
                                        key={day.id || idx}
                                        onClick={() => handleTabClick(idx)}
                                        className={`inline-block px-4 py-2 rounded-full text-[24px] font-bold mr-3 transition-all ${isSelected
                                            ? 'bg-green-500 text-white shadow-sm'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}
                                    >
                                        第{day.dayNumber || (idx + 1)}天
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* ==================== 变更：全部行程纵向平铺展示区 ==================== */}
                {days.length > 0 && (
                    <View className='mt-2 space-y-6 w-full box-border'>
                        {days.map((dayItem, dIdx) => (
                            <View
                                key={dayItem.id || dIdx}
                                id={`day-node-${dIdx}`} // 绑定锚点 ID
                                className='w-full px-4 box-border scroll-mt-4' // 添加额外间距保障滚动位置美观
                            >
                                {/* 新增：每一天的独立大标题栏 */}
                                <View className='flex flex-row items-center justify-between my-3 px-2'>
                                    <Text className='text-[32px] font-extrabold text-gray-800'>
                                        第 {dayItem.dayNumber || (dIdx + 1)} 天
                                    </Text>
                                    {dayItem.title && (
                                        <Text className='text-[24px] text-gray-400 font-medium truncate max-w-[400px]'>
                                            {dayItem.title}
                                        </Text>
                                    )}
                                </View>

                                {/* 内部原有的时间轴及路线内容视图样式 */}
                                <View className='relative w-full pl-8 box-border pb-2'>
                                    {dayItem?.items && dayItem.items.length > 0 ? (
                                        <>
                                            {/* 主轴线 */}
                                            <View className='absolute left-[20px] top-6 bottom-6 w-[2px] bg-gray-200' />

                                            <View className='space-y-4'>
                                                {dayItem.items.map((item, index) => {
                                                    const config = SECTION_MAP[item.sectionType] || SECTION_MAP.attraction;
                                                    const typeCfg = typeConfigMap[item.sectionType] || typeConfigMap.attraction;
                                                    const imgList = getImgArray(item.images);
                                                    const hasImages = imgList.length > 0;
                                                    const price = Number(item.ticketPrice);
                                                    const hasPrice = item.ticketPrice !== null && !isNaN(price);
                                                    const isTransport = item.sectionType === 'transport';
                                                    const isTips = item.sectionType === 'tips';

                                                    if (isTransport) {
                                                        return (
                                                            <View key={item.id || index} className='relative my-2 py-1 flex flex-row items-center pl-2'>
                                                                <View className='absolute -left-[52px] w-2 h-2 rounded-full bg-[#D1CFC9] z-10 border border-white' />
                                                                <View className='bg-[#F1F6F2] rounded-full px-3 py-1 flex flex-row items-center space-x-2 border border-white shadow-sm'>
                                                                    <Text className='text-[24px]'>🚗</Text>
                                                                    <Text className='text-[22px] text-gray-500 font-medium'>
                                                                        {getTransportLabel((item as any).transportMode)}
                                                                        {item.description ? ` · ${item.description}` : ''}
                                                                    </Text>
                                                                    {((item as any).startAddress || (item as any).endAddress) && (
                                                                        <>
                                                                            <Text className='text-gray-300 text-[20px]'>|</Text>
                                                                            <Text className='text-[20px] text-gray-400 max-w-[200px] truncate'>
                                                                                {((item as any).startAddress || '起点')} → {((item as any).endAddress || '终点')}
                                                                            </Text>
                                                                        </>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        );
                                                    }

                                                    return (
                                                        <View key={item.id || index} className='relative'>
                                                            <View
                                                                className='absolute -left-[60px] top-[22px] -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full z-10 shadow-sm'
                                                                style={{ backgroundColor: config.ringColor }}
                                                            >
                                                                <View className='w-2 h-2 rounded-full' style={{ backgroundColor: config.dotColor }} />
                                                            </View>

                                                            <View className='bg-white rounded-2xl p-4 shadow-sm box-border ml-2'>
                                                                <View className='flex flex-row items-center justify-between mb-3'>
                                                                    <Text className='text-[24px] font-medium text-gray-400 flex items-center'>
                                                                        ⏱️ {formatTimeRange(item.startTime, item.endTime)}
                                                                    </Text>
                                                                    <View className='px-2 py-0.5 rounded flex items-center gap-1' style={{ color: config.color, backgroundColor: config.bg }}>
                                                                        <Text className='text-[24px]'>{typeCfg.emoji}</Text>
                                                                        <Text className='text-[24px] font-medium'>{config.label}</Text>
                                                                    </View>
                                                                </View>

                                                                {isTips && item.title && (
                                                                    <View className='bg-yellow-50 rounded-xl p-3 border border-yellow-100'>
                                                                        <Text className='text-[26px] text-gray-700 leading-relaxed font-medium'>{item.title}</Text>
                                                                    </View>
                                                                )}

                                                                {!isTips && (
                                                                    <View className='space-y-1'>
                                                                        <Text className='text-[28px] font-bold text-gray-800 block'>{item.title || '未指定地点'}</Text>
                                                                        {item.description && <Text className='text-[24px] text-gray-500 leading-relaxed block mt-1'>{item.description}</Text>}
                                                                        {item.address && (
                                                                            <View className='flex flex-row items-center gap-1 mt-2 bg-gray-50 px-2 py-1 rounded-lg w-fit'>
                                                                                <Text className='text-[20px]'>📍</Text>
                                                                                <Text className='text-[22px] text-gray-400 break-all'>{item.address}</Text>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}

                                                                {hasImages && (
                                                                    <View className='w-full mt-3'>
                                                                        {imgList.length === 1 ? (
                                                                            <View className='w-full h-[320px] rounded-xl overflow-hidden bg-gray-50'>
                                                                                <Image preview src={imgList[0]} mode='aspectFill' className='w-full h-full' />
                                                                            </View>
                                                                        ) : (
                                                                            <View className={`grid ${imgList.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 w-full`}>
                                                                                {imgList.map((imgUrl, i) => (
                                                                                    <View key={i} className='relative w-full h-0 pb-[100%] rounded-xl overflow-hidden bg-gray-50'>
                                                                                        <Image urls={imgList} preview src={imgUrl} mode='aspectFill' className='absolute top-0 left-0 w-full h-full' />
                                                                                    </View>
                                                                                ))}
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}

                                                                {!isTransport && (hasPrice || item.needReservation) && (
                                                                    <View className='flex flex-row items-center justify-between pt-2 border-t border-gray-100 mt-3'>
                                                                        <View className='flex flex-row items-center gap-1.5'>
                                                                            <Text className="iconfont icon-ticket text-yellow-600" />
                                                                            <Text className='text-[24px] text-emerald-600 font-medium'>
                                                                                {hasPrice && price > 0 ? `门票预估: ¥${price.toFixed(2)}` : '免门票 / 无需预约'}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </>
                                    ) : (
                                        <View className='py-16 text-center text-[24px] text-gray-400 flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl shadow-sm'>
                                            <Text className='text-[40px]'>☕</Text>
                                            <Text>今天没有排程，随心所欲到处逛逛吧~</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* 右下角悬浮视图查看按钮 */}
            <View
                onClick={handleSwitchView}
                className='absolute bottom-[130px] right-4 w-[110px] h-[110px] bg-green-500 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-95 active:bg-green-600 transition-all z-50'
            >
                <Text className='text-[32px]'>🗺️</Text>
                <Text className='text-[18px] text-white font-bold mt-0.5'>切视图</Text>
            </View>

            {/* 底部悬浮互动工具栏 */}
            <View className='absolute bottom-0 left-0 right-0 h-[100px] bg-white border-t border-gray-100 flex flex-row items-center justify-between px-4 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-50'>
                {/* 左侧留言框 */}
                <View
                    onClick={handleCommentClick}
                    className='flex-1 h-[64px] bg-gray-100 rounded-full flex flex-row items-center px-4 mr-4 active:opacity-80'
                >
                    <Text className='iconfont icon-edit text-[28px] text-gray-400 mr-2' />
                    <Text className='text-[24px] text-gray-400'>说点什么...</Text>
                </View>

                {/* 右侧图标组 */}
                <View className='flex flex-row items-center space-x-5'>
                    {/* 点赞 */}
                    <View onClick={handleLike} className='flex flex-col items-center justify-center min-w-[50px] active:scale-95 transition-transform'>
                        <Text className={isLiked ? 'iconfont icon-follow-fill text-[32px]' : 'iconfont icon-follow text-[32px]'} />
                        <Text className='text-[16px] text-gray-500 mt-0.5'>{likeCount}</Text>
                    </View>

                    {/* 留言 */}
                    <View onClick={handleCommentClick} className='flex flex-col items-center justify-center min-w-[50px] active:scale-95 transition-transform'>
                        <Text className='iconfont icon-message text-[32px]' />
                        <Text className='text-[16px] text-gray-500 mt-0.5'>{commentCount}</Text>
                    </View>

                    {/* 收藏 */}
                    <View onClick={handleCollect} className='flex flex-col items-center justify-center min-w-[50px] active:scale-95 transition-transform'>
                        <Text className={isCollected ? 'iconfont icon-shoucang text-[32px]' : 'iconfont icon-weishoucang text-[32px]'} />
                        <Text className='text-[16px] text-gray-500 mt-0.5'>{isCollected ? '已收藏' : '收藏'}</Text>
                    </View>

                    {/* 分享 */}
                    <Button className='flex flex-col items-center justify-center min-w-[50px] active:scale-95 transition-transform bg-transparent p-0 m-0 border-0' shareType="share">
                        <Text className='iconfont icon-share text-[32px]' />
                        <Text className='text-[16px] text-gray-500 mt-0.5'>分享</Text>
                    </Button>
                </View>
            </View>
        </View>
    );
}