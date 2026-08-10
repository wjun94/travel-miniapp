import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import {
  NavBar,
  Avatar,
  ScrollLoadList,
  GuideCard,
  Image,
  Modal,
} from '@/components';
import CalendarSvg from '@/assets/img/calendar.svg';
import LocationsSvg from '@/assets/itinerary/locations.svg';
import TeamSvg from '@/assets/img/team.svg';
import { useRequest } from 'ahooks';
import { getProfile, getUserFeed, getUserFavorites } from '@/api/personal';
import { getMyJoinedPartners } from '@/api/partner';
import type { PartnerItem } from '@/api/partner';
import { followUser, unfollowUser, blockUser, unblockUser } from '@/api/follow';

// --- 搭子列表卡片（我的搭子/我参与的搭子共用） ---
const PARTNER_STATUS_LABELS: Record<number, { label: string; bg: string }> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90' },
  1: { label: '已满员', bg: 'bg-gray-500/80' },
  2: { label: '已解散', bg: 'bg-rose-500/80' },
  3: { label: '已结束', bg: 'bg-gray-500/80' },
  4: { label: '已结束', bg: 'bg-gray-500/80' },
};
const PARTNER_TYPE_LABELS: Record<number, string> = {
  0: '不限',
  1: '自由行',
  2: '跟团游',
  3: '自驾游',
};
const PARTNER_GENDER_LABELS: Record<number, string> = {
  0: '不限',
  1: '仅限男',
  2: '仅限女',
};

// 用户数据统计项（label 为展示文案，get 从 profile 取值）
const PROFILE_STATS: { label: string; get: (p: any) => number }[] = [
  { label: '关注', get: (p) => p?.followCount ?? 0 },
  { label: '粉丝', get: (p) => p?.followerCount ?? 0 },
  { label: '参与', get: (p) => p?.joinedPartnerCount ?? 0 },
  {
    label: '获赞与收藏',
    get: (p) => (p?.totalLikes ?? 0) + (p?.totalFavs ?? 0),
  },
];

// Tab 配置
const TABS = [
  { key: 'notes', label: '笔记' },
  { key: 'joined', label: '参与' },
  { key: 'collect', label: '收藏' },
] as const;

const formatPartnerDate = (dateStr: string) => {
  if (!dateStr) return '时间待定';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const formatPartnerShortDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}.${d.getDate()}`;
};

function PartnerCard({ item }: { item: PartnerItem }) {
  const statusInfo =
    PARTNER_STATUS_LABELS[item.status] || PARTNER_STATUS_LABELS[0];
  return (
    <View
      className="mx-3 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 active:scale-[0.99] transition-transform duration-150"
      onClick={() =>
        Taro.navigateTo({ url: `/pages/partner/detail/index?id=${item.id}` })
      }
    >
      {/* 封面图区域 */}
      <View className="relative h-44 bg-gray-900 overflow-hidden">
        {item.cover ? (
          <Image src={item.cover} mode="aspectFill" className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center px-3">
            <Text className="text-white/70 text-[30px] font-bold text-center line-clamp-2">
              {item.title || item.destination}
            </Text>
          </View>
        )}
        {/* 顶部状态 Badges */}
        <View className="absolute top-3 left-3 flex flex-row space-x-1.5 z-10">
          <View
            className={`${statusInfo.bg} text-white text-[20px] px-2.5 py-0.5 rounded-full font-medium shadow-sm`}
          >
            {statusInfo.label}
          </View>
          {item.category && (
            <View className="bg-white/80 text-orange-600 text-[20px] px-2.5 py-0.5 rounded-full font-medium">
              {item.category}
            </View>
          )}
          {item.type > 0 && (
            <View className="bg-black/40 text-white text-[20px] px-2.5 py-0.5 rounded-full font-light">
              {PARTNER_TYPE_LABELS[item.type]}
            </View>
          )}
        </View>
        {/* 浏览量 */}
        <View className="absolute bottom-3 right-3 bg-black/40 text-white text-[20px] px-2.5 py-0.5 rounded-full z-10 flex items-center">
          <Text className="iconfont icon-eye mr-1" />
          <Text className="text-22px">{item.viewCount ?? 0}</Text>
        </View>
        {/* 底部渐变 */}
        <View className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {item.destination && (
          <View className="absolute bottom-2.5 left-3 z-10 flex items-center">
            <Image src={LocationsSvg} className="h-3.5 w-3.5 mr-6px" />
            <Text className="text-white text-[22px] font-medium drop-shadow-sm">
              {item.destination}
            </Text>
          </View>
        )}
      </View>

      {/* 内容主体 */}
      <View className="p-3.5 space-y-2.5">
        <Text className="text-[28px] font-bold text-gray-800 leading-snug line-clamp-1 block">
          {item.title || item.destination}
        </Text>
        <View className="flex flex-row items-center justify-between pt-1 border-t border-gray-50">
          <View className="flex flex-row items-center space-x-2 text-gray-500 text-[24px]">
            <View className="flex items-center">
              <Image src={CalendarSvg} className="h-3.5 w-3.5 mr-6px" />
              <Text className="font-medium text-gray-700">
                {formatPartnerDate(item.startDate)}
                {item.endDate
                  ? ` - ${formatPartnerShortDate(item.endDate)}`
                  : ''}
              </Text>
            </View>
            {item.days > 0 && (
              <Text className="text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded text-[20px] font-medium">
                {item.days}天
              </Text>
            )}
          </View>
          <View className="flex items-center">
            <Image src={TeamSvg} className="h-4 w-4 mr-6px" />
            <Text className="text-[24px] font-medium text-gray-700">
              {item.currentMembers}/{item.maxMembers} 人
            </Text>
          </View>
        </View>
        {/* 性别/年龄/费用标签 */}
        <View className="flex flex-row items-center flex-wrap gap-1.5">
          {item.genderLimit > 0 && (
            <Text className="text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
              {PARTNER_GENDER_LABELS[item.genderLimit]}
            </Text>
          )}
          {(item.minAge ?? 0) > 0 || (item.maxAge ?? 0) > 0 ? (
            <Text className="text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
              {item.minAge || 0}-{item.maxAge || 99}岁
            </Text>
          ) : null}
          {item.feeMode > 0 && (
            <Text className="text-[20px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
              {item.feeMode === 1
                ? 'AA制'
                : item.feeMode === 2
                  ? '全包'
                  : '预算'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function PersonalPage() {
  const router = useRouter();
  const userId = router.params?.userId || '';
  const justViewedId = router.params?.id || '';

  const [activeTab, setActiveTab] = useState<'notes' | 'collect' | 'joined'>(
    'notes',
  );
  const [collectType, setCollectType] = useState<'guide' | 'trip'>('guide');
  const [unfollowVisible, setUnfollowVisible] = useState(false);

  // 获取用户信息（含关注状态）
  const { data: profile, mutate: setProfile } = useRequest(
    () => getProfile(userId),
    { refreshDeps: [userId] },
  );

  // 拉黑/解除拉黑（拉黑前弹窗确认）
  const handleToggleBlock = async () => {
    if (!profile) return;
    const blocked = profile.isBlocked;
    if (!blocked) {
      const res = await Taro.showModal({
        title: '拉黑用户',
        content: '拉黑后将无法看到对方的内容，并会自动取消关注，确定拉黑吗？',
        confirmText: '拉黑',
        confirmColor: '#EF4444',
      }).catch(() => ({ confirm: false as boolean }));
      if (!res.confirm) return;
      await blockUser(userId);
    } else {
      await unblockUser(userId);
    }
    setProfile((prev: any) =>
      prev
        ? {
            ...prev,
            isBlocked: !prev.isBlocked,
            isFollowed: blocked ? prev.isFollowed : false,
          }
        : prev,
    );
    Taro.showToast({
      title: blocked ? '已解除拉黑' : '已拉黑',
      icon: 'success',
    });
  };

  // 关注/取关（取关前弹窗确认）
  const handleToggleFollow = () => {
    if (!profile) return;
    if (profile.isFollowed) {
      setUnfollowVisible(true);
    } else {
      handleFollow();
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    await followUser(userId);
    setProfile((prev: any) => (prev ? { ...prev, isFollowed: true } : prev));
  };

  const handleConfirmUnfollow = async () => {
    if (!profile) return;
    setUnfollowVisible(false);
    await unfollowUser(userId);
    setProfile((prev: any) => (prev ? { ...prev, isFollowed: false } : prev));
    Taro.showToast({ title: '已取消关注', icon: 'success' });
  };

  return (
    <>
      <NavBar showBack backgroundColor="#1e293b" backColor="#fff" />
      <View className="min-h-screen bg-slate-800 text-white flex flex-col font-sans pb-10">
        {/* 2. 个人信息区域 */}
        <View className="px-5 pb-4 pt-2">
          <View className="flex items-center space-x-4">
            {/* 头像 */}
            <View className="relative">
              <Avatar
                name={profile?.nickname}
                src={profile?.avatarUrl || ''}
                className="w-20 h-20 rounded-full border-2 border-white object-cover text-50px"
              />
            </View>

            <View className="flex-1">
              <Text className="text-2xl font-bold tracking-wide">
                {profile?.nickname || ''}
              </Text>
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
                · {profile?.partnerCount ?? 0} 搭子
              </Text>
            </View>
          </View>

          {/* 数据统计 */}
          <View className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
            {PROFILE_STATS.map((stat) => (
              <View key={stat.label} className="flex flex-col items-center">
                <Text className="text-lg font-bold">
                  {stat.get(profile).toLocaleString()}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">{stat.label}</Text>
              </View>
            ))}
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
                <View
                  onClick={() =>
                    Taro.navigateTo({
                      url: `/pages/complaint/index/index?targetType=user&targetId=${userId}`,
                    })
                  }
                  className="flex-1 text-center py-2.5 rounded-full font-semibold text-sm bg-slate-700 text-white active:opacity-90 transition-opacity"
                >
                  投诉
                </View>
                <View
                  onClick={handleToggleBlock}
                  className={`flex-1 text-center py-2.5 rounded-full font-semibold text-sm active:opacity-90 transition-opacity ${profile?.isBlocked ? 'bg-slate-700 text-white' : 'bg-red-500/90 text-white'}`}
                >
                  {profile?.isBlocked ? '解除拉黑' : '拉黑'}
                </View>
              </>
            )}
          </View>
        </View>

        {/* 3. Tab 切换与卡片列表区 (白底) */}
        <View className="flex-1 bg-gray-50 rounded-t-2xl pt-2 mt-2 text-slate-800">
          {/* Tab 栏 */}
          <View className="flex justify-between items-center px-6 border-b border-gray-100">
            <View className="flex space-x-5 py-3">
              {TABS.map((tab) => (
                <View
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex flex-col items-center cursor-pointer"
                >
                  <Text
                    className={`text-base font-semibold transition-colors ${activeTab === tab.key ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {tab.label}
                  </Text>
                  {activeTab === tab.key && (
                    <View className="absolute -bottom-2 w-8 h-[3px] bg-[#F97316] rounded-full" />
                  )}
                </View>
              ))}
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
                getUserFeed({ id: userId, page, pageSize }).then(
                  (res: any) => ({
                    list: res?.list?.list || res?.list || [],
                    total: res?.list?.total || res?.total || 0,
                  }),
                )
              }
              numColumns={2}
              columnGap={8}
              rowGap={8}
              pageSize={10}
              emptyText="暂无笔记"
              scrollViewProps={{
                className: 'px-2 pt-2 box-border',
              }}
              renderItem={(item) => (
                <GuideCard item={item} justViewedId={justViewedId} />
              )}
            />
          ) : activeTab === 'collect' ? (
            <ScrollLoadList
              key={collectType}
              request={(page, pageSize) =>
                getUserFavorites({
                  id: userId,
                  target_type: collectType,
                  page,
                  pageSize,
                }).then((res: any) => ({
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
              renderItem={(item) => <GuideCard item={item} />}
            />
          ) : (
            <ScrollLoadList
              key="joined"
              request={(page, pageSize) =>
                getMyJoinedPartners({ page, pageSize }).then((res: any) => ({
                  list: res?.list || [],
                  total: res?.total || 0,
                }))
              }
              pageSize={10}
              emptyText="暂无参与"
              scrollViewProps={{ className: 'pt-1 pb-6 box-border' }}
              renderItem={(item) => <PartnerCard item={item} />}
            />
          )}
        </View>
      </View>

      {/* 取消关注确认弹窗 */}
      <Modal
        visible={unfollowVisible}
        title="取消关注"
        confirmText="确定"
        cancelText="再想想"
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setUnfollowVisible(false)}
        onMaskClick={() => setUnfollowVisible(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            确定不再关注「{profile?.nickname || '该用户'}」吗？
          </Text>
        </View>
      </Modal>
    </>
  );
}
