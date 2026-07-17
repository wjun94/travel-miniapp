import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';

// 模拟笔记数据
const mockNotes = [
    {
        id: 1,
        title: '#图片',
        cover: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500', // 替换为类似大熊图片的插画/占位图
        author: '流氓兔',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        likes: 60,
        time: '昨天 18:01',
        tag: '刚刚看过'
    },
    {
        id: 2,
        title: '#我是春节主理人 #交换新春祝福',
        cover: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500', // 替换为类似马儿/祝福的插画
        author: '流氓兔',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        likes: 3,
        time: '02-16'
    },
    {
        id: 3,
        title: '舞台演出瞬间记录 🎤',
        cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500', // 对应帅气舞台照
        author: '流氓兔',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        likes: 520,
        time: '05-20'
    },
    {
        id: 4,
        title: '正义降临！机甲战士登场',
        cover: 'https://images.unsplash.com/photo-1608889174633-41a0c24b0bc3?w=500', // 对应奥特曼/机甲
        author: '流氓兔',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        likes: 12,
        time: '03-12'
    }
];

// 模拟收藏数据
const mockCollections = [
    {
        id: 101,
        title: '超赞的前端 Tailwind 教程 ⚡️',
        cover: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500',
        author: '前端小能手',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        likes: 1240,
        time: '06-18'
    },
    {
        id: 102,
        title: '今日份治愈系风景，太美了 🏔️',
        cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500',
        author: '旅行家Lily',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        likes: 988,
        time: '06-15'
    }
];

export default function PersonalPage() {
    const [activeTab, setActiveTab] = useState<'notes' | 'collect'>('notes');

    // 根据当前激活的 Tab 渲染对应数据
    const currentList = activeTab === 'notes' ? mockNotes : mockCollections;

    // 简单的左右两列瀑布流分流
    const leftColumn = currentList.filter((_, idx) => idx % 2 === 0);
    const rightColumn = currentList.filter((_, idx) => idx % 2 !== 0);

    return (
        <View className="min-h-screen bg-slate-800 text-white flex flex-col font-sans pb-10">

            {/* 1. 顶部导航与背景 */}
            <View className="px-4 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-700 to-slate-800">
                <View className="text-2xl font-bold text-white">←</View>
                <View className="flex space-x-6 text-xl">
                    <Text className="text-white">···</Text>
                </View>
            </View>

            {/* 2. 个人信息区域 */}
            <View className="px-5 pb-4">
                <View className="flex items-center space-x-4">
                    {/* 头像 + 挂件效果 */}
                    <View className="relative">
                        <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                            className="w-20 h-20 rounded-full border-2 border-white object-cover"
                        />
                        {/* 头像上可爱的冰淇淋小挂件 */}
                        <View className="absolute -top-3 -right-1 text-2xl">🍦</View>
                    </View>

                    <View className="flex-1">
                        <Text className="text-2xl font-bold tracking-wide">流氓兔</Text>
                        <View className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                            <Text>小红书号: 2388640669</Text>
                            <Text className="bg-slate-700 px-1 rounded text-[10px]">📋</Text>
                        </View>
                        <Text className="text-xs text-gray-400 mt-0.5">IP: 浙江</Text>
                    </View>
                </View>

                {/* 数据统计 */}
                <View className="flex space-x-8 mt-6">
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">1.9万</Text>
                        <Text className="text-xs text-gray-400 mt-1">关注</Text>
                    </View>
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">780</Text>
                        <Text className="text-xs text-gray-400 mt-1">粉丝</Text>
                    </View>
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">194</Text>
                        <Text className="text-xs text-gray-400 mt-1">获赞与收藏</Text>
                    </View>
                </View>

                {/* 交互按钮行 */}
                <View className="flex space-x-3 mt-6">
                    <View className="flex-1 bg-[#F97316] text-white text-center py-2.5 rounded-full font-semibold text-sm active:opacity-90 transition-opacity">
                        关注
                    </View>
                    <View className="flex-1 bg-slate-700 text-white text-center py-2.5 rounded-full font-semibold text-sm active:opacity-90 transition-opacity">
                        发私信
                    </View>
                    <View className="bg-slate-700 px-3 flex items-center justify-center rounded-full text-lg">
                        👤+
                    </View>
                </View>
            </View>

            {/* 3. Tab 切换与瀑布流卡片区 (白底) */}
            <View className="flex-1 bg-gray-50 rounded-t-2xl pt-2 mt-2 text-slate-800">

                {/* Tab 栏 */}
                <View className="flex justify-between items-center px-6 border-b border-gray-100">
                    <View className="flex space-x-8 py-3">
                        {/* 笔记 Tab */}
                        <View
                            onClick={() => setActiveTab('notes')}
                            className="relative flex flex-col items-center cursor-pointer"
                        >
                            <Text className={`text-base font-semibold transition-colors ${activeTab === 'notes' ? 'text-gray-900' : 'text-gray-400'}`}>
                                笔记
                            </Text>
                            {activeTab === 'notes' && (
                                <View className="absolute -bottom-3 w-8 h-[3px] bg-[#F97316] rounded-full" />
                            )}
                        </View>

                        {/* 收藏 Tab */}
                        <View
                            onClick={() => setActiveTab('collect')}
                            className="relative flex flex-col items-center cursor-pointer"
                        >
                            <Text className={`text-base font-semibold transition-colors ${activeTab === 'collect' ? 'text-gray-900' : 'text-gray-400'}`}>
                                收藏
                            </Text>
                            {activeTab === 'collect' && (
                                <View className="absolute -bottom-3 w-8 h-[3px] bg-[#F97316] rounded-full" />
                            )}
                        </View>
                    </View>

                    {/* 搜索图标 */}
                    <View className="text-gray-400 text-lg">🔍</View>
                </View>

                {/* 瀑布流卡片列表 */}
                <ScrollView scrollY className="p-3 h-full">
                    <View className="flex flex-row justify-between items-start">

                        {/* 左侧列 */}
                        <View className="flex-1 flex flex-col mr-2">
                            {leftColumn.map((note: any) => (
                                <View key={note.id} className="bg-white rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100">
                                    <View className="relative">
                                        <Image src={note.cover} mode="widthFix" className="w-full h-auto min-h-[160px] bg-gray-200" />
                                        {note.tag && (
                                            <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Text className="text-white text-xs bg-black/40 px-2 py-1 rounded-full">{note.tag}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="p-2.5">
                                        <Text className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                            {note.title}
                                        </Text>
                                        <View className="flex items-center justify-between mt-3">
                                            <View className="flex items-center space-x-1.5">
                                                <Image src={note.avatar} className="w-5 h-5 rounded-full object-cover" />
                                                <Text className="text-[11px] text-gray-500 max-w-[60px] truncate">{note.author}</Text>
                                            </View>
                                            <View className="flex items-center space-x-0.5 text-gray-400 text-xs">
                                                <Text>❤️</Text>
                                                <Text className="text-[11px]">{note.likes}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* 右侧列 */}
                        <View className="flex-1 flex flex-col ml-2">
                            {rightColumn.map(note => (
                                <View key={note.id} className="bg-white rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100">
                                    <View className="relative">
                                        <Image src={note.cover} mode="widthFix" className="w-full h-auto min-h-[160px] bg-gray-200" />
                                    </View>
                                    <View className="p-2.5">
                                        <Text className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                            {note.title}
                                        </Text>
                                        <View className="flex items-center justify-between mt-3">
                                            <View className="flex items-center space-x-1.5">
                                                <Image src={note.avatar} className="w-5 h-5 rounded-full object-cover" />
                                                <Text className="text-[11px] text-gray-500 max-w-[60px] truncate">{note.author}</Text>
                                            </View>
                                            <View className="flex items-center space-x-0.5 text-gray-400 text-xs">
                                                <Text>❤️</Text>
                                                <Text className="text-[11px]">{note.likes}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                    </View>
                </ScrollView>
            </View>

        </View>
    );
}