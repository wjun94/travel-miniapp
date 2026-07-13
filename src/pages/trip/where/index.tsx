import { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { searchDestinations, DestinationItem } from '@/api/common';

export default function SearchPage() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<DestinationItem[]>([]);
    const [loading, setLoading] = useState(false);

    // 处理搜索逻辑
    const handleSearch = async (val: string) => {
        const trimmedVal = val.trim();
        if (!trimmedVal) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const res = await searchDestinations({ keyword: trimmedVal });
            setResults(res || []);
        } catch (error) {
            console.error('搜索目的地失败:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // 简易防抖逻辑
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(keyword);
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    // 点击选择目的地
    const handleSelect = (item: DestinationItem) => {
        Taro.setStorageSync('SELECTED_DESTINATION', item);
        Taro.navigateTo({ url: '../date/index' });
    };

    // 清空输入框
    const handleClear = () => {
        setKeyword('');
        setResults([]);
    };

    // 辅助函数：根据 UI 稿拆分出高亮文本与普通文本
    const renderHighlightedName = (name: string, target: string) => {
        if (!target || !name.includes(target)) {
            return <Text className='text-36px font-bold text-gray-900'>{name}</Text>;
        }

        const index = name.indexOf(target);
        const before = name.substring(0, index);
        const match = target;
        const after = name.substring(index + target.length);

        return (
            <Text className='text-36px font-bold text-gray-900'>
                {before}
                <Text style={{ color: '#10B981' }}>{match}</Text>
                {after}
            </Text>
        );
    };

    // 辅助函数：拼接下方详细地址（对应 UI 稿: 中国浙江省温州市）
    const formatAddress = (item: DestinationItem) => {
        const parts = [item.province, item.city, item.district].filter(Boolean);
        // 如果城市名和目的地名字完全一样，可以去重，这里根据实际业务调整
        return parts.join('');
    };

    return (
        <View className='min-h-screen bg-white px-6 pt-4 box-border'>
            {/* 头部标题 */}
            <View className='text-60px font-bold text-gray-900 tracking-wide mb-8 mt-4'>
                想去哪儿
            </View>

            {/* 搜索输入框 */}
            <View className='w-full bg-gray-100 rounded-2xl px-5 py-3.5 flex items-center justify-between mb-6 box-border'>
                <Input
                    className='flex-1 text-32px text-gray-800 placeholder-gray-400 bg-transparent outline-none'
                    type='text'
                    placeholder='输入城市 / 国家'
                    value={keyword}
                    onInput={(e) => setKeyword(e.detail.value)}
                />
                {keyword && (
                    <View
                        className='w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center ml-2'
                        onClick={handleClear}
                    >
                        <Text className='text-white text-xs scale-75' style={{ marginTop: '-2px' }}>×</Text>
                    </View>
                )}
            </View>

            {/* 搜索结果列表 */}
            <View className='mt-2'>
                {loading && (
                    <Text className='text-sm text-gray-400 block text-center py-4'>正在搜索...</Text>
                )}

                {!loading && results.length > 0 && (
                    <View className='flex flex-col gap-y-6'>
                        {results.map((item, index) => (
                            <View
                                key={item.code || index}
                                className='flex items-center justify-between active:opacity-70 py-1'
                                onClick={() => handleSelect(item)}
                            >
                                <View className='flex items-center space-x-2'>
                                    {item.emoji && <Text className='text-xl mr-2'>{item.emoji}</Text>}
                                    <View className='flex flex-col'>
                                        {/* 优化核心 1：还原 UI 稿的主题色高亮效果 */}
                                        {renderHighlightedName(item.name || '', keyword.trim())}

                                        {/* 优化核心 2：使用后端真实字段拼接描述信息 */}
                                        <Text className='text-26px text-gray-400 mt-2 font-light tracking-wide'>
                                            {formatAddress(item)}
                                        </Text>
                                    </View>
                                </View>

                                {item.type && (
                                    <Text className='text-24px bg-gray-50 text-gray-400 px-2 py-0.5 rounded border border-solid border-gray-100 font-light'>
                                        {item.type}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 空状态 */}
                {!loading && keyword.trim() && results.length === 0 && (
                    <Text className='text-sm text-gray-400 block text-center py-8'>
                        未找到相关目的地
                    </Text>
                )}
            </View>
        </View>
    );
}