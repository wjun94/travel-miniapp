import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, Image, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';

export default function BasicInfoPage() {
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [summary, setSummary] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [bestSeason, setBestSeason] = useState('');
    const [days, setDays] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [targetGroups, setTargetGroups] = useState<string[]>([]);
    const [isOriginal, setIsOriginal] = useState(true);
    const [coverImage] = useState('https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800');
    const [btnLoading, setBtnLoading] = useState(false);

    const groups = ['家庭', '情侣', '背包客', '独行者', '好友'];

    const toggleGroup = (group: string) => {
        if (targetGroups.includes(group)) {
            setTargetGroups(targetGroups.filter(g => g !== group));
        } else if (targetGroups.length < 5) {
            setTargetGroups([...targetGroups, group]);
        }
    };

    // 时间格式转换器：拼装为符合 Go time.Time 的 ISO 格式字符串
    const formatToIsoTime = (timeStr: string, baseDate: string) => {
        if (!timeStr) return null;
        const date = baseDate || new Date().toISOString().split('T')[0];
        return `${date}T${timeStr}:00Z`;
    };

    // 最终组装数据并请求后端接口
    const handleSubmit = async (isPublish: boolean) => {
        if (!title || !destination || !summary) {
            Taro.showToast({ title: '请完善基本必填信息', icon: 'error' });
            return;
        }

        const cachedItinerary = Taro.getStorageSync('TEMP_ITINERARY_PLANS') || [];

        const payload = {
            title,
            coverImage,
            destination,
            summary,
            budgetMin: minBudget ? parseFloat(minBudget) : null,
            budgetMax: maxBudget ? parseFloat(maxBudget) : null,
            bestSeason: bestSeason || '四季皆宜',
            recommendedDays: days ? parseInt(days, 10) : null,
            tags: targetGroups.join(','),
            difficulty,
            crowdType: targetGroups.join(','),
            isOriginal: isOriginal ? 1 : 0,
            status: isPublish ? 1 : 0,
            days: cachedItinerary.map((day: any) => ({
                date: day.date ? `${day.date}T00:00:00Z` : null,
                title: day.title,
                items: day.items.map((item: any) => ({
                    sectionType: item.sectionType,
                    title: item.title,
                    description: item.description,
                    startTime: formatToIsoTime(item.startTime, day.date),
                    endTime: formatToIsoTime(item.endTime, day.date),
                    latitude: item.latitude,
                    longitude: item.longitude,
                    address: item.address
                }))
            }))
        };

        setBtnLoading(true);
        Taro.showLoading({ title: '正在提交...', mask: true });

        try {
            const res = await Taro.request({
                url: 'https://api.yourdomain.com/v1/guides',
                method: 'POST',
                data: payload,
                header: { 'content-type': 'application/json' }
            });

            Taro.hideLoading();
            setBtnLoading(false);

            if (res.statusCode === 200 || res.statusCode === 201) {
                Taro.showToast({ title: isPublish ? '发布成功' : '草稿保存成功', icon: 'success' });
                Taro.removeStorageSync('TEMP_ITINERARY_PLANS');
                setTimeout(() => {
                    Taro.navigateBack({ delta: 2 });
                }, 1500);
            } else {
                throw new Error();
            }
        } catch {
            Taro.hideLoading();
            setBtnLoading(false);
            Taro.showModal({ title: '提交失败', content: '连接服务器失败或接口内部错误', showCancel: false });
        }
    };

    return (
        <View className='min-h-screen bg-gray-50 pb-28 text-gray-800'>
            {/* 封面 */}
            <View className='relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden'>
                <Image src={coverImage} className='w-full h-full object-cover' />
                <View className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                    <View className='bg-black/40 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm'>更换封面</View>
                </View>
            </View>

            {/* 基本参数配置 */}
            <View className='m-4 p-4 bg-white rounded-2xl shadow-sm space-y-5'>
                <Text className='text-lg font-bold block border-b border-gray-100 pb-2'>基本信息配置</Text>

                {/* 1. 标题输入框（已调整间距为 1.5 并修复大字号溢出） */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>标题 <Text className='text-red-500'>*</Text></Text>
                    <Input
                        className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border'
                        placeholder='请输入攻略标题'
                        value={title}
                        onInput={(e) => setTitle(e.detail.value)}
                    />
                </View>

                {/* 2. 目的地输入框（已调整间距为 1.5 并修复大字号溢出） */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>目的地 <Text className='text-red-500'>*</Text></Text>
                    <Input
                        className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border'
                        placeholder='请输入目的地，如：日本·东京'
                        value={destination}
                        onInput={(e) => setDestination(e.detail.value)}
                    />
                </View>

                {/* 3. 摘要介绍（已调整间距为 1.5 并深度优化防重叠） */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>摘要介绍 <Text className='text-red-500'>*</Text></Text>
                    <View className='relative bg-gray-50 rounded-xl p-3'>
                        <Textarea
                            autoHeight
                            disableDefaultPadding
                            showConfirmBar={false}
                            className='w-full min-h-[140px] pb-6 text-[28px] bg-transparent leading-normal box-border'
                            placeholderStyle='color: #9ca3af'
                            placeholder='简述这趟精彩行程的核心亮点...'
                            maxlength={150}
                            value={summary}
                            onInput={(e) => setSummary(e.detail.value)}
                        />
                        <Text className='absolute bottom-2 right-3 text-xs text-gray-400 z-10 bg-gray-50/80 px-1 rounded'>{summary.length}/150</Text>
                    </View>
                </View>

                {/* 4. 预算输入框 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>预算范围 (可选)</Text>
                    <View className='flex items-center space-x-2'>
                        <Input className='flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border' placeholder='￥ 最低' type='digit' value={minBudget} onInput={(e) => setMinBudget(e.detail.value)} />
                        <Text className='text-gray-400'>~</Text>
                        <Input className='flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border' placeholder='￥ 最高' type='digit' value={maxBudget} onInput={(e) => setMaxBudget(e.detail.value)} />
                    </View>
                </View>

                {/* 5. 最佳季节 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>最佳季节 (可选)</Text>
                    <Input className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border' placeholder='如：11月至次年2月' value={bestSeason} onInput={(e) => setBestSeason(e.detail.value)} />
                </View>

                {/* 6. 建议天数 */}
                <View className='space-y-1.5'>
                    <Text className='text-sm font-medium text-gray-700'>建议游玩天数 (可选)</Text>
                    <View className='flex items-center bg-gray-50 rounded-xl px-3 h-[80px] box-border'>
                        <Input className='flex-1 text-[28px] bg-transparent h-full' placeholder='建议天数' type='number' value={days} onInput={(e) => setDays(e.detail.value)} />
                        <Text className='text-sm text-gray-500 pr-1 shrink-0'>天</Text>
                    </View>
                </View>

                {/* 游玩难度 */}
                <View className='space-y-2'>
                    <Text className='text-sm font-medium text-gray-700'>游玩难度</Text>
                    <View className='flex space-x-3'>
                        {[{ key: 'easy', label: '轻松出行' }, { key: 'medium', label: '强度适中' }, { key: 'hard', label: '硬核挑战' }].map(item => (
                            <Button
                                key={item.key} onClick={() => setDifficulty(item.key)}
                                className={`flex-1 py-2 text-xs font-medium rounded-xl border m-0 ${difficulty === item.key ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-600 border-transparent'}`}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </View>
                </View>

                {/* 适用群体 */}
                <View className='space-y-2'>
                    <Text className='text-sm font-medium text-gray-700'>适用群体 (可多选)</Text>
                    <View className='flex flex-wrap gap-2'>
                        {groups.map(group => {
                            const isSelected = targetGroups.includes(group);
                            return (
                                <Button
                                    key={group} onClick={() => toggleGroup(group)}
                                    className={`px-4 py-1.5 text-xs rounded-xl border m-0 ${isSelected ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-500 border-transparent'}`}
                                >
                                    {group}
                                </Button>
                            );
                        })}
                    </View>
                </View>

                {/* 原创声明 */}
                <View className='flex justify-between items-center border-t border-gray-100 pt-3'>
                    <View>
                        <Text className='text-sm font-medium text-gray-700 block'>原创声明</Text>
                        <Text className='text-xs text-gray-400 block'>对本行程拥有独立版权</Text>
                    </View>
                    <Switch checked={isOriginal} onChange={(e) => setIsOriginal(e.detail.value)} color='#22c55e' />
                </View>
            </View>

            {/* 底部悬浮控制台 */}
            <View className='fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex space-x-4 z-50 shadow-md'>
                <Button disabled={btnLoading} onClick={() => handleSubmit(false)} className='flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-full flex items-center justify-center m-0'>存草稿</Button>
                <Button disabled={btnLoading} onClick={() => handleSubmit(true)} className='flex-[1.5] py-3 text-sm font-medium bg-green-500 text-white rounded-full flex items-center justify-center m-0 active:opacity-90'>确认发布</Button>
            </View>
        </View>
    );
}