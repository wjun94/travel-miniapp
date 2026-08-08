import { useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getFavorites, deleteFavorite, type FavoriteItem } from '@/api/favorite';
import { ScrollLoadList, Modal, Image } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';

// 目标类型展示映射
const targetTypeLabel: Record<string, string> = {
  guide: '攻略',
  trip: '行程',
  checklist: '清单',
  partner: '搭子',
};

// 收藏类型筛选 Tab（'' 表示全部）
const TYPE_TABS = [
  { key: '', label: '全部' },
  { key: 'guide', label: '攻略' },
  { key: 'trip', label: '行程' },
  { key: 'partner', label: '搭子' },
];

export default function FavoritePage() {
  const listRef = useRef<ScrollLoadListRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<FavoriteItem | null>(null);
  const [activeType, setActiveType] = useState('');

  // 删除单条收藏
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFavorite(deleteTarget.targetId, deleteTarget.targetType);
      Taro.showToast({ title: '已取消收藏', icon: 'success' });
    } catch {
      // 兜底
    }
    setDeleteTarget(null);
    listRef.current?.refresh();
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diffDays === 1) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diffDays < 7) {
      return `${diffDays}天前`;
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 根据 targetType 跳转到对应详情页
  const navToDetail = (item: FavoriteItem) => {
    const routeMap: Record<string, string> = {
      guide: '/pages/guide/detail/index',
      trip: '/pages/trip/detail/index',
      checklist: '/pages/checklist/list/index',
      partner: '/pages/partner/detail/index',
    };
    const path = routeMap[item.targetType];
    if (path) {
      Taro.navigateTo({ url: `${path}?id=${item.targetId}` });
    }
  };

  // Bento Box 风格卡片
  const renderCard = (item: FavoriteItem) => (
    <View
      className="bg-white rounded-3xl p-3 border border-stone-100 shadow-sm flex items-center space-x-3 mb-4 box-border active:opacity-80 transition-opacity"
      onClick={() => navToDetail(item)}
    >
      <Image
        src={item.coverImage || ''}
        className="w-16 h-16 rounded-2xl bg-stone-100 shrink-0"
      />

      {/* 内容展示区 */}
      <View className="flex-1 min-w-0">
        <Text className="text-stone-800 font-bold block truncate mb-4">
          {item.title || '未命名'}
        </Text>
        <View className="flex flex-row items-center gap-2">
          <Text className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md font-medium text-[22px] shrink-0">
            {targetTypeLabel[item.targetType] || item.targetType}
          </Text>
          <Text className="text-stone-300 text-[24px]">|</Text>
          <Text className="text-stone-400 text-[22px] truncate">
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* 删除按钮 */}
      <View
        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 active:bg-red-100"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteTarget(item);
        }}
      >
        <Text className="iconfont icon-remove text-[24px] text-stone-500" />
      </View>
    </View>
  );

  return (
    <View className="min-h-screen bg-[#FAFAF9] font-sans box-border">
      {/* 类型筛选 Tab（切换自动刷新列表） */}
      <View className="sticky top-0 z-10 bg-[#FAFAF9] px-4 pt-3 pb-2 flex flex-row items-center gap-2">
        {TYPE_TABS.map((tab) => (
          <Text
            key={tab.key || 'all'}
            onClick={() => setActiveType(tab.key)}
            className={`px-4 py-1 rounded-full text-[22px] font-medium ${activeType === tab.key ? 'bg-[#F97316] text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      <ScrollLoadList
        ref={listRef}
        request={(page, pageSize) => getFavorites({ page, pageSize, target_type: activeType || undefined })}
        params={{ target_type: activeType }}
        renderItem={renderCard}
        emptyText={activeType === 'partner' ? '还没有收藏的搭子' : '还没有收藏任何内容 🏕️'}
        scrollViewProps={{ className: 'px-4 pb-28 w-full box-border' }}
      />

      {/* 取消收藏确认弹窗 */}
      <Modal
        visible={!!deleteTarget}
        title="取消收藏"
        confirmText="确定"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            确定取消收藏「{deleteTarget?.title}」吗？
          </Text>
        </View>
      </Modal>
    </View>
  );
}