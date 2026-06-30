import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Modal from '@/components/Modal';
import { uploadMultiImages } from '@/utils/upload';

// 定义合法的节点类型
type SectionType = 'transport' | 'hotel' | 'attraction' | 'food' | 'shopping' | 'tips' | 'custom';

interface DayItem {
    id: string;
    sectionType: SectionType;
    title: string;       // 对应界面上的【行程】
    description: string; // 对应界面上的【备注】
    startTime: string;
    endTime: string;
    latitude: number | null;
    longitude: number | null;
    address: string;
    images: string[];
}

interface DayPlan {
    dayIndex: number;
    date: string;
    title: string;
    items: DayItem[];
}

export default function ItineraryPage() {
    const [dayPlans, setDayPlans] = useState<DayPlan[]>([
        {
            dayIndex: 1,
            date: '',
            title: '',
            items: [
                {
                    id: '1-1',
                    sectionType: 'attraction',
                    title: '雅典卫城',
                    description: '参观雅典卫城，感受古希腊文明的辉煌历史，俯瞰雅典全景。',
                    startTime: '09:00',
                    endTime: '11:30',
                    latitude: 37.9715,
                    longitude: 23.7267,
                    address: 'Athina 105 58希腊',
                    images: []
                }
            ]
        }
    ]);

    // Picker 对应的数据源字典定义
    const typeOptions = [
        { label: '🏞️ 景点', value: 'attraction' },
        { label: '🚄 交通', value: 'transport' },
        { label: '🏨 住宿', value: 'hotel' },
        { label: '🍜 美食', value: 'food' },
        { label: '🛍️ 购物', value: 'shopping' },
        { label: '⚠️ 避坑', value: 'tips' }
    ];

    const [activeTab, setActiveTab] = useState<number>(1);
    const [toViewId, setToViewId] = useState<string>('');
    const [toTabId, setToTabId] = useState<string>('');
    const [isClickScrolling, setIsClickScrolling] = useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [pendingDelete, setPendingDelete] = useState<{ type: 'day' | 'item'; dayIndex: number; itemId?: string } | null>(null);

    const getFormatDayName = (index: number) => {
        const zhNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        if (index <= 10) return `第${zhNums[index]}天`;
        if (index < 20) return `第十${zhNums[index % 10]}天`;
        const space = Math.floor(index / 10);
        const remainder = index % 10;
        return `第${zhNums[space]}十${remainder === 0 ? '' : zhNums[remainder]}天`;
    };

    const handleTabClick = (dayIndex: number) => {
        setIsClickScrolling(true);
        setActiveTab(dayIndex);
        setToViewId(`day-node-${dayIndex}`);
        const targetTabTarget = dayIndex > 1 ? dayIndex - 1 : 1;
        setToTabId(`tab-node-${targetTabTarget}`);
        setTimeout(() => { setIsClickScrolling(false); }, 500);
    };

    const handlePageScroll = () => {
        if (isClickScrolling) return;
        const query = Taro.createSelectorQuery();
        query.selectAll('.day-card-anchor').boundingClientRect();
        query.exec((res) => {
            if (!res || !res[0]) return;
            const nodes = res[0];
            const threshold = 120;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.top <= threshold && node.bottom > threshold) {
                    const currentDayIndex = idxToDayIndex(node.id);
                    if (currentDayIndex && activeTab !== currentDayIndex) {
                        setActiveTab(currentDayIndex);
                        const targetTabTarget = currentDayIndex > 1 ? currentDayIndex - 1 : 1;
                        setToTabId(`tab-node-${targetTabTarget}`);
                    }
                    break;
                }
            }
        });
    };

    const idxToDayIndex = (idStr: string): number | null => {
        const match = idStr.match(/\d+$/);
        return match ? parseInt(match[0], 10) : null;
    };

    const handleAddDay = () => {
        const nextDay = dayPlans.length + 1;
        setDayPlans([...dayPlans, { dayIndex: nextDay, date: '', title: '', items: [] }]);
        Taro.showToast({ title: `已添加${getFormatDayName(nextDay)}`, icon: 'none' });
        setTimeout(() => { handleTabClick(nextDay); }, 120);
    };

    const handleChooseImage = async (dayIndex: number, itemId: string, currentImages: string[] = []) => {
        const maxCanSelect = 9 - currentImages.length;
        if (maxCanSelect <= 0) return;
        try {
            const res = await Taro.chooseImage({ count: maxCanSelect, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
            Taro.showLoading({ title: '图片上传中...', mask: true });
            const uploadedUrls = await uploadMultiImages(res.tempFilePaths);
            Taro.hideLoading();
            updateItemField(dayIndex, itemId, 'images', [...currentImages, ...uploadedUrls]);
        } catch (err) {
            Taro.hideLoading();
        }
    };

    const handleDeleteImage = (dayIndex: number, itemId: string, currentImages: string[], imgIndex: number) => {
        updateItemField(dayIndex, itemId, 'images', currentImages.filter((_, idx) => idx !== imgIndex));
    };

    const triggerDeleteDay = (index: number) => {
        setModalTitle('确定删除这一天的全部行程吗？');
        setModalContent(`确认要将“${getFormatDayName(index + 1)}”及其包含的所有行程节点全部清空并删除吗？`);
        setPendingDelete({ type: 'day', dayIndex: index });
        setModalVisible(true);
    };

    const triggerDeleteItem = (dayIndex: number, itemId: string, itemTitle: string) => {
        setModalTitle('确定删除该行程项吗？');
        setModalContent(`确认删除具体的行程：${itemTitle || '未命名行程'} 吗？`);
        setPendingDelete({ type: 'item', dayIndex, itemId });
        setModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDelete) return;
        if (pendingDelete.type === 'day') {
            if (dayPlans.length <= 1 || pendingDelete.dayIndex === 0) {
                Taro.showToast({ title: '第一天行程不可删除', icon: 'none' });
                setModalVisible(false);
                return;
            }
            const updated = dayPlans.filter((_, i) => i !== pendingDelete.dayIndex).map((day, i) => ({ ...day, dayIndex: i + 1 }));
            setDayPlans(updated);
            handleTabClick(1);
        } else if (pendingDelete.type === 'item') {
            setDayPlans(dayPlans.map(day => day.dayIndex === pendingDelete.dayIndex ? { ...day, items: day.items.filter(item => item.id !== pendingDelete.itemId) } : day));
        }
        setModalVisible(false);
        setPendingDelete(null);
    };

    const handleAddCustomItem = (dayIndex: number) => {
        setDayPlans(dayPlans.map(day => {
            if (day.dayIndex === dayIndex) {
                const newItem: DayItem = { id: `${dayIndex}-${Date.now()}`, sectionType: 'attraction', title: '', description: '', startTime: '09:00', endTime: '18:00', latitude: null, longitude: null, address: '', images: [] };
                return { ...day, items: [...day.items, newItem] };
            }
            return day;
        }));
    };

    const updateItemField = (dayIndex: number, itemId: string, field: keyof DayItem, value: any) => {
        setDayPlans(dayPlans.map(day => day.dayIndex === dayIndex ? { ...day, items: day.items.map(item => item.id === itemId ? { ...item, [field]: value } : item) } : day));
    };

    const handleChooseLocation = async (dayIndex: number, itemId: string) => {
        try {
            const res = await Taro.chooseLocation();
            setDayPlans(dayPlans.map(day => day.dayIndex === dayIndex ? { ...day, items: day.items.map(item => item.id === itemId ? { ...item, address: res.address || res.name, latitude: res.latitude, longitude: res.longitude } : item) } : day));
        } catch (err) { }
    };

    const handleNextStep = () => {
        for (const day of dayPlans) {
            if (!day.title) {
                Taro.showToast({ title: `请填写${getFormatDayName(day.dayIndex)}的主干大标题`, icon: 'none' });
                return;
            }
            if (day.items.length === 0) {
                Taro.showToast({ title: `${getFormatDayName(day.dayIndex)}还没有任何行程明细`, icon: 'none' });
                return;
            }
            for (const item of day.items) {
                if (!item.title) {
                    Taro.showToast({ title: '行程名称不能为空', icon: 'none' });
                    return;
                }
            }
        }
        Taro.setStorageSync('TEMP_ITINERARY_PLANS', dayPlans);
        Taro.navigateTo({ url: '/pages/basic/index' });
    };

    return (
        <View className='w-full h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden relative text-[28px]'>
            {/* 顶部固定栏 */}
            <View className='bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-40'>
                <View className='px-4 py-3 flex justify-between items-center'>
                    <Text className='font-bold text-gray-900 text-[28px]'>每日行程编辑</Text>
                    <Button onClick={handleAddDay} className='m-0 px-3 py-1 bg-green-500 text-white font-medium rounded-full text-[24px]'>
                        + 再加一天
                    </Button>
                </View>
                <ScrollView scrollX className='w-full whitespace-nowrap px-4 py-2 bg-gray-50 border-t border-gray-100' scrollWithAnimation scrollIntoView={toTabId}>
                    {dayPlans.map((day) => (
                        <View key={day.dayIndex} id={`tab-node-${day.dayIndex}`} onClick={() => handleTabClick(day.dayIndex)} className={`inline-block mr-3 px-4 py-1.5 rounded-full font-bold transition-all text-[24px] ${activeTab === day.dayIndex ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}>
                            {getFormatDayName(day.dayIndex)}
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* 主体滚动卡片区域 */}
            <ScrollView scrollY className='flex-1 h-0 w-full' scrollIntoView={toViewId} scrollWithAnimation onScroll={handlePageScroll} throttle={false}>
                <View className='pb-12'>
                    {dayPlans.map((day, dIdx) => (
                        <View key={day.dayIndex} id={`day-node-${day.dayIndex}`} className='day-card-anchor mt-4 px-4 space-y-4 pb-6 border-b border-gray-200/50 last:border-0'>

                            {/* 天级别汇总卡片 */}
                            <View className='bg-white p-4 rounded-2xl shadow-sm space-y-3 relative overflow-hidden'>
                                <View className='flex justify-between items-center'>
                                    <Text className='font-black text-gray-900 text-[28px]'>{getFormatDayName(day.dayIndex)}</Text>
                                    {day.dayIndex > 1 && (
                                        <Text onClick={() => triggerDeleteDay(dIdx)} className='font-medium text-red-500 text-[24px]'>删除天数</Text>
                                    )}
                                </View>

                                {/* 天日期选填 */}
                                <View className='flex justify-between items-center py-1 border-b border-gray-50'>
                                    <Text className='text-gray-700 text-[26px] font-medium'>日期<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
                                    <Picker mode='date' value={day.date} onChange={(e) => {
                                        const updated = [...dayPlans];
                                        updated[dIdx].date = e.detail.value;
                                        setDayPlans(updated);
                                    }}>
                                        <Text className='text-gray-400 text-[26px]'>{day.date || '选择日期 >'}</Text>
                                    </Picker>
                                </View>

                                {/* 天大标题 */}
                                <View className='space-y-1.5'>
                                    <View className='flex items-center'>
                                        <Text className='text-red-500 font-bold mr-0.5'>*</Text>
                                        <Text className='text-gray-700 text-[26px] font-medium'>当天游玩概要<Text className='text-gray-400 font-normal text-[24px]'>（必填）</Text></Text>
                                    </View>
                                    <Input
                                        className='w-full p-2.5 bg-gray-50 rounded-xl text-[28px]'
                                        placeholder='如：抵达城市 · 核心地标打卡一日游'
                                        value={day.title}
                                        onInput={(e) => {
                                            const updated = [...dayPlans];
                                            updated[dIdx].title = e.detail.value;
                                            setDayPlans(updated);
                                        }}
                                    />
                                </View>
                            </View>

                            {/* 🌟 行程项卡片细节（基于 image_7253b2.jpg 完美重构） */}
                            {day.items.map((item) => {
                                const imgList = item.images || [];
                                // 获取当前类型的显示文案
                                const currentTypeOpt = typeOptions.find(opt => opt.value === item.sectionType) || typeOptions[0];

                                return (
                                    <View key={item.id} className='bg-white p-4 rounded-2xl shadow-sm space-y-4 relative'>

                                        {/* 卡片头部：删除按钮 */}
                                        <View className='flex justify-end items-center border-b border-gray-50 pb-1.5'>
                                            <Text
                                                onClick={() => triggerDeleteItem(day.dayIndex, item.id, item.title)}
                                                className='text-red-500 font-medium text-[24px] active:opacity-60'
                                            >
                                                🗑️ 删除
                                            </Text>
                                        </View>

                                        {/* 🌟 1. 类型选择模块（必填） */}
                                        <View className='space-y-1.5'>
                                            <View className='flex items-center'>
                                                <Text className='text-red-500 font-bold mr-0.5'>*</Text>
                                                <Text className='text-gray-700 text-[26px] font-medium'>类型<Text className='text-gray-400 font-normal text-[24px]'>（必填）</Text></Text>
                                            </View>
                                            <Picker
                                                mode='selector'
                                                range={typeOptions}
                                                rangeKey='label'
                                                value={typeOptions.findIndex(o => o.value === item.sectionType)}
                                                onChange={(e) => {
                                                    const selectedIdx = Number(e.detail.value);
                                                    const selectedValue = typeOptions[selectedIdx].value as SectionType;
                                                    updateItemField(day.dayIndex, item.id, 'sectionType', selectedValue);
                                                }}
                                            >
                                                <View className='w-full p-2.5 bg-gray-50 rounded-xl text-[28px] flex justify-between items-center active:bg-gray-100'>
                                                    <Text className='text-gray-800 font-medium'>{currentTypeOpt.label}</Text>
                                                    <Text className='text-gray-400 text-[24px]'>切换 ▾</Text>
                                                </View>
                                            </Picker>
                                        </View>

                                        {/* 🌟 2. 行程输入模块（必填） */}
                                        <View className='space-y-1.5'>
                                            <View className='flex items-center'>
                                                <Text className='text-red-500 font-bold mr-0.5'>*</Text>
                                                <Text className='text-gray-700 text-[26px] font-medium'>行程<Text className='text-gray-400 font-normal text-[24px]'>（必填）</Text></Text>
                                            </View>
                                            <Input
                                                className='w-full p-2.5 bg-gray-50 rounded-xl font-medium text-[28px]'
                                                value={item.title}
                                                placeholder='请输入具体名称（如：雅典卫城）'
                                                onInput={(e) => updateItemField(day.dayIndex, item.id, 'title', e.detail.value)}
                                            />
                                        </View>

                                        {/* 🌟 3. 备注模块（可选） */}
                                        <View className='space-y-1.5'>
                                            <Text className='text-gray-700 text-[26px] font-medium'>备注<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
                                            <Textarea
                                                autoHeight
                                                className='w-full p-2.5 bg-gray-50 rounded-xl text-[28px] min-h-[70px] leading-relaxed'
                                                value={item.description}
                                                placeholder='写一点关于此景点的游玩攻略、通票购买或注意事项描述...'
                                                onInput={(e) => updateItemField(day.dayIndex, item.id, 'description', e.detail.value)}
                                            />
                                        </View>

                                        {/* 4. 九宫格美照上传（最多9张） */}
                                        <View className='space-y-1.5'>
                                            <Text className='text-gray-700 text-[26px] font-medium'>记录美照/凭证<Text className='text-gray-400 font-normal text-[24px]'>（可选，{imgList.length}/9）</Text></Text>
                                            <View className='flex flex-wrap gap-2'>
                                                {imgList.map((imgUrl, imgIdx) => (
                                                    <View key={imgIdx} className='w-[100px] h-[100px] bg-gray-100 rounded-xl relative overflow-hidden shadow-sm'>
                                                        <img src={imgUrl} className='w-full h-full object-cover' onClick={() => Taro.previewImage({ current: imgUrl, urls: imgList })} />
                                                        <View onClick={() => handleDeleteImage(day.dayIndex, item.id, imgList, imgIdx)} className='absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-xl flex items-center justify-center text-[16px] font-bold z-10 active:bg-red-600'>×</View>
                                                    </View>
                                                ))}
                                                {imgList.length < 9 && (
                                                    <View onClick={() => handleChooseImage(day.dayIndex, item.id, imgList)} className='w-[100px] h-[100px] border border-dashed border-gray-300 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-[40px] active:bg-gray-100'>+</View>
                                                )}
                                            </View>
                                        </View>

                                        {/* 5. 时间模块（可选） */}
                                        <View className='space-y-1.5'>
                                            <Text className='text-gray-700 text-[26px] font-medium'>时间<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
                                            <View className='flex items-center space-x-2'>
                                                <Picker mode='time' value={item.startTime || '09:00'} onChange={(e) => updateItemField(day.dayIndex, item.id, 'startTime', e.detail.value)} className='flex-1'>
                                                    <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100'>⏱️ {item.startTime || '开始时间'}</View>
                                                </Picker>
                                                <Text className='text-gray-300 font-bold'>~</Text>
                                                <Picker mode='time' value={item.endTime || '11:30'} onChange={(e) => updateItemField(day.dayIndex, item.id, 'endTime', e.detail.value)} className='flex-1'>
                                                    <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100'>⏱️ {item.endTime || '结束时间'}</View>
                                                </Picker>
                                            </View>
                                        </View>

                                        {/* 6. 位置模块（可选） */}
                                        <View className='space-y-1.5'>
                                            <Text className='text-gray-700 text-[26px] font-medium'>位置<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
                                            <View onClick={() => handleChooseLocation(day.dayIndex, item.id)} className='flex justify-between items-center p-3 bg-gray-50 rounded-xl min-h-[55px] active:bg-gray-100/80 transition-all'>
                                                <View className='flex-1 pr-2 truncate'>
                                                    <Text className='text-gray-700 block truncate text-[26px] font-medium'>{item.address || '点击调起地图关联经纬度点...'}</Text>
                                                    {item.latitude && (
                                                        <Text className='text-[20px] text-gray-400 block mt-0.5'>纬度: {item.latitude?.toFixed(4)}, 经度: {item.longitude?.toFixed(4)}</Text>
                                                    )}
                                                </View>
                                                <View className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[18px] flex-shrink-0 font-bold'>📍</View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* 节点底座动作盘 */}
                            <View className='pt-1'>
                                <Button onClick={() => handleAddCustomItem(day.dayIndex)} className='w-full py-2 bg-white border border-dashed border-green-500 text-green-500 font-bold rounded-xl text-[26px] shadow-sm active:bg-green-50/50 m-0'>
                                    + 添加行程项
                                </Button>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* 吸底动作栏 */}
            <View className='bg-white border-t border-gray-100 p-4 pb-safe flex-shrink-0 z-50 shadow-lg'>
                <Button onClick={handleNextStep} className='w-full py-3 font-bold bg-green-500 text-white rounded-full text-[28px] m-0 shadow-md active:opacity-95'>
                    下一步 (配置全局基本信息)
                </Button>
            </View>

            {/* 统一删除二级弹窗 */}
            <Modal visible={modalVisible} title={modalTitle} onConfirm={handleConfirmDelete} onCancel={() => setModalVisible(false)}>
                <Text className='text-gray-600 block py-2 text-[26px] leading-relaxed'>{modalContent}</Text>
            </Modal>
        </View>
    );
}