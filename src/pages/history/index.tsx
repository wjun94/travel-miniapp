import { useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getHistoryList, clearAllHistory, deleteHistoryRecord, type HistoryRecord } from '@/api/history';
import { ScrollLoadList, Modal, Image } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';
import { formatTime } from '@/utils'

// 目标类型展示映射
const targetTypeLabel: Record<string, string> = {
  guide: '攻略',
  trip: '行程',
  checklist: '清单',
  partner: '搭子',
};

export default function BrowseHistoryPage() {
  const listRef = useRef<ScrollLoadListRef>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryRecord | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // 删除单条
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHistoryRecord(deleteTarget.id);
      Taro.showToast({ title: '已删除', icon: 'success' });
    } catch {
      // 兜底
    }
    setDeleteTarget(null);
    listRef.current?.refresh();
  };

  // 清空全部
  const handleClearAllConfirm = async () => {
    try {
      await clearAllHistory();
      Taro.showToast({ title: '已全部清空', icon: 'none' });
    } catch {
      // 兜底
    }
    setShowClearModal(false);
    listRef.current?.refresh();
  };

  // 根据 targetType 跳转到对应详情页
  const navToDetail = (item: HistoryRecord) => {
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
  const renderCard = (item: HistoryRecord) => (
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
          {item.title}
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
      {/* 系统消息：顶部清空入口 */}
      <View className='flex flex-row items-center justify-end px-4 py-2 bg-white bb'>
        <Text
          className='text-[24px] text-gray-500 px-3 py-1 rounded-full bg-gray-100 active:bg-gray-200'
          onClick={() => setShowClearModal(true)}
        >
          清空全部
        </Text>
      </View>
      <ScrollLoadList
        ref={listRef}
        request={getHistoryList}
        renderItem={renderCard}
        emptyText="还没有留下任何探索足迹 🏕️"
        scrollViewProps={{ className: 'px-4 pb-28 w-full box-border' }}
      />

      {/* 删除确认弹窗 */}
      <Modal
        visible={!!deleteTarget}
        title="删除足迹"
        confirmText="删除"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            确定删除「{deleteTarget?.title}」吗？
          </Text>
        </View>
      </Modal>

      {/* 清空全部弹窗 */}
      <Modal
        visible={showClearModal}
        title="清空足迹"
        confirmText="清空"
        onConfirm={handleClearAllConfirm}
        onCancel={() => setShowClearModal(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            确定要抹去所有探索过的痕迹吗？
          </Text>
        </View>
      </Modal>
    </View>
  );
}
