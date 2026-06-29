import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image, Slider } from '@tarojs/components';

export default function TravelGuideEditor() {
    const [title, setTitle] = useState('');
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState([1000, 3000]);
    const [summary, setSummary] = useState('');

    return (
        <View className="min-h-screen bg-gray-50 pb-10 text-gray-800 text-sm">

            {/* 1. 顶部封面图 */}
            <View className="relative w-full h-56 bg-gray-200">
                <Image
                    src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800" // 替换为类似圣托里尼的网图
                    mode="aspectFill"
                    className="w-full h-full"
                />
                <View className="absolute top-4 right-4 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                    1/5
                </View>
                <View className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1">
                    <Text>📝</Text>
                    <Text>更换封面</Text>
                </View>
            </View>

            <View className="px-4 -mt-4 relative z-10">
                {/* 2. 标题输入框 */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <Input
                        placeholder="给攻略起个吸引人的标题 (5-30字)"
                        placeholderClass="text-gray-300"
                        maxlength={30}
                        className="w-full text-base font-medium placeholder-gray-300"
                        value={title}
                        onInput={(e) => setTitle(e.detail.value)}
                    />
                </View>

                {/* 3. 基础信息卡片 */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <View className="flex justify-between items-center mb-4">
                        <Text className="font-bold text-base">基础信息</Text>
                        <Text className="text-orange-400 text-xs">🔼</Text>
                    </View>

                    {/* 目的地 & 建议天数 */}
                    <View className="grid grid-cols-2 gap-4 mb-4">
                        <View className="border border-gray-100 rounded-lg p-3">
                            <Text className="text-xs text-gray-400 block mb-1">📍 目的地</Text>
                            <View className="flex justify-between items-center">
                                <Text className="text-gray-300">选择目的地</Text>
                                <Text className="text-gray-300 text-xs">＞</Text>
                            </View>
                        </View>

                        <View className="border border-gray-100 rounded-lg p-3">
                            <Text className="text-xs text-gray-400 block mb-1">📅 建议天数</Text>
                            <View className="flex justify-between items-center">
                                <Text className="text-gray-400" onClick={() => setDays(Math.max(1, days - 1))}>－</Text>
                                <Text className="font-medium">{days} 天</Text>
                                <Text className="text-gray-400" onClick={() => setDays(days + 1)}>＋</Text>
                            </View>
                        </View>
                    </View>

                    {/* 预算范围 */}
                    <View className="mb-4">
                        <Text className="text-xs text-gray-400 block mb-1">🪙 预算范围 (人均)</Text>
                        <View className="flex items-center justify-between text-xs text-gray-600 px-1 mb-1">
                            <Text>¥1000</Text>
                            <Text>¥3000</Text>
                        </View>
                        {/* 微信小程序原生Slider（双滑块在小程序原生不支持，这里用单滑块模拟，实际多端可用第三方组件如 NutUI） */}
                        <Slider blockColor="#ff851b" activeColor="#ff851b" backgroundColor="#f3f4f6" blockSize={16} step={100} min={1000} max={3000} value={2000} />
                    </View>

                    {/* 最佳季节 */}
                    <View>
                        <Text className="text-xs text-gray-400 block mb-2">🏞️ 最佳季节 (多选)</Text>
                        <View className="flex flex-wrap gap-2 text-xs">
                            <View className="bg-pink-50 text-pink-500 px-2.5 py-1.5 rounded-md flex items-center gap-1 border border-pink-100">
                                <Text>🌸</Text><Text>春季</Text>
                            </View>
                            <View className="bg-green-50 text-green-600 px-2.5 py-1.5 rounded-md flex items-center gap-1 border border-green-100">
                                <Text>☀️</Text><Text>夏季</Text>
                            </View>
                            <View className="bg-orange-50 text-orange-500 px-2.5 py-1.5 rounded-md flex items-center gap-1 border border-orange-100">
                                <Text>🍁</Text><Text>秋季</Text>
                            </View>
                            <View className="bg-blue-50 text-blue-500 px-2.5 py-1.5 rounded-md flex items-center gap-1 border border-blue-100">
                                <Text>❄️</Text><Text>冬季</Text>
                            </View>
                            <View className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-md flex items-center gap-1">
                                <Text>🌐</Text><Text>四季皆宜</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 4. 攻略摘要 */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <View className="flex items-center gap-1 mb-2">
                        <View className="w-1 h-3 bg-orange-400 rounded-full"></View>
                        <Text className="font-bold">攻略摘要</Text>
                    </View>
                    <Textarea
                        placeholder="一句话总结这篇攻略的亮点..."
                        placeholderClass="text-gray-300"
                        maxlength={300}
                        className="w-full h-16 text-sm text-gray-700"
                        value={summary}
                        onInput={(e) => setSummary(e.detail.value)}
                    />
                    <View className="text-right text-xs text-gray-300">{summary.length}/300</View>
                </View>

                {/* 5. 攻略内容 */}
                <View className="mb-4">
                    <View className="flex justify-between items-center mb-2 px-1">
                        <View className="flex items-center gap-1">
                            <View className="w-1 h-3 bg-orange-400 rounded-full"></View>
                            <Text className="font-bold">攻略内容</Text>
                        </View>
                        <Text className="text-xs text-gray-300">长按拖拽可调整顺序</Text>
                    </View>

                    {/* 板块 1 */}
                    <View className="bg-white rounded-xl p-4 shadow-sm mb-3 relative">
                        <View className="absolute left-3 top-5 text-gray-300 text-base">≈</View>
                        <View className="pl-6">
                            <Input placeholder="输入板块标题 (如: 美食推荐)" placeholderClass="text-gray-300" className="w-full font-medium mb-2" />
                            <Textarea placeholder="这里可以输入详细内容，支持图文混排..." placeholderClass="text-gray-300" className="w-full h-12 text-xs text-gray-600 mb-2" />

                            {/* 板块内嵌图片 */}
                            <View className="w-full h-28 rounded-lg overflow-hidden mb-3">
                                <Image src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800" mode="aspectFill" className="w-full h-full" />
                            </View>

                            {/* 富文本工具栏栏 */}
                            <View className="flex items-center justify-around border-t border-gray-50 pt-2 text-gray-400 text-sm">
                                <Text className="font-bold text-gray-700">B</Text>
                                <Text>📋</Text>
                                <Text>🖼️</Text>
                                <Text>🔗</Text>
                                <Text>—</Text>
                                <Text>•••</Text>
                            </View>
                        </View>
                    </View>

                    {/* 板块 2 */}
                    <View className="bg-white rounded-xl p-4 shadow-sm mb-4 relative overflow-hidden h-24">
                        <View className="absolute left-3 top-5 text-gray-300 text-base">≈</View>
                        <View className="pl-6">
                            <Input placeholder="输入板块标题 (如: 美食推荐)" placeholderClass="text-gray-300" className="w-full font-medium mb-2" />
                            <View className="w-full h-20 rounded-lg overflow-hidden">
                                <Image src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" mode="aspectFill" className="w-full h-full" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* 6. 添加新板块按钮 */}
                <View className="border-2 border-dashed border-orange-200 rounded-xl p-3 flex items-center justify-center bg-orange-50/30">
                    <View className="flex items-center gap-1 text-orange-500 font-medium text-sm">
                        <Text className="text-base font-bold">＋</Text>
                        <Text>添加新板块</Text>
                    </View>
                </View>

            </View>
        </View>
    );
}