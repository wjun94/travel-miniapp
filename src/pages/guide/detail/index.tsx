import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { getTravelGuideDetail, TravelGuide } from '@/api/guide';
import { useRequest } from 'ahooks';
import { SECTION_MAP } from '@/constants/travel';

export default function TravelGuideDetail() {
    const router = useRouter();
    const { id } = router.params || {};

    // 记录当前选中的天数索引
    const [currentDayIdx, setCurrentDayIdx] = useState(0);

    // 2. 使用 useRequest 接入真实 API 
    const { data: guideData, error, loading } = useRequest(
        () => getTravelGuideDetail(id || ''),
        {
            refreshDeps: [id],
            onSuccess: () => {
                setCurrentDayIdx(0);
            }
        }
    );

    // 3. 兜底解构真实接口返回的数据结构
    const guide = guideData?.guide || {} as TravelGuide;
    const days = guideData?.days || [];
    const currentDay = days[currentDayIdx];
    const tagList = guide.tags ? guide.tags.split(',').filter(Boolean) : [];

    // 统一处理图片格式（支持数组或逗号分隔的字符串）
    const getImgArray = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images.slice(0, 9);
        if (typeof images === 'string') return images.split(',').filter(Boolean).slice(0, 9);
        return [];
    };

    // 格式化时间段展示
    const formatTimeRange = (start, end) => {
        if (!start && !end) return '全天/待定';
        if (start && end) return `${start} - ${end}`;
        return start || end;
    };

    // 4. Loading / Error 全局状态拦截
    if (loading) {
        return (
            <View className='w-full h-screen flex items-center justify-center bg-[#FAF9F6] text-gray-400 text-xs'>
                <Text>正在探索行程中...</Text>
            </View>
        );
    }
    console.log('guideData', guideData);
    if (error || !guideData) {
        return (
            <View className='w-full h-screen flex flex-col items-center justify-center bg-[#FAF9F6] text-gray-400 text-xs space-y-2'>
                <Text className='text-xl'>⚠️</Text>
                <Text>行程数据加载失败或不存在</Text>
            </View>
        );
    }

    return (
        <ScrollView scrollY className='w-full h-screen bg-[#FAF9F6] pb-12'>
            {/* 1. 顶部封面大图 */}
            <View className='relative w-full h-64 bg-gray-200'>
                {guide.coverImage && <Image src={guide.coverImage} mode='aspectFill' className='w-full h-full' />}
                <View className='absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full flex flex-row items-center space-x-1 shadow-sm active:opacity-80'>
                    <Text className='text-xs text-red-500'>❤️</Text>
                    <Text className='text-xs font-medium text-gray-700'>收藏</Text>
                </View>
                {days.length > 0 && (
                    <View className='absolute bottom-8 right-4 bg-black/40 px-2 py-0.5 rounded text-white text-xxs'>
                        {currentDayIdx + 1}/{days.length}
                    </View>
                )}
            </View>

            {/* 2. 基本信息卡片 */}
            <View className='relative -mt-6 mx-4 bg-white rounded-t-3xl p-5 shadow-sm'>
                <View className='flex flex-row items-center flex-wrap gap-2 mb-2'>
                    <Text className='text-xl font-bold text-gray-900 leading-snug'>{guide.title || '未命名故事'}</Text>
                    {guide.isOriginal === 1 && (
                        <Text className='bg-green-100 text-green-700 text-xxs px-1.5 py-0.5 rounded font-medium'>
                            原创
                        </Text>
                    )}
                </View>

                {guide.destination && (
                    <View className='flex flex-row items-center text-gray-500 text-xs mb-4'>
                        <Text className='mr-1'>📍</Text>
                        <Text>{guide.destination}</Text>
                    </View>
                )}

                <View className='grid grid-cols-4 gap-2 py-3 border-t border-b border-gray-100 text-center text-gray-400'>
                    <View>
                        <Text className='block text-gray-800 mb-1 text-24px font-medium'>🍂 最佳季节</Text>
                        {guide.bestSeason || '不限'}
                    </View>
                    {guide.recommendedDays ? <View>
                        <Text className='block text-gray-800 mb-1 text-24px font-medium'>⏱️ 推荐天数</Text>
                        {guide.recommendedDays ? `${guide.recommendedDays}天` : '自定'}
                    </View> : null}
                    {guide?.difficulty ? <View>
                        <Text className='block text-gray-800 mb-1 text-24px font-medium'>⛰️ 难度</Text>
                        {guide.difficulty}
                    </View> : null}
                    {guide.crowdType ? <View>
                        <Text className='block text-gray-800 mb-1 text-24px font-medium'>👥 适用人群</Text>
                        {guide.crowdType}
                    </View> : null}
                </View>

                {guide.summary && (
                    <Text className='text-xs text-gray-500 leading-relaxed block mb-4'>
                        {guide.summary}
                    </Text>
                )}

                <View className='flex flex-row items-center text-xs mt-4'>
                    <Text className='text-gray-700 font-medium mr-2'>预算范围</Text>
                    <View className='bg-green-50 text-green-600 font-bold px-3 py-1 rounded-full text-xs'>
                        {guide.budgetMin !== null && guide.budgetMax !== null
                            ? `¥${guide.budgetMin} ~ ¥${guide.budgetMax}/人`
                            : '经济随心'}
                    </View>
                </View>

                {tagList.length > 0 && (
                    <View className='flex flex-row flex-wrap gap-2 mt-4'>
                        {tagList.map((tag, idx) => (
                            <Text key={idx} className='bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full'>
                                #{tag}
                            </Text>
                        ))}
                    </View>
                )}
            </View>

            {/* 3. 行程概览天数选择 (Tab 栏) */}
            {days.length > 0 && (
                <View className='mt-3 bg-white mx-4 rounded-2xl p-4 shadow-sm pb-1'>
                    <View className='flex flex-row justify-between items-center mb-4'>
                        <Text className='text-base font-bold text-gray-900'>行程概览</Text>
                        {currentDay?.title && (
                            <Text className='text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'>
                                {currentDay.title}
                            </Text>
                        )}
                    </View>

                    <ScrollView scrollX scrollWithAnimation className='w-full whitespace-nowrap mb-2 pb-2' showScrollbar={false}>
                        {days.map((day, idx) => {
                            const isSelected = currentDayIdx === idx;
                            return (
                                <View
                                    key={day.id || idx}
                                    onClick={() => setCurrentDayIdx(idx)}
                                    className={`inline-block px-4 py-2 rounded-xl text-xs font-medium mr-2.5 transition-all duration-200 ${isSelected
                                        ? 'text-white shadow-sm font-semibold'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                    style={isSelected ? { backgroundColor: '#10B981' } : {}}
                                >
                                    第{day.dayNumber || (idx + 1)}天
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* 4. 时间轴核心主干 */}
            <View className='mt-3 px-4'>
                <View className='relative w-full pl-5 box-border'>
                    {currentDay?.items && currentDay.items.length > 0 ? (
                        <>
                            {/* 左侧贯穿主轴线 */}
                            <View className='absolute left-[9px] top-6 bottom-6 w-[2px] bg-[#EAE7E2]' />

                            <View className='space-y-4'>
                                {currentDay.items.map((item, index) => {
                                    const config = SECTION_MAP[item.sectionType] || SECTION_MAP.custom;
                                    const imgList = getImgArray(item.images);
                                    const hasImages = imgList.length > 0;

                                    // 接口实际返回的是 ticketPrice 字段
                                    const price = Number(item.ticketPrice);
                                    const hasPrice = item.ticketPrice !== null && !isNaN(price);

                                    return (
                                        <View key={item.id || index} className='relative'>

                                            {/* 双层环形锚点 */}
                                            <View
                                                className='absolute -left-[50px] top-[18px] flex items-center justify-center w-5 h-5 rounded-full z-10'
                                                style={{ backgroundColor: config.ringColor }}
                                            >
                                                <View
                                                    className='w-2 h-2 rounded-full'
                                                    style={{ backgroundColor: config.dotColor }}
                                                />
                                            </View>

                                            {/* 右侧独立卡片 */}
                                            <View className='bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/40 flex flex-col'>

                                                {/* 卡片头部：时间与标签 */}
                                                <View className='flex flex-row items-center justify-between mb-2.5 h-6'>
                                                    <Text className='text-xs font-semibold text-gray-400 font-mono tracking-wide flex items-center'>
                                                        {formatTimeRange(item.startTime, item.endTime)}
                                                    </Text>
                                                    <View className='flex flex-row items-center space-x-1.5'>
                                                        <Text
                                                            className="font-medium px-1.5 py-0.5 rounded"
                                                            style={{ color: config.color, backgroundColor: config.bg }}
                                                        >
                                                            {config.label}
                                                        </Text>
                                                        <Text className='text-gray-300 text-xxs'>|</Text>
                                                        <Text className='text-gray-400 text-base leading-none font-bold -mt-1.5 active:opacity-60 px-1'>···</Text>
                                                    </View>
                                                </View>

                                                {/* 文本区域 */}
                                                <View className='mb-2'>
                                                    <Text className='text-base font-bold text-gray-800 block mb-1'>
                                                        {item.title || '未指定地点'}
                                                    </Text>
                                                    {item.description && (
                                                        <Text className='text-xs text-gray-400 leading-relaxed block'>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>

                                                {/* 图片九宫格系统 */}
                                                {hasImages && (
                                                    <View className='mb-3 w-full'>
                                                        {imgList.length === 1 ? (
                                                            <View className='w-full h-44 rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50'>
                                                                <Image src={imgList[0]} mode='aspectFill' className='w-full h-full' />
                                                            </View>
                                                        ) : imgList.length === 2 || imgList.length === 4 ? (
                                                            <View className='grid grid-cols-2 gap-2 w-full'>
                                                                {imgList.map((imgUrl, i) => (
                                                                    <View key={i} className='relative w-full h-0 pb-[100%] rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50'>
                                                                        <Image src={imgUrl} mode='aspectFill' className='absolute top-0 left-0 w-full h-full' />
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        ) : (
                                                            <View className='grid grid-cols-3 gap-1.5 w-full'>
                                                                {imgList.map((imgUrl, i) => (
                                                                    <View key={i} className='relative w-full h-0 pb-[100%] rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50'>
                                                                        <Image src={imgUrl} mode='aspectFill' className='absolute top-0 left-0 w-full h-full' />
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                                {/* 底部价格 - 仅在非交通节点或有明确票价时合理展示 */}
                                                {(hasPrice || item.sectionType !== 'transport') && item.needReservation && (
                                                    <View className='flex flex-row items-center justify-between pt-2 border-t border-gray-50/60'>
                                                        <View className='flex flex-row items-center'>
                                                            <Text className="iconfont icon-ticket mr-1 text-38px text-[#F97316]" />
                                                            <Text className="text-sm font-bold text-gray-400">
                                                                {hasPrice && price > 0 ? `¥ ${price.toFixed(2)}` : '免费/无需门票'}
                                                            </Text>
                                                        </View>

                                                    </View>
                                                )}
                                            </View>

                                            {/* 衔接下一站的交通信息 */}
                                            {item.nextTransport && index < currentDay.items.length - 1 && (
                                                <View className='relative my-2 py-1 flex flex-row items-center pl-2'>
                                                    <View className='absolute -left-[36px] w-1.5 h-1.5 rounded-full bg-[#D1CFC9] z-10' />
                                                    <View className='bg-[#F1F6F2] rounded-full px-3 py-1 flex flex-row items-center space-x-2 border border-white shadow-3xs'>
                                                        <Text className='text-xs'>🚗</Text>
                                                        <Text className='text-xxs text-gray-500 font-medium'>
                                                            预计车程 <Text className='text-emerald-600 font-bold'>{item.nextTransport.duration}</Text>
                                                        </Text>
                                                        <Text className='text-gray-300 text-xxs'>|</Text>
                                                        <Text className='text-xxs text-gray-400'>{item.nextTransport.distance}</Text>
                                                    </View>
                                                </View>
                                            )}

                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    ) : (
                        <View className='py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl shadow-sm'>
                            <Text className='text-2xl'>☕</Text>
                            <Text>今天没有排程，随心所欲到处逛逛吧~</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}