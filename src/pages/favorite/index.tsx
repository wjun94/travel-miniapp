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
};

export default function FavoritePage() {
  const listRef = useRef<ScrollLoadListRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<FavoriteItem | null>(null);

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
      {/* 封面图 */}
      {item.coverImage ? (
        <Image
          src={item.coverImage}
          className="w-16 h-16 rounded-2xl bg-stone-100 shrink-0"
        />
      ) : (
        <View className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
          <Text className="iconfont icon-tab_my text-[28px] text-[#10B981]" />
        </View>
      )}

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

  // 顶部 Header
  const renderHeader = () => (
    <View className="flex justify-between items-end px-6 pt-8 pb-4 bg-[#FAFAF9]">
      <View>
        <Text className="text-[36px] font-bold text-stone-800 tracking-wide block">我的收藏</Text>
        <Text className="text-[24px] text-stone-400 mt-1 block">收藏你喜欢的攻略和行程</Text>
      </View>
    </View>
  );

  return (
    <View className="min-h-screen bg-[#FAFAF9] font-sans box-border">
      <ScrollLoadList
        ref={listRef}
        request={(page, pageSize) => getFavorites({ page, pageSize })}
        renderItem={renderCard}
        renderHeader={renderHeader}
        emptyText="还没有收藏任何内容 🏕️"
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