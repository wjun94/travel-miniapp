import { View, Text, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSetState, useRequest } from 'ahooks';
import { createTrip } from '@/api/trip'

// 定义表单的状态类型
interface FormState {
    title: string;
    destination: string;
    summary: string;
    coverImage: string;
    totalBudget: string;
    isPublic: boolean;
}

export default function BasicInfoPage() {
    // 使用 ahooks 的 useSetState 统一管理复杂的表单字段
    const [formState, setFormState] = useSetState<FormState>({
        title: '',
        destination: '',
        summary: '',
        coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
        totalBudget: '',
        isPublic: false,
    });

    const { runAsync: createRunAsync, loading: createLoading } = useRequest(createTrip, {
        manual: true,
    });

    // 最终组装数据并请求后端接口
    const handleSubmit = async (isPublish: boolean) => {
        const { title, destination, summary, coverImage, totalBudget } = formState;

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
                isOriginal: 1,
                totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
                isPublic: formState.isPublic ? 1 : 0,
                status: isPublish ? 2 : 1,
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

        await createRunAsync(payload as any);

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
                            placeholder='请输入行程标题'
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