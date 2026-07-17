import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { NavBar, Image, ScrollLoadList } from '@/components';
import { useRequest } from 'ahooks';
import { getProfile, getUserFeed, getUserFavorites } from '@/api/personal';
import { followUser, unfollowUser } from '@/api/follow';
import { formatTime } from '@/utils';

export default function PersonalPage() {
    const router = useRouter();
    const userId = router.params?.userId || '';
    const justViewedId = router.params?.id || '';

    const [activeTab, setActiveTab] = useState<'notes' | 'collect'>('notes');
    const [collectType, setCollectType] = useState<'guide' | 'trip'>('guide');

    // 获取用户信息（含关注状态）
    const { data: profile, mutate: setProfile } = useRequest(
        () => getProfile(userId),
        { refreshDeps: [userId] }
    );

    // 关注/取关
    const handleToggleFollow = async () => {
        if (!profile) return;
        try {
            if (profile.isFollowed) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }
            setProfile((prev: any) => prev ? { ...prev, isFollowed: !prev.isFollowed } : prev);
        } catch {
            Taro.showToast({ title: '操作失败', icon: 'none' });
        }
    };

    return (
        <View className="min-h-screen bg-slate-800 text-white flex flex-col font-sans pb-10">

            <NavBar showBack backgroundColor='transparent' />

            {/* 2. 个人信息区域 */}
            <View className="px-5 pb-4 pt-2">
                <View className="flex items-center space-x-4">
                    {/* 头像 */}
                    <View className="relative">
                        <Image
                            isAvatar
                            src={profile?.avatarUrl || ''}
                            className="w-20 h-20 rounded-full border-2 border-white object-cover"
                        />
                    </View>

                    <View className="flex-1">
                        <Text className="text-2xl font-bold tracking-wide">{profile?.nickname || ''}</Text>
                        <View className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                            <Text>用户ID: {userId}</Text>
                            <Text
                                onClick={() => {
                                    Taro.setClipboardData({ data: userId });
                                    Taro.showToast({ title: '已复制', icon: 'none' });
                                }}
                                className="iconfont icon-copy text-gray-400 text-sm"
                            />
                        </View>
                        <Text className="text-xs text-gray-400 mt-0.5">
                            {profile?.guideCount ?? 0} 攻略 · {profile?.tripCount ?? 0} 行程
                        </Text>
                    </View>
                </View>

                {/* 数据统计 */}
                <View className="flex space-x-8 mt-6">
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">{profile?.followCount ?? 0}</Text>
                        <Text className="text-xs text-gray-400 mt-1">关注</Text>
                    </View>
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">{profile?.followerCount ?? 0}</Text>
                        <Text className="text-xs text-gray-400 mt-1">粉丝</Text>
                    </View>
                    <View className="flex flex-col items-center">
                        <Text className="text-lg font-bold">{((profile?.totalLikes ?? 0) + (profile?.totalFavs ?? 0)).toLocaleString()}</Text>
                        <Text className="text-xs text-gray-400 mt-1">获赞与收藏</Text>
                    </View>
                </View>

                {/* 交互按钮行 */}
                <View className="flex space-x-3 mt-6">
                    {!profile?.isSelf && (
                        <>
                            <View
                                onClick={handleToggleFollow}
                                className={`flex-1 text-center py-2.5 rounded-full font-semibold text-sm active:opacity-90 transition-opacity ${profile?.isFollowed ? 'bg-slate-700 text-white' : 'bg-[#F97316] text-white'}`}
                            >
                                {profile?.isFollowed ? '已关注' : '关注'}
                            </View>
                            <View className="flex-1 bg-slate-700 text-white text-center py-2.5 rounded-full font-semibold text-sm active:opacity-90 transition-opacity">
                                发私信
                            </View>
                            <View className="bg-slate-700 px-3 flex items-center justify-center rounded-full text-lg">
                                👤+
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* 3. Tab 切换与卡片列表区 (白底) */}
            <View className="flex-1 bg-gray-50 rounded-t-2xl pt-2 mt-2 text-slate-800">

                {/* Tab 栏 */}
                <View className="flex justify-between items-center px-6 border-b border-gray-100">
                    <View className="flex space-x-8 py-3">
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
                </View>

                {/* 收藏类型子Tab */}
                {activeTab === 'collect' && (
                    <View className="flex flex-row items-center px-6 py-2.5 space-x-4 bg-white border-b border-gray-100">
                        <Text
                            onClick={() => setCollectType('guide')}
                            className={`inline-block px-4 py-1 rounded-full text-[22px] font-medium ${collectType === 'guide' ? 'bg-[#ff2442] text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            攻略
                        </Text>
                        <Text
                            onClick={() => setCollectType('trip')}
                            className={`inline-block px-4 py-1 rounded-full text-[22px] font-medium ${collectType === 'trip' ? 'bg-[#ff2442] text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            行程
                        </Text>
                    </View>
                )}

                {/* 笔记列表 */}
                {activeTab === 'notes' ? (
                    <ScrollLoadList
                        request={(page, pageSize) =>
                            getUserFeed({ id: userId, page, pageSize }).then((res: any) => ({
                                list: res?.list?.list || res?.list || [],
                                total: res?.list?.total || res?.total || 0,
                            }))
                        }
                        numColumns={2}
                        columnGap={8}
                        rowGap={8}
                        pageSize={10}
                        emptyText="暂无笔记"
                        scrollViewProps={{
                            className: 'px-2 pt-2 box-border',
                        }}
                        renderItem={(item) => {
                            const isJustViewed = justViewedId === item.id;
                            return (
                                <View
                                    onClick={() => {
                                        const page = item.itemType === 'trip' ? 'trip' : 'guide';
                                        Taro.navigateTo({ url: `/pages/${page}/detail/index?id=${item.id}` });
                                    }}
                                    className="bg-white rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100 active:opacity-90"
                                >
                                    <View className="relative">
                                        <Image
                                            src={item.coverImage}
                                            mode="widthFix"
                                            className="w-full h-44 min-h-[160px] bg-gray-200"
                                        />
                                        {isJustViewed && (
                                            <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Text className="text-white text-xs bg-black/40 px-2 py-1 rounded-full">刚刚看过</Text>
                                            </View>
                                        )}
                                        {item.itemType === 'trip' && item.tripDays > 0 && (
                                            <View className="absolute bottom-2 left-2 bg-black/50 text-white text-[18px] px-2 py-0.5 rounded">
                                                {item.tripDays}天
                                            </View>
                                        )}
                                    </View>
                                    <View className="p-2.5">
                                        <Text className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                            {item.title || item.summary}
                                        </Text>
                                        <View className="flex items-center justify-between mt-2">
                                            <View className="flex items-center space-x-1.5">
                                                <Text className="text-[22px] text-gray-400 truncate max-w-[70px]">{item.destinations?.[0] || ''}</Text>
                                            </View>
                                            <View className="flex items-center space-x-0.5 text-gray-400">
                                                <Text>🤍</Text>
                                                <Text className="text-[18px]">{item.likeCount ?? 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
                ) : (
                    <ScrollLoadList
                        key={collectType}
                        request={(page, pageSize) =>
                            getUserFavorites({ id: userId, target_type: collectType, page, pageSize }).then((res: any) => ({
                                list: res?.list?.list || res?.list || [],
                                total: res?.list?.total || res?.total || 0,
                            }))
                        }
                        numColumns={2}
                        columnGap={8}
                        rowGap={8}
                        pageSize={10}
                        emptyText="暂无收藏"
                        scrollViewProps={{
                            className: 'px-2 pt-2 box-border',
                        }}
                        renderItem={(item) => (
                            <View
                                onClick={() => {
                                    const page = item.targetType === 'trip' ? 'trip' : 'guide';
                                    Taro.navigateTo({ url: `/pages/${page}/detail/index?id=${item.targetId}` });
                                }}
                                className="bg-white rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-100 active:opacity-90"
                            >
                                <View className="relative">
                                    <Image
                                        src={item.coverImage}
                                        mode="widthFix"
                                        className="w-full h-44 min-h-[160px] bg-gray-200"
                                    />
                                </View>
                                <View className="p-2.5">
                                    <Text className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                        {item.title}
                                    </Text>
                                    <View className="flex items-center justify-between mt-2">
                                        <Text className="text-[18px] text-gray-400">{formatTime(item.createdAt)}</Text>
                                        <Text className="text-[18px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                            {item.targetType === 'trip' ? '行程' : '攻略'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}