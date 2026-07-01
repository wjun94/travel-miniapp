import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';

// 1. 类型映射配置
const SECTION_MAP = {
    attraction: { label: '景点', icon: '景点', dotColor: '#FF851B', ringColor: '#FFEADA', priceColor: 'text-orange-500' },
    food: { label: '餐饮', icon: '餐饮', dotColor: '#FF6F00', ringColor: '#FFEFE5', priceColor: 'text-orange-500' },
    transport: { label: '交通', icon: '交通', dotColor: '#10B981', ringColor: '#E6F4EA', priceColor: 'text-emerald-500' },
    shopping: { label: '购物', icon: '购物', dotColor: '#A855F7', ringColor: '#F3E8FF', priceColor: 'text-purple-500' },
    custom: { label: '自定义', icon: '📌', dotColor: '#6B7280', ringColor: '#F3F4F6', priceColor: 'text-gray-500' },
};

export default function TravelGuideDetail() {
    // 2. Mock 数据
    const [guideData] = useState({
        guide: {
            title: "杭州西湖一日深度游",
            coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            destination: "中国 · 杭州",
            bestSeason: "四季皆宜",
            recommendedDays: 1,
            difficulty: "轻松",
            crowdType: "休闲/摄影",
            summary: "漫步西湖，两岸垂柳依依，灵隐古刹钟声悠扬。一幅流动的江南画卷，带你领略人间天堂的诗意与烟火气。",
            budgetMin: 500,
            budgetMax: 1000,
            tags: "西湖,断桥,灵隐寺,杭帮菜",
            isOriginal: 1,
        },
        days: [
            {
                dayNumber: 1,
                title: "西湖经典环线",
                items: [
                    {
                        id: "1",
                        sectionType: "attraction",
                        startTime: "09:00",
                        endTime: "11:30",
                        title: "西湖游船",
                        description: "西湖景区。微风徐徐，荡漾在绿水波澜间，远眺雷峰塔与苏堤，是极佳的摄影机位。",
                        price: 120.00,
                        // 示例 1: 4张图（2x2 正方形布局）
                        images: [
                            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300",
                            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
                            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300"
                        ],
                        nextTransport: { duration: "40分钟", distance: "15km" }
                    },
                    {
                        id: "2",
                        sectionType: "food",
                        startTime: "12:10",
                        endTime: "13:30",
                        title: "楼外楼(孤山店)",
                        description: "孤山路30号",
                        price: 180.00,
                        // 示例 2: 1张图时保持精致大方图展示
                        images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500"],
                        nextTransport: { duration: "25分钟", distance: "8.7km" }
                    },
                    {
                        id: "3",
                        sectionType: "attraction",
                        startTime: "14:00",
                        endTime: "16:30",
                        title: "灵隐寺",
                        description: "灵隐路法云弄1号",
                        price: 75.00,
                        // 示例 3: 9张满格正方形九宫格
                        images: [
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
                            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
                            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
                            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200",
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
                            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200",
                            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
                            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200",
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
                        ],
                        nextTransport: { duration: "30分钟", distance: "12km" }
                    },
                    {
                        id: "4",
                        sectionType: "shopping",
                        startTime: "17:00",
                        endTime: "18:30",
                        title: "河坊街步行街",
                        description: "上城区河坊街",
                        price: 0,
                        images: [],
                    }
                ]
            }
        ]
    });

    const [currentDayIdx, setCurrentDayIdx] = useState(0);
    const { guide, days } = guideData;
    const currentDay = days[currentDayIdx];
    const tagList = guide.tags ? guide.tags.split(',') : [];

    // 统一转为最大长度为9的数组
    const getImgArray = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images.slice(0, 9);
        if (typeof images === 'string') return images.split(',').filter(Boolean).slice(0, 9);
        return [];
    };

    return (
        <ScrollView scrollY className='w-full h-screen bg-[#FAF9F6] pb-12'>
            {/* 1. 顶部封面大图 */}
            <View className='relative w-full h-64 bg-gray-200'>
                <Image src={guide.coverImage} mode='aspectFill' className='w-full h-full' />
                <View className='absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full flex flex-row items-center space-x-1 shadow-sm active:opacity-80'>
                    <Text className='text-xs text-red-500'>❤️</Text>
                    <Text className='text-xs font-medium text-gray-700'>收藏</Text>
                </View>
                <View className='absolute bottom-8 right-4 bg-black/40 px-2 py-0.5 rounded text-white text-xxs'>
                    1/3
                </View>
            </View>

            {/* 2. 基本信息卡片 */}
            <View className='relative -mt-6 mx-4 bg-white rounded-t-3xl p-5 shadow-sm'>
                <View className='flex flex-row items-center flex-wrap gap-2 mb-2'>
                    <Text className='text-xl font-bold text-gray-900 leading-snug'>{guide.title}</Text>
                    {guide.isOriginal === 1 && (
                        <Text className='bg-green-100 text-green-700 text-xxs px-1.5 py-0.5 rounded font-medium'>
                            原创
                        </Text>
                    )}
                </View>

                <View className='flex flex-row items-center text-gray-500 text-xs mb-4'>
                    <Text className='mr-1'>📍</Text>
                    <Text>{guide.destination}</Text>
                </View>

                <View className='grid grid-cols-4 gap-2 py-3 border-t border-b border-gray-100 text-center text-xxs text-gray-400 mb-4'>
                    <View><Text className='block text-gray-800 mb-1 font-medium'>🍂 最佳季节</Text>{guide.bestSeason}</View>
                    <View><Text className='block text-gray-800 mb-1 font-medium'>⏱️ 推荐天数</Text>{guide.recommendedDays}天</View>
                    <View><Text className='block text-gray-800 mb-1 font-medium'>⛰️ 难度</Text>{guide.difficulty}</View>
                    <View><Text className='block text-gray-800 mb-1 font-medium'>👥 适用人群</Text>{guide.crowdType}</View>
                </View>

                <Text className='text-xs text-gray-500 leading-relaxed block mb-4'>
                    {guide.summary}
                </Text>

                <View className='flex flex-row items-center mb-4 text-xs'>
                    <Text className='text-gray-700 font-medium mr-2'>预算范围</Text>
                    <View className='bg-green-50 text-green-600 font-bold px-3 py-1 rounded-full text-xs'>
                        ¥{guide.budgetMin} ~ ¥{guide.budgetMax}/人
                    </View>
                </View>

                <View className='flex flex-row flex-wrap gap-2'>
                    {tagList.map((tag, idx) => (
                        <Text key={idx} className='bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full'>
                            #{tag}
                        </Text>
                    ))}
                </View>
            </View>

            {/* 3. 行程概览天数选择 (Tab 栏) */}
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
                                key={day.dayNumber}
                                onClick={() => setCurrentDayIdx(idx)}
                                className={`inline-block px-4 py-2 rounded-xl text-xs font-medium mr-2.5 transition-all duration-200 ${isSelected
                                    ? 'text-white shadow-sm font-semibold'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                style={isSelected ? { backgroundColor: '#10B981' } : {}}
                            >
                                第{day.dayNumber}天
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            {/* 4. 时间轴主干核心 */}
            <View className='mt-3 px-4'>
                <View className='relative w-full pl-5 box-border'>
                    {currentDay?.items && currentDay.items.length > 0 ? (
                        <>
                            {/* 左侧贯穿主轴线：微调绝对定位，保证轴线完美直通 */}
                            <View className='absolute left-[9px] top-6 bottom-6 w-[2px] bg-[#EAE7E2]' />

                            <View className='space-y-4'>
                                {currentDay.items.map((item, index) => {
                                    const config = SECTION_MAP[item.sectionType] || SECTION_MAP.custom;
                                    const imgList = getImgArray(item.images);
                                    const hasImages = imgList.length > 0;

                                    return (
                                        <View key={item.id} className='relative'>

                                            {/* ===== 优化：双层圆环锚点（top-4.5 完美对齐右侧第一行时间线文本的中央） ===== */}
                                            <View
                                                className='absolute -left-[50px] top-[18px] flex items-center justify-center w-5 h-5 rounded-full z-10'
                                                style={{ backgroundColor: config.ringColor }}
                                            >
                                                <View
                                                    className='w-2 h-2 rounded-full'
                                                    style={{ backgroundColor: config.dotColor }}
                                                />
                                            </View>

                                            {/* ===== 右侧独立卡片 ===== */}
                                            <View className='bg-white rounded-2xl p-4 shadow-2xs border border-gray-100/40 flex flex-col'>

                                                {/* 卡片头部：时间段与业务标签 */}
                                                <View className='flex flex-row items-center justify-between mb-2.5 h-6'>
                                                    <Text className='text-xs font-semibold text-gray-400 font-mono tracking-wide flex items-center'>
                                                        {item.startTime} - {item.endTime}
                                                    </Text>
                                                    <View className='flex flex-row items-center space-x-1.5'>
                                                        <Text className='text-xxs text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded'>
                                                            {config.label}
                                                        </Text>
                                                        <Text className='text-gray-300 text-xxs'>|</Text>
                                                        <Text className='text-gray-400 text-base leading-none font-bold -mt-1.5 active:opacity-60 px-1'>···</Text>
                                                    </View>
                                                </View>

                                                {/* 文本区域 */}
                                                <View className='mb-3'>
                                                    <Text className='text-base font-bold text-gray-800 block mb-1'>
                                                        {item.title}
                                                    </Text>
                                                    <Text className='text-xs text-gray-400 leading-relaxed block'>
                                                        {item.description}
                                                    </Text>
                                                </View>

                                                {/* ===== 优化：图片全正方形（Square）响应式网格布局 ===== */}
                                                {hasImages && (
                                                    <View className='mb-3 w-full'>
                                                        {imgList.length === 1 ? (
                                                            // 1张图时：宽全满，高度固定，保持高质感宽幅大图
                                                            <View className='w-full h-44 rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50'>
                                                                <Image src={imgList[0]} mode='aspectFill' className='w-full h-full' />
                                                            </View>
                                                        ) : imgList.length === 2 || imgList.length === 4 ? (
                                                            // 2或4张图：1:1正方形，双列对齐布局（使用标准 padding-bottom 实现物理1:1正方形）
                                                            <View className='grid grid-cols-2 gap-2 w-full'>
                                                                {imgList.map((imgUrl, i) => (
                                                                    <View key={i} className='relative w-full h-0 pb-[100%] rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50'>
                                                                        <Image src={imgUrl} mode='aspectFill' className='absolute top-0 left-0 w-full h-full' />
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        ) : (
                                                            // 3张、5-9张图：1:1正方形标准九宫格三列布局
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

                                                {/* 底部价格 */}
                                                <View className='flex flex-row items-center justify-between pt-1 border-t border-gray-50/60'>
                                                    <Text className={`text-sm font-bold ${config.priceColor}`}>
                                                        {item.price > 0 ? `¥ ${item.price.toFixed(2)}` : '免费'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* ===== 衔接下一站的交通栏 ===== */}
                                            {item.nextTransport && index < currentDay.items.length - 1 && (
                                                <View className='relative my-2 py-1 flex flex-row items-center pl-2'>
                                                    {/* 交通节点微型指示点精确靠左对齐主轴 */}
                                                    <View className='absolute -left-[20px] w-1.5 h-1.5 rounded-full bg-[#D1CFC9] z-10' />
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