import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { getTravelGuideDetail, TravelGuide } from '@/api/guide';
import { useRequest } from 'ahooks';
import { SECTION_MAP, typeConfigMap } from '@/constants/travel';

export default function TravelGuideDetail() {
    const router = useRouter();
    const { id } = router.params || {};

    const [currentDayIdx, setCurrentDayIdx] = useState(0);

    const { data: guideData, error, loading } = useRequest(
        () => getTravelGuideDetail(id || ''),
        {
            refreshDeps: [id],
            onSuccess: () => setCurrentDayIdx(0)
        }
    );

    const guide = guideData?.guide || {} as TravelGuide;
    const days = guideData?.days || [];
    const currentDay = days[currentDayIdx];
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
        <ScrollView scrollY className='w-full h-screen bg-gray-50 pb-12'>
            {/* 顶部封面 */}
            <View className='relative w-full h-[480px] bg-gray-200'>
                {guide.coverImage && <Image src={guide.coverImage} mode='aspectFill' className='w-full h-full' />}
                <View className='absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex flex-row items-center space-x-1 shadow-sm active:opacity-80'>
                    <Text className='text-[24px] text-red-500'>❤️</Text>
                    <Text className='text-[24px] font-medium text-gray-700'>收藏</Text>
                </View>
                {days.length > 0 && (
                    <View className='absolute bottom-6 right-4 bg-black/40 px-2.5 py-1 rounded-lg text-white text-[22px]'>
                        {currentDayIdx + 1}/{days.length}
                    </View>
                )}
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
                        <Text className='text-gray-800 font-medium text-[24px]'>{guide.difficulty}</Text>
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
                    <Text className='text-gray-700 font-medium mr-2'>预算范围</Text>
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
                        {currentDay?.title && (
                            <Text className='text-[22px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg'>
                                {currentDay.title}
                            </Text>
                        )}
                    </View>

                    <ScrollView scrollX scrollWithAnimation className='w-full whitespace-nowrap pb-2' showScrollbar={false}>
                        {days.map((day, idx) => {
                            const isSelected = currentDayIdx === idx;
                            return (
                                <View
                                    key={day.id || idx}
                                    onClick={() => setCurrentDayIdx(idx)}
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

            {/* 时间轴 */}
            <View className='mt-4 px-4'>
                <View className='relative w-full pl-5 box-border'>
                    {currentDay?.items && currentDay.items.length > 0 ? (
                        <>
                            {/* 主轴线 */}
                            <View className='absolute left-[9px] top-6 bottom-6 w-[2px] bg-gray-200' />

                            <View className='space-y-4'>
                                {currentDay.items.map((item, index) => {
                                    const config = SECTION_MAP[item.sectionType] || SECTION_MAP.attraction;
                                    const typeCfg = typeConfigMap[item.sectionType] || typeConfigMap.attraction;
                                    const imgList = getImgArray(item.images);
                                    const hasImages = imgList.length > 0;

                                    const price = Number(item.ticketPrice);
                                    const hasPrice = item.ticketPrice !== null && !isNaN(price);

                                    return (
                                        <View key={item.id || index} className='relative'>
                                            {/* 环形锚点 */}
                                            <View
                                                className='absolute -left-[50px] top-[18px] flex items-center justify-center w-5 h-5 rounded-full z-10'
                                                style={{ backgroundColor: config.ringColor }}
                                            >
                                                <View
                                                    className='w-2 h-2 rounded-full'
                                                    style={{ backgroundColor: config.dotColor }}
                                                />
                                            </View>

                                            {/* 内容卡片 */}
                                            <View className='bg-white rounded-2xl p-4 shadow-sm space-y-3 box-border'>

                                                {/* 卡片头部：时间 + 类型标签 */}
                                                <View className='flex flex-row items-center justify-between'>
                                                    <Text className='text-[24px] font-medium text-gray-400 flex items-center'>
                                                        ⏱️ {formatTimeRange(item.startTime, item.endTime)}
                                                    </Text>
                                                    <View
                                                        className='px-2 py-0.5 rounded flex items-center gap-1'
                                                        style={{ color: config.color, backgroundColor: config.bg }}
                                                    >
                                                        <Text className='text-[24px]'>{typeCfg.emoji}</Text>
                                                        <Text className='text-[24px] font-medium'>{config.label}</Text>
                                                    </View>
                                                </View>

                                                {/* 标题 + 描述 */}
                                                <View className='space-y-1'>
                                                    <Text className='text-[28px] font-bold text-gray-800 block'>
                                                        {item.title || '未指定地点'}
                                                    </Text>
                                                    {item.description && (
                                                        <Text className='text-[24px] text-gray-400 leading-relaxed block'>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                    {item.address && (
                                                        <View className='flex items-center gap-1 mt-1'>
                                                            <Text className='text-[20px]'>📍</Text>
                                                            <Text className='text-[22px] text-gray-400'>{item.address}</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                {/* 图片九宫格 */}
                                                {hasImages && (
                                                    <View className='w-full'>
                                                        {imgList.length === 1 ? (
                                                            <View className='w-full h-[320px] rounded-xl overflow-hidden bg-gray-50'>
                                                                <Image src={imgList[0]} mode='aspectFill' className='w-full h-full' />
                                                            </View>
                                                        ) : (
                                                            <View className={`grid ${imgList.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 w-full`}>
                                                                {imgList.map((imgUrl, i) => (
                                                                    <View key={i} className='relative w-full h-0 pb-[100%] rounded-xl overflow-hidden bg-gray-50'>
                                                                        <Image src={imgUrl} mode='aspectFill' className='absolute top-0 left-0 w-full h-full' />
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* 购票信息 */}
                                                {(hasPrice || item.sectionType !== 'transport') && item.needReservation && (
                                                    <View className='flex flex-row items-center justify-between pt-2 border-t border-gray-100'>
                                                        <View className='flex flex-row items-center gap-1.5'>
                                                            <Text className='text-[28px]'>🎫</Text>
                                                            <Text className='text-[24px] font-medium text-gray-500'>
                                                                {hasPrice && price > 0 ? `¥ ${price.toFixed(2)}` : '免费/无需门票'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            {/* 交通衔接 */}
                                            {(item as any).nextTransport && index < currentDay.items.length - 1 && (
                                                <View className='relative my-2 py-1 flex flex-row items-center pl-2'>
                                                    <View className='absolute -left-[36px] w-1.5 h-1.5 rounded-full bg-gray-300 z-10' />
                                                    <View className='bg-green-50 rounded-full px-3 py-1.5 flex flex-row items-center space-x-2 border border-white shadow-sm'>
                                                        <Text className='text-[22px]'>🚗</Text>
                                                        <Text className='text-[22px] text-gray-500 font-medium'>
                                                            预计车程 <Text className='text-emerald-600 font-bold'>{(item as any).nextTransport.duration}</Text>
                                                        </Text>
                                                        <Text className='text-gray-300 text-[20px]'>|</Text>
                                                        <Text className='text-[22px] text-gray-400'>{(item as any).nextTransport.distance}</Text>
                                                    </View>
                                                </View>
                                            )}
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
        </ScrollView>
    );
}