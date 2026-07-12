import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSetState, useRequest } from 'ahooks';
import { createTrip, Trip, TripDetailData } from '@/api/trip'
import { difficultyOptions } from '@/constants/travel';

// 定义表单的状态类型
interface FormState {
    title: string;
    destination: string;
    summary: string;
    minBudget: string;
    maxBudget: string;
    bestSeason: string;
    days: string;
    difficulty: 'easy' | 'medium' | 'hard';
    targetGroups: string[];
    isOriginal: boolean;
    coverImage: string;
}

export default function BasicInfoPage() {
    // 使用 ahooks 的 useSetState 统一管理复杂的表单字段
    const [formState, setFormState] = useSetState<FormState>({
        title: '',
        destination: '',
        summary: '',
        minBudget: '',
        maxBudget: '',
        bestSeason: '',
        days: '',
        difficulty: 'easy',
        targetGroups: [],
        isOriginal: true,
        coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
    });

    const groups = ['家庭', '情侣', '背包客', '独行者', '好友'];

    const { runAsync: createRunAsync, loading: createLoading } = useRequest(createTrip, {
        manual: true,
    });
    // 处理适用群体的多选/反选逻辑
    const toggleGroup = (group: string) => {
        const { targetGroups } = formState;
        if (targetGroups.includes(group)) {
            setFormState({ targetGroups: targetGroups.filter(g => g !== group) });
        } else if (targetGroups.length < 5) {
            setFormState({ targetGroups: [...targetGroups, group] });
        }
    };

    // 最终组装数据并请求后端接口
    const handleSubmit = async (isPublish: boolean) => {
        const {
            title, destination, summary, minBudget, maxBudget, bestSeason,
            days, targetGroups, difficulty, isOriginal, coverImage
        } = formState;

        if (!title || !destination) {
            Taro.showToast({ title: '请完善基本必填信息', icon: 'error' });
            return;
        }

        const cachedItinerary = Taro.getStorageSync('TEMP_TRIP_ITINERARY_PLANS') || [];

        const payload = {
            trip: {
                title,
                coverImage,
                destination,
                summary,
                budgetMin: minBudget ? parseFloat(minBudget) : undefined,
                budgetMax: maxBudget ? parseFloat(maxBudget) : undefined,
                bestSeason: bestSeason || '',
                recommendedDays: days ? parseInt(days, 10) : undefined,
                tags: targetGroups.join(','),
                difficulty,
                crowdType: targetGroups.join(','),
                isOriginal: isOriginal ? 1 : 0,
                status: isPublish ? 1 : 0,
            },
            days: cachedItinerary.map((day: any) => ({
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
                    startAddress: item.startAddress,
                    startLatitude: item.startLatitude,
                    startLongitude: item.startLongitude,
                    endAddress: item.endAddress,
                    endLatitude: item.endLatitude,
                    endLongitude: item.endLongitude,
                    // 购票相关字段
                    needReservation: item.needReservation,
                    ticketChannel: item.ticketChannel,
                    ticketPrice: item.ticketPrice,
                    // 图片
                    images: item.images
                }))
            }))
        };

        await createRunAsync(payload as TripDetailData);

        Taro.removeStorageSync('TEMP_TRIP_ITINERARY_PLANS');
        setTimeout(() => {
            Taro.navigateBack({ delta: 2 });
        }, 1500);
    };

    return (
        <View className='min-h-screen bg-gray-50 pb-28 text-gray-800'>
            {/* 封面 */}
            <View className='relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden'>
                <Image src={formState.coverImage} className='w-full h-full object-cover' />
                <View className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                    <View className='bg-black/40 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm'>更换封面</View>
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
                            placeholder='请输入攻略标题'
                            value={formState.title}
                            onInput={(e) => setFormState({ title: e.detail.value })}
                        />
                    </View>
                </View>

                {/* 2. 目的地输入框 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'><Text className='text-red-500'>*</Text> 目的地</Text>
                    <View>
                        <Input
                            className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border'
                            placeholder='请输入目的地，如：杭州'
                            value={formState.destination}
                            onInput={(e) => setFormState({ destination: e.detail.value })}
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

                {/* 4. 预算输入框 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>预算范围 (可选)</Text>
                    <View className='flex items-center space-x-2'>
                        <Input
                            className='flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border'
                            placeholder='￥ 最低'
                            type='digit'
                            value={formState.minBudget}
                            onInput={(e) => setFormState({ minBudget: e.detail.value })}
                        />
                        <Text className='text-gray-400'>~</Text>
                        <Input
                            className='flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border'
                            placeholder='￥ 最高'
                            type='digit'
                            value={formState.maxBudget}
                            onInput={(e) => setFormState({ maxBudget: e.detail.value })}
                        />
                    </View>
                </View>

                {/* 5. 最佳季节 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>最佳季节 (可选)</Text>
                    <View>
                        <Input
                            className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border'
                            placeholder='如：11月至次年2月'
                            value={formState.bestSeason}
                            onInput={(e) => setFormState({ bestSeason: e.detail.value })}
                        />
                    </View>
                </View>

                {/* 6. 建议天数 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>建议游玩天数 (可选)</Text>
                    <View className='flex items-center bg-gray-50 rounded-xl px-3 h-[80px] box-border'>
                        <Input
                            className='flex-1 text-[28px] bg-transparent h-full'
                            placeholder='建议天数'
                            type='number'
                            value={formState.days}
                            onInput={(e) => setFormState({ days: e.detail.value })}
                        />
                        <Text className='text-sm text-gray-500 pr-1 shrink-0'>天</Text>
                    </View>
                </View>

                {/* 游玩难度 */}
                <View className='space-y-2'>
                    <Text className='text-sm font-medium text-gray-700'>游玩难度</Text>
                    <View className='flex space-x-3'>
                        {difficultyOptions.map(item => (
                            <View
                                key={item.key}
                                onClick={() => setFormState({ difficulty: item.key as any })}
                                className={`flex-1 py-2 text-center text-xs font-medium rounded-xl border m-0 ${formState.difficulty === item.key ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-600 border-transparent'}`}
                            >
                                {item.label}
                            </View>
                        ))}
                    </View>
                </View>

                {/* 适用群体 */}
                <View className='space-y-2'>
                    <Text className='text-sm font-medium text-gray-700'>适用群体 (可多选)</Text>
                    <View className='flex flex-wrap gap-2'>
                        {groups.map(group => {
                            const isSelected = formState.targetGroups.includes(group);
                            return (
                                <View
                                    key={group}
                                    onClick={() => toggleGroup(group)}
                                    className={`px-4 py-1.5 text-xs text-center rounded-xl border m-0 ${isSelected ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-500 border-transparent'}`}
                                >
                                    {group}
                                </View>
                            );
                        })}
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