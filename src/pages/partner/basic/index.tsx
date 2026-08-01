import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Switch, ScrollView, Picker } from '@tarojs/components';
import { Image } from '@/components'
import Taro from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { createPartner, DayItem as ApiDayItem } from '@/api/partner';
import { uploadSingleFile, uploadMultiImages } from '@/utils/upload';
import LocationPicker from '@/features/guide/LocationPicker';

// 主题色 Sunset Orange: #F97316

export default function PublishForm() {
    const [formData, setFormData] = useState({
        title: '',
        cover: '',
        images: [] as string[],
        category: '',
        startDate: '',
        endDate: '',
        totalDays: 0,
        address: '',
        destination: '',
        maxMembers: 8,
        minMembers: 2,
        genderLimit: 0,
        maleCount: 4,
        femaleCount: 4,
        feeMode: 0,
        budgetPerPerson: 0,
        feeInclude: '',
        feeExclude: '',
        richDesc: '',
        minAge: 18,
        maxAge: 40,
        requirement: '',
        tags: '',
        visibility: 0,
        joinMode: 1,
        autoClose: 1,
        allowShare: 1,
        allowCollect: 1,
        isPublic: 1,
        latitude: 0,
        longitude: 0,
    });

    // 聚焦状态管理
    const [inputFocus, setInputFocus] = useState<Record<string, boolean>>({});
    const handleFocus = (field: string) => setInputFocus(prev => ({ ...prev, [field]: true }));
    const handleBlur = (field: string) => setInputFocus(prev => ({ ...prev, [field]: false }));

    const { runAsync: createRun, loading: submitting } = useRequest(createPartner, { manual: true });

    const handleChooseCover = () => {
        Taro.chooseImage({ count: 1 }).then(async (res) => {
            const filePath = res.tempFilePaths[0];
            try {
                const data = await uploadSingleFile(filePath);
                handleInputChange('cover', data.url);
            } catch {
                Taro.showToast({ title: '封面上传失败', icon: 'none' });
            }
        });
    };

    const handleChooseImages = () => {
        Taro.chooseImage({ count: 9 }).then(async (res) => {
            try {
                const urls = await uploadMultiImages(res.tempFilePaths);
                setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
            } catch {
                Taro.showToast({ title: '图片上传失败', icon: 'none' });
            }
        });
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNumberChange = (field: string, val: string) => {
        const num = parseInt(val, 10);
        setFormData(prev => ({ ...prev, [field]: isNaN(num) ? '' : num }));
    };

    const handleSubmit = async (isDraft: number) => {
        if (!formData.title.trim()) {
            Taro.showToast({ title: '请填写搭子标题', icon: 'none' });
            return;
        }
        if (!formData.destination.trim()) {
            Taro.showToast({ title: '请填写目的地', icon: 'none' });
            return;
        }
        if (Number(formData.minMembers) > Number(formData.maxMembers)) {
            Taro.showToast({ title: '最少人数不能大于招募上限', icon: 'none' });
            return;
        }
        if (Number(formData.minAge) > Number(formData.maxAge)) {
            Taro.showToast({ title: '最小年龄不能大于最大年龄', icon: 'none' });
            return;
        }

        try {
            const days = getDaysData();
            const params: any = {
                ...formData,
                days: days.length > 0 ? days : undefined,
                maxMembers: Number(formData.maxMembers) || 1,
                minMembers: Number(formData.minMembers) || 1,
                minAge: Number(formData.minAge) || 18,
                maxAge: Number(formData.maxAge) || 60,
                maleCount: formData.genderLimit === 3 ? Number(formData.maleCount) : undefined,
                femaleCount: formData.genderLimit === 3 ? Number(formData.femaleCount) : undefined,
                budgetPerPerson: formData.feeMode === 3 ? Number(formData.budgetPerPerson) : undefined,
                isDraft,
            };

            Object.keys(params).forEach(k => {
                if (params[k] === undefined || params[k] === '') {
                    delete params[k];
                }
            });

            await createRun(params);
            Taro.showToast({ title: isDraft ? '已保存草稿' : '发布成功', icon: 'success' });
            clearTempStorage();
            setTimeout(() => Taro.switchTab({ url: '/pages/publish/index' }), 1500);
        } catch {
            Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
        }
    };

    const ageOptions = Array.from({ length: 53 }, (_, i) => i + 18);

    // 从 partner/where、partner/date 和 partner/itinerary 读取数据
    useEffect(() => {
        const dest = Taro.getStorageSync('TEMP_PARTNER_DESTINATION');
        if (dest) {
            handleInputChange('destination', dest);
        }
        const dates = Taro.getStorageSync('TEMP_PARTNER_DATES');
        if (dates) {
            handleInputChange('startDate', dates.startDate || '');
            handleInputChange('endDate', dates.endDate || '');
            handleInputChange('totalDays', dates.totalDays || dates.flexDays || 0);
        }
    }, []);

    // 页面显示时重新读取 storage（从 where/date 页返回后更新）
    Taro.useDidShow(() => {
        const dest = Taro.getStorageSync('TEMP_PARTNER_DESTINATION');
        if (dest) {
            handleInputChange('destination', dest);
        }
        const dates = Taro.getStorageSync('TEMP_PARTNER_DATES');
        if (dates) {
            handleInputChange('startDate', dates.startDate || '');
            handleInputChange('endDate', dates.endDate || '');
            handleInputChange('totalDays', dates.totalDays || dates.flexDays || 0);
        }
    });

    // 将 itinerary 页面存储的 dayPlans 映射为 API 所需的 DayItem[]
    const getDaysData = (): ApiDayItem[] => {
        try {
            const plans: any[] = Taro.getStorageSync('TEMP_PARTNER_ITINERARY_PLANS');
            if (!plans || !Array.isArray(plans)) return [];
            return plans.map(day => ({
                date: day.date || '',
                dayNumber: day.dayIndex || 0,
                title: day.title || '',
                items: (day.items || []).map((item: any) => ({
                    title: item.title || '',
                    description: item.description || '',
                    sectionType: item.sectionType || 'attraction',
                    address: item.address || '',
                    startPoint: item.startAddress || '',
                    endPoint: item.endAddress || '',
                    startLat: item.startLatitude ?? undefined,
                    startLng: item.startLongitude ?? undefined,
                    endLat: item.endLatitude ?? undefined,
                    endLng: item.endLongitude ?? undefined,
                    latitude: item.latitude ?? undefined,
                    longitude: item.longitude ?? undefined,
                    startTime: item.startTime || '',
                    endTime: item.endTime || '',
                    images: item.images || [],
                    needReservation: item.needReservation || false,
                    ticketChannel: item.ticketChannel || '',
                    ticketPrice: item.ticketPrice ?? undefined,
                    transportMode: item.transportMode || '',
                })),
            }));
        } catch {
            return [];
        }
    };

    const clearTempStorage = () => {
        Taro.removeStorageSync('TEMP_PARTNER_DESTINATION');
        Taro.removeStorageSync('TEMP_PARTNER_DATES');
        Taro.removeStorageSync('TEMP_PARTNER_ITINERARY_PLANS');
    };

    // 输入框样式：聚焦仅变边框+阴影，背景色不变，消除抖动
    const getInputClass = (field: string) => {
        const base = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 box-border h-11 outline-none';
        const focus = inputFocus[field] ? 'border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]' : '';
        return `${base} ${focus}`;
    };

    return (
        <View className="min-h-screen bg-[#F9FAFB] pb-10 text-gray-800">

            <ScrollView scrollY className="px-4 pt-3 box-border">
                {/* 封面图 */}
                <Section title="封面图">
                    <View className="relative w-full h-44 bg-gray-100 rounded-xl overflow-hidden shadow-sm active:opacity-95" onClick={handleChooseCover}>
                        {formData.cover ? (
                            <>
                                <Image src={formData.cover} className='w-full h-full' mode='aspectFill' />
                                <View className='absolute inset-0 flex items-center justify-center bg-black/30'>
                                    <Text className='text-white font-medium'>点击更换封面</Text>
                                </View>
                            </>
                        ) : (
                            <View className='w-full h-full flex flex-col items-center justify-center active:bg-gray-200'>
                                <Text className='text-gray-300 text-4xl font-light mb-1'>+</Text>
                                <Text className='text-gray-400'>添加封面图片</Text>
                                <Text className='text-gray-300 text-xs mt-1'>建议尺寸 16:9，展示效果更佳</Text>
                            </View>
                        )}
                    </View>
                </Section>

                {/* 活动图片 - 尺寸加大至96px，防止文字溢出 */}
                <Section title="活动图片">
                    <View className='flex flex-wrap gap-3'>
                        {formData.images.map((url, idx) => (
                            <View key={idx} className='relative w-24 h-24 rounded-xl overflow-hidden shadow-sm'>
                                <Image src={url} className='w-full h-full' mode='aspectFill' />
                                <View
                                    className='absolute -top-0.5 -right-0.5 w-5 h-5 bg-black/60 flex items-center justify-center rounded-full'
                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                >
                                    <Text className='text-white text-xs leading-none font-light'>×</Text>
                                </View>
                            </View>
                        ))}
                        {formData.images.length < 9 && (
                            <View
                                className='w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center active:border-orange-400 active:bg-orange-50'
                                onClick={handleChooseImages}
                            >
                                <Text className='text-gray-400 text-2xl font-light leading-none'>+</Text>
                                <Text className='text-gray-400 text-xs mt-1'>添加图片</Text>
                            </View>
                        )}
                    </View>
                    <Text className='text-gray-400 text-xs mt-2'>最多上传 9 张图片，支持 JPG / PNG 格式</Text>
                </Section>

                {/* 1. 基础信息 */}
                <Section title="基础必需信息">
                    <View className="mb-4">
                        <View className="flex justify-between items-center mb-1.5">
                            <Text className="text-xs font-semibold text-gray-700">搭子标题 <Text className="text-red-500">*</Text></Text>
                            <Text className="text-xs text-gray-400">{formData.title.length}/30</Text>
                        </View>
                        <Input
                            className={getInputClass('title')}
                            placeholder="如：周末青城山徒步 / 寻找玉林路探店搭子"
                            placeholderClass="text-gray-400"
                            value={formData.title}
                            maxlength={30}
                            onInput={e => handleInputChange('title', e.detail.value)}
                            onFocus={() => handleFocus('title')}
                            onBlur={() => handleBlur('title')}
                        />
                    </View>

                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 block mb-2">活动类型 <Text className="text-red-500">*</Text></Text>
                        <View className="flex flex-wrap gap-2">
                            {['旅游', '美食', '运动', '学习', '探店', '看展', '桌游'].map((cat) => (
                                <View
                                    key={cat}
                                    onClick={() => handleInputChange('category', cat)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border ${formData.category === cat
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}
                                >
                                    {cat}
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="mt-3">
                        <Text className="text-xs font-semibold text-gray-700 block mb-1.5">活动标签</Text>
                        <Input
                            className={getInputClass('tags')}
                            placeholder="多个标签用逗号分隔，如：自驾,摄影,新手友好"
                            placeholderClass="text-gray-400"
                            value={formData.tags}
                            onInput={e => handleInputChange('tags', e.detail.value)}
                            onFocus={() => handleFocus('tags')}
                            onBlur={() => handleBlur('tags')}
                        />
                    </View>
                </Section>

                {/* 2. 时间设置 */}
                <Section title="时间设置">
                    <View className="space-y-3">
                        <View
                            className="flex justify-between items-center py-2 border-b border-gray-100 active:opacity-70"
                            onClick={() => Taro.navigateTo({ url: '/pages/partner/date/index?from=basic' })}
                        >
                            <Text className="text-gray-600">活动日期</Text>
                            <Text className={`font-medium ${formData.startDate || formData.totalDays > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                                {formData.startDate
                                    ? `${formData.startDate}${formData.endDate && formData.endDate !== formData.startDate ? ` 至 ${formData.endDate}` : ''}`
                                    : formData.totalDays > 0 ? `灵活 ${formData.totalDays}天` : '去选择日期 →'}
                            </Text>
                        </View>
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-gray-600">行程时长</Text>
                            <Text className="font-semibold text-orange-500">
                                {formData.totalDays > 0 ? `${formData.totalDays}天${formData.totalDays > 1 ? ` ${formData.totalDays - 1}晚` : ''}` : '未选择时间'}
                            </Text>
                        </View>
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-gray-600">行程天数（来自行程规划）</Text>
                            <Text className="font-semibold text-green-500">
                                {getDaysData().length > 0 ? `${getDaysData().length} 天行程规划` : '未规划'}
                            </Text>
                        </View>
                    </View>
                </Section>

                {/* 3. 地点设置 */}
                <Section title="地点设置">
                    <View className="space-y-3">
                        <View>
                            <Text className="text-xs font-semibold text-gray-700 block mb-1.5">目的地 <Text className="text-red-500">*</Text></Text>
                            <View
                              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 box-border h-11 flex items-center active:border-orange-400 active:bg-orange-50"
                              onClick={() => Taro.navigateTo({ url: '/pages/partner/where/index?from=basic' })}
                            >
                                <Text className={`${formData.destination ? 'text-gray-800' : 'text-gray-500'} text-xs`}>
                                    {formData.destination || '请选择目的地'}
                                </Text>
                                <Text className="text-gray-300 ml-auto text-xs">去选择 →</Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-xs font-semibold text-gray-700 block mb-1.5">集合地点</Text>
                            <LocationPicker
                                label='集合地点'
                                address={formData.address}
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onPick={(res) => {
                                    handleInputChange('address', res.address);
                                    handleInputChange('latitude', res.latitude);
                                    handleInputChange('longitude', res.longitude);
                                }}
                            />
                        </View>
                    </View>
                </Section>

                {/* 4. 人数管控 */}
                <Section title="人数管控">
                    <View className="grid grid-cols-2 gap-3 mb-4">
                        <View className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                            <Text className="text-xs text-gray-500 block mb-1.5">招募上限 <Text className="text-red-500">*</Text></Text>
                            <View className="flex items-center">
                                <Input
                                    type="number"
                                    className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-semibold text-gray-800 h-9 box-border ${inputFocus.maxMembers ? 'border-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.12)]' : ''}`}
                                    placeholder="8"
                                    placeholderClass="text-gray-300"
                                    value={String(formData.maxMembers ?? '')}
                                    onInput={e => handleNumberChange('maxMembers', e.detail.value)}
                                    onFocus={() => handleFocus('maxMembers')}
                                    onBlur={() => handleBlur('maxMembers')}
                                />
                                <Text className="text-gray-500 ml-1.5 shrink-0">人</Text>
                            </View>
                        </View>

                        <View className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                            <Text className="text-xs text-gray-500 block mb-1.5">最少成行 <Text className="text-red-500">*</Text></Text>
                            <View className="flex items-center">
                                <Input
                                    type="number"
                                    className={`w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-semibold text-gray-800 h-9 box-border ${inputFocus.minMembers ? 'border-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.12)]' : ''}`}
                                    placeholder="2"
                                    placeholderClass="text-gray-300"
                                    value={String(formData.minMembers ?? '')}
                                    onInput={e => handleNumberChange('minMembers', e.detail.value)}
                                    onFocus={() => handleFocus('minMembers')}
                                    onBlur={() => handleBlur('minMembers')}
                                />
                                <Text className="text-gray-500 ml-1.5 shrink-0">人</Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-xs font-semibold text-gray-700 block mb-2">性别要求</Text>
                    <View className="grid grid-cols-4 gap-2 mb-3">
                        {['不限', '仅限男生', '仅限女生', '自定义'].map((mode, idx) => (
                            <View
                                key={mode}
                                onClick={() => handleInputChange('genderLimit', idx)}
                                className={`py-1.5 text-center text-xs rounded-lg border ${formData.genderLimit === idx
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                            >
                                {mode}
                            </View>
                        ))}
                    </View>

                    {formData.genderLimit === 3 && (
                        <View className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs mt-2">
                            <View className="flex items-center flex-1">
                                <Text className="text-gray-600 shrink-0 mr-1.5">男生名额:</Text>
                                <Input
                                    type="number"
                                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-center font-semibold h-7 box-border"
                                    value={String(formData.maleCount ?? '')}
                                    onInput={e => handleNumberChange('maleCount', e.detail.value)}
                                />
                            </View>
                            <View className="flex items-center flex-1">
                                <Text className="text-gray-600 shrink-0 mr-1.5">女生名额:</Text>
                                <Input
                                    type="number"
                                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-center font-semibold h-7 box-border"
                                    value={String(formData.femaleCount ?? '')}
                                    onInput={e => handleNumberChange('femaleCount', e.detail.value)}
                                />
                            </View>
                        </View>
                    )}
                </Section>

                {/* 5. 年龄限制 */}
                <Section title="年龄区间限制">
                    <View className="flex items-center justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1.5 block">最小年龄</Text>
                            <Picker
                                mode="selector"
                                range={ageOptions}
                                value={Math.max(0, ageOptions.indexOf(formData.minAge))}
                                onChange={e => handleInputChange('minAge', ageOptions[Number(e.detail.value)])}
                            >
                                <View className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                                    <Text className="font-semibold text-gray-800">{formData.minAge} 岁</Text>
                                </View>
                            </Picker>
                        </View>

                        <Text className="text-gray-300 font-bold mt-5 text-base">至</Text>

                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1.5 block">最大年龄</Text>
                            <Picker
                                mode="selector"
                                range={ageOptions}
                                value={Math.max(0, ageOptions.indexOf(formData.maxAge))}
                                onChange={e => handleInputChange('maxAge', ageOptions[Number(e.detail.value)])}
                            >
                                <View className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                                    <Text className="font-semibold text-gray-800">{formData.maxAge} 岁</Text>
                                </View>
                            </Picker>
                        </View>
                    </View>
                </Section>

                {/* 6. 费用说明 */}
                <Section title="费用&规则">
                    <Text className="text-xs font-semibold text-gray-700 block mb-2">费用模式</Text>
                    <View className="grid grid-cols-4 gap-2 mb-3">
                        {['免费', 'AA制', '组织者全包', '人均预算'].map((fee, idx) => (
                            <View
                                key={fee}
                                onClick={() => handleInputChange('feeMode', idx)}
                                className={`py-1.5 text-center text-xs rounded-lg border ${formData.feeMode === idx
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                            >
                                {fee}
                            </View>
                        ))}
                    </View>

                    {formData.feeMode === 3 && (
                        <View className="flex justify-between items-center bg-orange-50/40 border border-orange-100 p-3 rounded-xl mb-3">
                            <Text className="font-medium text-gray-700">预估人均预算</Text>
                            <View className="flex items-center">
                                <Input
                                    type="number"
                                    className={`w-20 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-right font-bold text-orange-500 h-9 box-border ${inputFocus.budgetPerPerson ? 'border-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.12)]' : ''}`}
                                    placeholder="0"
                                    value={String(formData.budgetPerPerson ?? '')}
                                    onInput={e => handleNumberChange('budgetPerPerson', e.detail.value)}
                                    onFocus={() => handleFocus('budgetPerPerson')}
                                    onBlur={() => handleBlur('budgetPerPerson')}
                                />
                                <Text className="text-gray-500 ml-1">元/人</Text>
                            </View>
                        </View>
                    )}

                    <View className="space-y-3 mt-2">
                        <Input
                            className={getInputClass('feeInclude')}
                            placeholder="费用包含（如：门票、公摊车费，可选）"
                            placeholderClass="text-gray-400"
                            value={formData.feeInclude}
                            onInput={e => handleInputChange('feeInclude', e.detail.value)}
                            onFocus={() => handleFocus('feeInclude')}
                            onBlur={() => handleBlur('feeInclude')}
                        />
                        <Input
                            className={getInputClass('feeExclude')}
                            placeholder="费用不含（如：个人餐饮费、自费项目，可选）"
                            placeholderClass="text-gray-400"
                            value={formData.feeExclude}
                            onInput={e => handleInputChange('feeExclude', e.detail.value)}
                            onFocus={() => handleFocus('feeExclude')}
                            onBlur={() => handleBlur('feeExclude')}
                        />
                    </View>
                </Section>

                {/* 7. 报名要求与详细介绍 */}
                <Section title="报名要求">
                    <Textarea
                        className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 box-border h-24 leading-relaxed outline-none resize-none ${inputFocus.requirement ? 'border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]' : ''}`}
                        placeholder="如：要求性格开朗、不斤斤计较，最好有自驾经验等..."
                        placeholderClass="text-gray-400"
                        value={formData.requirement}
                        maxlength={500}
                        onInput={e => handleInputChange('requirement', e.detail.value)}
                        onFocus={() => handleFocus('requirement')}
                        onBlur={() => handleBlur('requirement')}
                        disableDefaultPadding
                    />
                    <Text className="text-right text-xs text-gray-400 block mt-1">{formData.requirement.length}/500</Text>
                </Section>

                <Section title="行程介绍与玩法说明">
                    <Textarea
                        className={`w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 box-border h-32 leading-relaxed outline-none resize-none ${inputFocus.richDesc ? 'border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]' : ''}`}
                        placeholder="详细介绍行程路线、集合节点、注意事项等，精彩的说明能吸引更多搭子哦！"
                        placeholderClass="text-gray-400"
                        value={formData.richDesc}
                        maxlength={2000}
                        onInput={e => handleInputChange('richDesc', e.detail.value)}
                        onFocus={() => handleFocus('richDesc')}
                        onBlur={() => handleBlur('richDesc')}
                        disableDefaultPadding
                    />
                    <Text className="text-right text-xs text-gray-400 block mt-1">{formData.richDesc.length}/2000</Text>
                </Section>

                {/* 8. 权限与开关 */}
                <Section title="发布设置">
                    <View className="space-y-3">
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-gray-700 font-medium">满员后自动停止招募</Text>
                            <Switch
                                checked={formData.autoClose === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('autoClose', e.detail.value ? 1 : 0)}
                            />
                        </View>
                        <View className="flex justify-between items-center py-1 border-t border-gray-100 pt-2">
                            <Text className="text-gray-700 font-medium">允许他人转发分享</Text>
                            <Switch
                                checked={formData.allowShare === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('allowShare', e.detail.value ? 1 : 0)}
                            />
                        </View>
                        <View className="flex justify-between items-center py-1 border-t border-gray-100 pt-2">
                            <Text className="text-gray-700 font-medium">允许他人收藏</Text>
                            <Switch
                                checked={formData.allowCollect === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('allowCollect', e.detail.value ? 1 : 0)}
                            />
                        </View>
                    </View>
                </Section>

                {/* 底部操作按钮 */}
                <View className="mt-6 mb-10 flex items-center justify-between gap-3">
                    <View
                        className="flex-1 py-3.5 text-center font-semibold bg-gray-100 text-gray-700 rounded-full active:bg-gray-200"
                        onClick={() => handleSubmit(1)}
                    >
                        {submitting ? '提交中...' : '保存草稿'}
                    </View>
                    <View
                        className="flex-1 py-3.5 text-center font-semibold bg-[#F97316] text-white rounded-full shadow-md active:opacity-90"
                        onClick={() => handleSubmit(0)}
                    >
                        {submitting ? '提交中...' : '正式发布搭子'}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-xs border border-gray-100">
            <View className="flex items-center mb-3.5">
                <View className="w-1 h-3.5 bg-[#F97316] rounded-full mr-2"></View>
                <Text className="font-bold text-gray-900">{title}</Text>
            </View>
            {children}
        </View>
    );
}