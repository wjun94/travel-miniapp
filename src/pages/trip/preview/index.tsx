import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import { Image } from '@/components'
import { useRouter } from '@tarojs/taro';
import { getTravelGuideDetail } from '@/api/guide';
import { createHistoryRecord } from '@/api/history'
import { useRequest } from 'ahooks';
import { SECTION_MAP, typeConfigMap, getTransportLabel } from '@/constants/travel';

export default function TravelGuideDetail() {
    const router = useRouter();
    const { id } = router.params || {};

    const [currentDayIdx, setCurrentDayIdx] = useState(0);
    // 新增：用于控制内部局部滚动条回到顶部的状态
    const [innerScrollTop, setInnerScrollTop] = useState<number | undefined>(0);

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

    const days = guideData?.days || [];

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

    // 抽离统一的切换高亮和触发置顶的逻辑
    const switchDay = (idx: number) => {
        setCurrentDayIdx(idx);
        // 关键逻辑：每次切换时，重置 scrollTop。
        // 使用 undefined 或在 0 附近微调能确保小程序宿主环境监听到值的改变从而触发滚动
        setInnerScrollTop(innerScrollTop === 0 ? -0.1 : 0);
    };

    const handleSwiperChange = (e) => {
        switchDay(e.detail.current);
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
        <View className='relative w-full h-screen bg-gray-50 flex flex-col overflow-hidden'>
            {/* 行程概览 Tab 栏固定在顶部 */}
            {days.length > 0 && (
                <View className='py-4 bg-[#FAFAF9] sticky top-0 z-99 flex-shrink-0'>
                    <View className='bg-white mx-4 rounded-2xl p-4 shadow-sm'>
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
                                        onClick={() => switchDay(idx)}
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
                </View>
            )}

            {/* Swiper 区域充满剩余空间 */}
            {days.length > 0 && (
                <Swiper
                    current={currentDayIdx}
                    onChange={handleSwiperChange}
                    className='w-full flex-1 min-h-0'
                >
                    {days.map((dayItem, dIdx) => (
                        <SwiperItem key={dayItem.id || dIdx} className='w-full h-full'>
                            {/* 关键：给内部的 ScrollView 动态赋予 scrollTop 并且加上 pb-[140px] 留出悬浮栏空间 */}
                            <ScrollView
                                scrollY
                                scrollTop={innerScrollTop}
                                className='w-full h-full px-4 box-border pb-[40px]'
                            >
                                <View className='relative w-full pl-8 box-border pb-6 pt-2'>
                                    {dayItem?.items && dayItem.items.length > 0 ? (
                                        <>
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
                            </ScrollView>
                        </SwiperItem>
                    ))}
                </Swiper>
            )}
        </View>
    );
}