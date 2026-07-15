import { useState, useEffect } from 'react';
import { View, Text, Input, Picker, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import {
    createChecklist,
    getChecklistCategories,
    Checklist,
    ChecklistItem,
    updateChecklist,
    getChecklistDetail
} from '@/api/checklist';
import { getMyTrips } from '@/api/trip';

export default function ChecklistFormPage() {
    const router = useRouter();
    const { id } = router.params;
    const isEdit = !!id;

    // 页面基础状态
    const [name, setName] = useState('');
    const [tripId, setTripId] = useState('');
    const [items, setItems] = useState<ChecklistItem[]>([]);

    // 关联行程选择
    const [tripList, setTripList] = useState<any[]>([]);
    const [selectedTripIdx, setSelectedTripIdx] = useState(-1);

    // 输入框受控状态
    const [customItemText, setCustomItemText] = useState('');

    // 预置分类状态
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

    // 初始化数据
    useEffect(() => {
        // 1. 获取系统预置分类
        getChecklistCategories().then((res: any) => {
            if (res?.code === 0 && res.data) {
                setCategories(res.data);
            } else if (Array.isArray(res)) {
                setCategories(res);
            }
        });

        // 3. 获取我的行程列表
        getMyTrips(1, 100).then((res: any) => {
            const list = res?.list || [];
            setTripList(list);
        });

        // 2. 如果是编辑模式，通过详情接口回显数据
        if (isEdit) {
            Taro.setNavigationBarTitle({ title: '修改备忘清单' });
            getChecklistDetail(id!).then((res: any) => {
                const detail = res?.data || res;
                if (detail) {
                    setName(detail.name);
                    setTripId(detail.tripId || '');
                    setItems(detail.items || []);
                    // 编辑模式回显时同步选中索引
                    if (detail.tripId) {
                        // 等 tripList 加载完成后匹配，或直接尝试匹配
                        setTimeout(() => {
                            setTripList(prev => {
                                const idx = prev.findIndex((t: any) => t.id === detail.tripId);
                                if (idx >= 0) setSelectedTripIdx(idx);
                                return prev;
                            });
                        }, 300);
                    }
                }
            });
        } else {
            Taro.setNavigationBarTitle({ title: '新建备忘清单' });
        }
    }, [id, isEdit]);

    // 添加自定义清单项逻辑
    const handleAddItem = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        if (items.some(i => i.text === trimmed)) {
            Taro.showToast({ title: '清单中已存在该物品', icon: 'none' });
            return;
        }

        const newItem: ChecklistItem = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            checklistId: id || '',
            text: trimmed,
            checked: 0
        };
        setItems([...items, newItem]);
        setCustomItemText(''); // 完美清空输入框
    };

    // 移除清单项
    const handleRemoveItem = (text: string) => {
        setItems(items.filter(item => item.text !== text));
    };

    // 灵感打包库的点击联动（开关切换勾选状态）
    const handleToggleFromCategory = (text: string) => {
        const isAdded = items.some(i => i.text === text);
        if (isAdded) {
            handleRemoveItem(text);
        } else {
            handleAddItem(text);
        }
    };

    // 保存提交
    const handleSave = async () => {
        if (!name.trim()) {
            Taro.showToast({ title: '请输入清单名称', icon: 'none' });
            return;
        }

        try {
            Taro.showLoading({ title: '保存中...' });
            const payload: Partial<Checklist> = {
                name,
                tripId: tripId || undefined,
                items,
                isTemplate: 0
            };

            if (isEdit) {
                await updateChecklist(id!, { name, items });
            } else {
                await createChecklist(payload);
            }

            Taro.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1500);
        } catch (err) {
            Taro.showToast({ title: '操作失败', icon: 'none' });
        } finally {
            Taro.hideLoading();
        }
    };

    return (
        <View className="min-h-screen bg-[#FAFAF9] pb-24 px-4 pt-4 text-slate-800 font-sans box-border">
            {/* 基础信息卡片 */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 mb-4 space-y-4">
                <View>
                    <Text className="font-semibold text-stone-400 tracking-wider block mb-2 text-[24px]">清单名称</Text>
                    <Input
                        type="text"
                        placeholder="如：海岛防晒必备、川西徒步装备"
                        value={name}
                        onInput={(e) => setName(e.detail.value)}
                        className="w-full h-11 bg-stone-50 rounded-2xl px-4 placeholder-stone-300 border-none box-border text-[28px]"
                    />
                </View>
                <View>
                    <Text className="font-semibold text-stone-400 tracking-wider block mb-2 text-[24px]">关联行程(选填)</Text>
                    {tripList.length > 0 ? (
                        <View className='relative'>
                            <Picker
                                mode='selector'
                                range={tripList}
                                rangeKey='title'
                                value={selectedTripIdx >= 0 ? selectedTripIdx : 0}
                                onChange={(e) => {
                                    const idx = Number(e.detail.value);
                                    setSelectedTripIdx(idx);
                                    setTripId(tripList[idx]?.id || '');
                                }}
                                className='w-full'
                            >
                                <View className='w-full h-11 bg-stone-50 rounded-2xl px-4 flex flex-row items-center justify-between border-none box-border'>
                                    <Text className={`text-[26px] ${selectedTripIdx >= 0 ? 'text-stone-700' : 'text-stone-300'}`}>
                                        {selectedTripIdx >= 0 ? tripList[selectedTripIdx]?.title : '请选择关联的旅行行程'}
                                    </Text>
                                    <Text className='iconfont icon-arrow-down text-[24px] text-stone-300' />
                                </View>
                            </Picker>
                        </View>
                    ) : (
                        <View className='w-full h-11 bg-stone-50 rounded-2xl px-4 flex flex-row items-center border-none box-border'>
                            <Text className='text-[26px] text-stone-300'>暂无行程数据</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 已加清单项区块 */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 mb-4">
                <View className="flex justify-between items-center mb-3">
                    <Text className="font-bold text-stone-700 text-[28px]">当前清单明细</Text>
                    <Text className="bg-[#10B981]/10 text-[#10B981] px-2.5 py-1 rounded-full font-medium text-[24px]">
                        已加 {items.length} 项
                    </Text>
                </View>

                {/* 快捷输入组 */}
                <View className="flex items-center space-x-2 mb-4 w-full box-border">
                    <View className="flex-1 min-w-0">
                        <Input
                            type="text"
                            placeholder="输入自定义物品..."
                            confirmType="done"
                            value={customItemText}
                            onInput={(e) => setCustomItemText(e.detail.value)}
                            onConfirm={() => handleAddItem(customItemText)}
                            className="w-full h-10 bg-stone-50 rounded-xl px-3 placeholder-stone-400 border-none box-border text-[28px]"
                        />
                    </View>
                    <View
                        onClick={() => handleAddItem(customItemText)}
                        className="h-10 px-4 bg-[#10B981] active:bg-[#0d9668] rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    >
                        <Text className="text-white font-medium text-[24px]">确定</Text>
                    </View>
                </View>

                {items.length === 0 ? (
                    <View className="py-8 text-center">
                        <Text className="text-stone-300 block text-[24px]">清单空空如也，从下方推荐里挑一些吧 🏕️</Text>
                    </View>
                ) : (
                    <View className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                            <View
                                key={item.id}
                                className="flex items-center space-x-1 bg-stone-50 border border-stone-200/60 pl-3 pr-2 py-1.5 rounded-xl transition-all max-w-full box-border overflow-hidden"
                            >
                                <Text className="text-stone-600 truncate max-w-[160px] text-[28px]">{item.text}</Text>
                                <Text className='iconfont icon-close text-stone-400 active:text-red-400' onClick={() => handleRemoveItem(item.text)} />
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* 预置灵感库 */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
                <Text className="font-bold text-stone-700 block mb-3 text-[28px]">行李打包灵感库</Text>

                {/* 横向分类滑动 */}
                <ScrollView
                    scrollX
                    scrollWithAnimation
                    scrollIntoView={`tab_${activeCategoryIdx}`}
                    className="whitespace-nowrap w-full mb-4"
                >
                    {categories?.map((cat: any, idx) => (
                        <View
                            key={cat.id || idx}
                            id={`tab_${idx}`}
                            onClick={() => setActiveCategoryIdx(idx)}
                            className={`inline-block px-4 py-2 rounded-xl mr-2 transition-all font-medium box-border text-[24px] ${activeCategoryIdx === idx
                                ? 'bg-[#10B981] text-white shadow-sm shadow-[#10B981]/30 transform scale-105'
                                : 'bg-stone-50 text-stone-500'
                                }`}
                            style={{ display: 'inline-block' }} // ScrollView子元素横向排列保留此内联布局属性
                        >
                            {cat.name}
                        </View>
                    ))}
                </ScrollView>

                {/* 分类下的推荐物品 */}
                <View className="bg-stone-50/50 p-3 rounded-2xl min-h-[100px]">
                    {categories[activeCategoryIdx]?.items?.length > 0 ? (
                        <View className="flex flex-wrap gap-2">
                            {categories[activeCategoryIdx].items.map((item: any) => {
                                const isAdded = items.some(i => i.text === item.text);
                                return (
                                    <View
                                        key={item.id}
                                        onClick={() => handleToggleFromCategory(item.text)}
                                        className={`rounded-10px border transition-all flex items-center box-border overflow-hidden max-w-full ${isAdded
                                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981] font-medium pl-3 pr-6 py-2 relative'
                                            : 'bg-white text-stone-600 border-stone-200 hover:border-[#10B981] px-3 py-2 space-x-1'
                                            }`}
                                    >
                                        {/* 文字最大宽度限制加溢出点点点 */}
                                        <Text className="truncate max-w-[140px] text-[24px]">{item.text}</Text>

                                        {/* 勾选/未勾选图标：使用纯 Tailwind 精准定位在安全边界内 */}
                                        {isAdded ? (
                                            <Text className="iconfont icon-selected absolute -right-1px -bottom-1px text-[#10B981] shrink-0 text-[40px]" />
                                        ) : (
                                            <Text className="iconfont icon-plus text-stone-400 font-bold shrink-0 text-[20px]" />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="text-stone-400 block text-center py-6 text-[24px]">该分类下暂无推荐</Text>
                    )}
                </View>
            </View>

            {/* 底部固定操作栏 */}
            <View className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9]/90 to-transparent backdrop-blur-sm z-10 box-border">
                <View
                    onClick={handleSave}
                    className="w-full h-12 bg-[#10B981] active:bg-[#0d9668] shadow-lg shadow-[#10B981]/20 rounded-2xl flex items-center justify-center transition-all"
                >
                    <Text className="text-white font-medium tracking-wider text-[28px]">
                        {isEdit ? '确认保存修改' : '生成备忘清单'}
                    </Text>
                </View>
            </View>
        </View>
    );
}