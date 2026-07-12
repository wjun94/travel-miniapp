import React, { useState, useEffect, useCallback } from 'react';
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
            // 接口拦截器已校验 code === 0，res 直接为数据列表
            setResults(res || []);
        } catch (error) {
            console.error('搜索目的地失败:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // 简易防抖逻辑：当 keyword 改变后延迟 300ms 触发搜索
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(keyword);
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    // 点击选择目的地
    const handleSelect = (item: DestinationItem) => {
        console.log('选中的目的地:', item);

        // 将目的地存入缓存，供后续页面使用
        Taro.setStorageSync('SELECTED_DESTINATION', item);
        Taro.navigateBack();
    };

    return (
        <View className='min-h-screen bg-white px-6 pt-4 box-border'>
            {/* 头部标题 */}
            <View className='text-42px font-bold text-gray-900 tracking-wide mb-6 mt-2'>
                想去哪儿
            </View>

            {/* 搜索输入框 */}
            <View className='w-full bg-gray-100 rounded-full px-5 py-3 flex items-center mb-4 box-border'>
                <Input
                    className='w-full text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none'
                    type='text'
                    placeholder='输入城市 / 国家'
                    value={keyword}
                    onInput={(e) => setKeyword(e.detail.value)}
                />
            </View>

            {/* 搜索结果列表 */}
            <View className='mt-2'>
                {loading && (
                    <Text className='text-sm text-gray-400 block text-center py-4'>正在搜索...</Text>
                )}

                {!loading && results.length > 0 && (
                    <View className='divide-y divide-gray-100'>
                        {results.map((item, index) => (
                            <View
                                key={index}
                                className='py-4 flex items-center justify-between active:bg-gray-50'
                                onClick={() => handleSelect(item)}
                            >
                                <View className='flex items-center space-x-2'>
                                    {item.emoji && <Text className='text-xl mr-2'>{item.emoji}</Text>}
                                    <View className='flex flex-col'>
                                        <Text className='text-base text-gray-800 font-medium'>{item.name}</Text>
                                        {item.province && (
                                            <Text className='text-xs text-gray-400 mt-0.5'>{item.province}</Text>
                                        )}
                                    </View>
                                </View>
                                {item.type && (
                                    <Text className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded'>
                                        {item.type}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 允许输入但未搜索到结果时的空状态 */}
                {!loading && keyword.trim() && results.length === 0 && (
                    <Text className='text-sm text-gray-400 block text-center py-8'>
                        未找到相关目的地
                    </Text>
                )}
            </View>
        </View>
    );
}