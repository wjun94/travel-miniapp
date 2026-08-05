import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useSetState, useRequest } from 'ahooks';
import { createTrip, updateTrip, getTripDetail, AiGenerateTripData } from '@/api/trip'
import { uploadSingleFile } from '@/utils/upload';

// 定义表单的状态类型
interface FormState {
    title: string;
    summary: string;
    coverImage: string;
    totalBudget: string;
    isPublic: boolean;
}

export default function BasicInfoPage() {
    // 编辑模式：URL 携带 draftId 时加载草稿数据
    const params = Taro.getCurrentInstance().router?.params;
    const draftId = (params?.draftId as string) || '';
    const [dayCount, setDayCount] = useState(0);

    // 使用 ahooks 的 useSetState 统一管理复杂的表单字段
    // 本地存在 AI 生成数据时自动填充表单
    const [formState, setFormState] = useSetState<FormState>(() => {
        const aiData = Taro.getStorageSync('TEMP_TRIP_AI_GENERATED') as AiGenerateTripData | undefined;
        if (aiData && aiData.id) {
            return {
                title: aiData.title || '',
                summary: aiData.summary || '',
                coverImage: aiData.coverImage || '',
                totalBudget: aiData.totalBudget ? String(aiData.totalBudget) : '',
                isPublic: aiData.isPublic === 1,
            };
        }
        return {
            title: '',
            summary: '',
            coverImage: '',
            totalBudget: '',
            isPublic: true,
        };
    });

    const { runAsync: createRunAsync, loading: createLoading } = useRequest(createTrip, {
        manual: true,
    });

    const handleChooseCover = async () => {
        try {
            const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] });
            const data = await uploadSingleFile(res.tempFilePaths[0]);
            if (data?.url) setFormState({ coverImage: data.url });
        } catch { /* ignore */ }
    };

    // 编辑草稿：加载草稿详情填充表单与行程日缓存
    useEffect(() => {
        if (!draftId) return;
        getTripDetail(draftId)
            .then((detail: any) => {
                if (!detail) return;
                setFormState({
                    title: detail.title || '',
                    summary: detail.summary || '',
                    coverImage: detail.coverImage || '',
                    totalBudget: detail.totalBudget ? String(detail.totalBudget) : '',
                    isPublic: detail.isPublic === 1,
                });
                // 目的地元数据缓存（提交时兜底）
                Taro.setStorageSync('TEMP_TRIP_DESTINATIONS', {
                    cities: detail.cities || [],
                    destinations: detail.destinations || [],
                    provinces: detail.provinces || [],
                    countries: detail.countries || [],
                    isOverseas: detail.isOverseas || 0,
                });
                if (Array.isArray(detail.days) && detail.days.length > 0) {
                    const plans = detail.days.map((day: any) => ({
                        dayIndex: day.dayNumber || 1,
                        date: day.date || '',
                        title: day.title || '',
                        items: (day.items || []).map((item: any) => ({
                            id: item.id || `${Date.now()}-${Math.random()}`,
                            sectionType: item.sectionType || 'attraction',
                            title: item.title || '',
                            description: item.description || '',
                            startTime: item.startTime || '',
                            endTime: item.endTime || '',
                            latitude: item.latitude ?? null,
                            longitude: item.longitude ?? null,
                            address: item.address || '',
                            images: item.images || [],
                            needReservation: !!item.needReservation,
                            ticketChannel: item.ticketChannel || '',
                            ticketPrice: item.ticketPrice ?? null,
                            startAddress: item.startPoint || '',
                            startLatitude: item.startLat ?? null,
                            startLongitude: item.startLng ?? null,
                            endAddress: item.endPoint || '',
                            endLatitude: item.endLat ?? null,
                            endLongitude: item.endLng ?? null,
                            transportMode: item.transportMode || 'bus',
                        })),
                    }));
                    Taro.setStorageSync('TEMP_TRIP_ITINERARY_PLANS', { dayPlans: plans });
                    setDayCount(plans.length);
                }
            })
            .catch(() => { });
    }, [draftId]);

    // 页面显示时刷新行程天数
    Taro.useDidShow(() => {
        const raw: any = Taro.getStorageSync('TEMP_TRIP_ITINERARY_PLANS') || [];
        const plans = raw.dayPlans ? raw.dayPlans : raw;
        setDayCount(Array.isArray(plans) ? plans.length : 0);
    });

    // 最终组装数据并请求后端接口
    const handleSubmit = async (isPublish: boolean) => {
        const { title, summary, coverImage, totalBudget } = formState;

        if (!title) {
            Taro.showToast({ title: '请完善基本必填信息', icon: 'error' });
            return;
        }

        const aiData = Taro.getStorageSync('TEMP_TRIP_AI_GENERATED') as AiGenerateTripData | undefined;

        const cachedItinerary = (() => {
            const raw = Taro.getStorageSync('TEMP_TRIP_ITINERARY_PLANS') || [];
            return raw.dayPlans ? raw.dayPlans : raw;
        })();

        // 目的地元数据：优先本地选择的，缺失时用 AI 生成数据兜底
        const destinationMeta = Taro.getStorageSync('TEMP_TRIP_DESTINATIONS') || {};
        const aiMeta = aiData && aiData.id ? {
            cities: aiData.cities || [],
            destinations: aiData.destinations || [],
            provinces: aiData.provinces || [],
            countries: aiData.countries || [],
            isOverseas: aiData.isOverseas || 0,
        } : {};
        const finalMeta = { ...aiMeta, ...destinationMeta };

        const payload = {
            title,
            coverImage,
            summary,
            totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
            isPublic: formState.isPublic ? 1 : 0,
            status: isPublish ? 2 : 1,
            ...finalMeta,
            days: cachedItinerary.length > 0
                ? cachedItinerary.map((day: any, dayIdx: number) => ({
                    dayNumber: dayIdx + 1,
                    date: day.date ? `${day.date}T00:00:00Z` : null,
                    title: day.title,
                    items: day.items.map((item: any) => ({
                        sectionType: item.sectionType,
                        title: item.title,
                        description: item.description,
                        startTime: item.startTime || null,
                        endTime: item.endTime || null,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        address: item.address,
                        // 交通类型专属字段
                        transportMode: item.transportMode,
                        startLat: item.startLatitude,
                        startLng: item.startLongitude,
                        startPoint: item.startAddress,
                        endLat: item.endLatitude,
                        endLng: item.endLongitude,
                        endPoint: item.endAddress,
                        // 购票相关字段
                        needReservation: item.needReservation,
                        ticketChannel: item.ticketChannel,
                        ticketPrice: item.ticketPrice,
                        // 图片
                        images: item.images
                    }))
                }))
                : (aiData?.days || [])
        };

        if (draftId) {
            await updateTrip(draftId, payload as any);
        } else {
            await createRunAsync(payload as any);
        }

        Taro.removeStorageSync('TEMP_TRIP_DESTINATIONS');
        setTimeout(() => {
            Taro.switchTab({ url: '/pages/publish/index' });
            setTimeout(() => {
                Taro.removeStorageSync('TEMP_TRIP_ITINERARY_PLANS');
            }, 500);
        }, 1500);
    };

    return (
        <View className='min-h-screen bg-gray-50 pb-28 text-gray-800'>
            {/* 封面 */}
            <View className='relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden'>
                {formState.coverImage ? (
                    <Image src={formState.coverImage} className='w-full h-full' mode='aspectFill' />
                ) : (
                    <View className='w-full h-full flex items-center justify-center' />
                )}
                <View
                    className='absolute inset-0 flex items-center justify-center'
                    onClick={handleChooseCover}
                >
                    {formState.coverImage ? (
                        <View className='bg-black/40 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm'>点击更换</View>
                    ) : (
                        <View className='flex flex-col items-center justify-center w-full h-full bg-gray-100 active:bg-gray-200'>
                            <Text className='text-gray-400 text-[40px] font-light mb-1'>+</Text>
                            <Text className='text-gray-400 text-[24px]'>上传封面</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 行程安排入口（编辑草稿时可直接调整每日行程） */}
            <View className='m-4'>
                <View
                    className='bg-white rounded-2xl p-4 shadow-sm flex flex-row items-center justify-between active:opacity-80'
                    onClick={() => Taro.navigateTo({ url: '/pages/trip/itinerary/index' })}
                >
                    <View className='flex flex-col'>
                        <Text className='text-sm font-bold text-gray-800'>🗓️ 每日行程</Text>
                        <Text className='text-xs text-gray-400 mt-1'>{dayCount > 0 ? `已规划 ${dayCount} 天，点击编辑每日行程` : '尚未规划每日行程，点击前往编辑'}</Text>
                    </View>
                    <Text className='text-gray-400 text-sm'>编辑 ›</Text>
                </View>
            </View>

            {/* 基本参数配置 */}
            <View className='m-4 p-4 bg-white rounded-2xl shadow-sm space-y-5'>
                <Text className='text-lg font-bold block border-b border-gray-100 pb-2'>基本信息配置</Text>

                {/* 1. 标题输入框 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'><Text className='text-red-500'>*</Text> 标题</Text>
                    <View>
                        <Input
                            className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border'
                            placeholder='请输入行程标题'
                            value={formState.title}
                            onInput={(e) => setFormState({ title: e.detail.value })}
                        />
                    </View>
                </View>

                {/* 3. 摘要介绍 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>摘要介绍</Text>
                    <View className='relative bg-gray-50 rounded-xl p-3'>
                        <Textarea
                            autoHeight
                            disableDefaultPadding
                            showConfirmBar={false}
                            className='w-full min-h-[140px] pb-6 text-[28px] bg-transparent leading-normal box-border'
                            placeholderStyle='color: #9ca3af'
                            placeholder='简述这趟精彩行程的核心亮点...'
                            maxlength={150}
                            value={formState.summary}
                            onInput={(e) => setFormState({ summary: e.detail.value })}
                        />
                        <Text className='absolute bottom-2 right-3 text-xs text-gray-400 z-10 bg-gray-50/80 px-1 rounded'>
                            {formState.summary.length}/150
                        </Text>
                    </View>
                </View>

                {/* 4. 总预算 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>总预算 (可选)</Text>
                    <View className='relative'>
                        <Text className='absolute left-3 top-26px -translate-y-1/2 text-gray-400 text-[28px] z-10'>¥</Text>
                        <Input
                            className='w-full h-[80px] pl-9 pr-3 bg-gray-50 rounded-xl text-[28px] box-border'
                            placeholder='0.00'
                            type='digit'
                            value={formState.totalBudget}
                            onInput={(e) => setFormState({ totalBudget: e.detail.value })}
                        />
                    </View>
                </View>

                {/* 5. 公开/私密切换 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>可见范围</Text>
                    <View className='flex space-x-4'>
                        {[{ key: false, label: '私密' }, { key: true, label: '公开' }].map(item => (
                            <View
                                key={String(item.key)}
                                onClick={() => setFormState({ isPublic: item.key })}
                                className={`flex-1 py-2.5 text-center text-sm font-medium rounded-xl border m-0 ${formState.isPublic === item.key ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-500 border-transparent'}`}
                            >
                                {item.label}
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* 底部悬浮控制台 */}
            <View className='fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex space-x-4 z-50 shadow-md'>
                <Button
                    disabled={createLoading}
                    onClick={() => handleSubmit(false)}
                    className='flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-full flex items-center justify-center m-0'
                >
                    存草稿
                </Button>
                <Button
                    disabled={createLoading}
                    onClick={() => handleSubmit(true)}
                    className='flex-[1.5] py-3 text-sm font-medium bg-green-500 text-white rounded-full flex items-center justify-center m-0 active:opacity-90'
                >
                    确认发布
                </Button>
            </View>
        </View>
    );
}