import { useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useUpdate } from 'ahooks';
import { getChecklists, deleteChecklist, updateChecklistItem, type Checklist } from '@/api/checklist';
import { ScrollLoadList, Checkbox, Modal } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';

// 关联类型名称与标签配色（行程/攻略/搭子）
const TARGET_TYPE_NAMES: Record<string, string> = { trip: '行程', guide: '攻略', partner: '搭子' };
const TARGET_TYPE_TAG: Record<string, string> = {
  trip: 'bg-blue-50 text-blue-500',
  guide: 'bg-emerald-50 text-emerald-600',
  partner: 'bg-orange-50 text-orange-500',
};

export default function ChecklistPage() {
  const listRef = useRef<ScrollLoadListRef>(null);
  const update = useUpdate();
  const [deleteTarget, setDeleteTarget] = useState<Checklist | null>(null);

  const refreshList = () => {
    listRef.current?.refresh();
  };

  useDidShow(refreshList);

  // 跳转到新建页面
  const navToCreate = () => {
    Taro.navigateTo({
      url: '/pages/checklist/edit/index'
    });
  };

  // 跳转到编辑页面
  const navToEdit = (checklist: Checklist) => {
    Taro.navigateTo({
      url: `/pages/checklist/edit/index?id=${checklist.id}`
    });
  };

  // 执行删除
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteChecklist(deleteTarget.id);
    setDeleteTarget(null);
    refreshList();
  };

  // 触发删除模态框
  const handleDelete = (item: Checklist) => {
    setDeleteTarget(item);
  };

  // 切换勾选状态 — 本地更新，不刷新列表接口
  const handleToggle = async (checklistItem: any) => {
    const target = checklistItem.checked ? 0 : 1
    await updateChecklistItem(checklistItem.id, target);
    checklistItem.checked = target;
    update();
  };

  // Bento Box / 大圆角卡片渲染
  const renderCard = (checklist: Checklist) => {
    const totalItems = checklist.items?.length || 0;
    const checkedItems = checklist.items?.filter(i => i.checked).length || 0;
    const isCompleted = totalItems > 0 && checkedItems === totalItems;

    return (
      <View className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(44,40,32,0.03)] border border-stone-100 overflow-hidden mb-4 box-border transition-all duration-300 ease-out active:scale-[0.99] active:shadow-none">
        {/* 卡片头部区域 */}
        <View className="flex flex-row items-start justify-between px-5 pt-5 pb-2">
          <View className="flex-1 min-w-0 mr-3">
            {/* 第一行：标题 + 进度徽章 */}
            <View className="flex flex-row items-center">
              <Text className={`text-[28px] font-bold tracking-wide truncate transition-colors duration-200 ${isCompleted ? 'text-stone-400' : 'text-stone-800'}`}>
                {checklist.name}
              </Text>
              {checklist.items && (
                <Text className={`text-[22px] ml-2.5 px-2 py-0.5 rounded-full flex-shrink-0 font-semibold transition-colors duration-200 tracking-wider ${isCompleted ? 'bg-stone-100 text-stone-400' : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}>
                  {checkedItems}/{totalItems}
                </Text>
              )}
            </View>
            {/* 第二行：关联类型 + 名称回显（行程/攻略/搭子） */}
            {checklist.targetName && (
              <View className="mt-2 flex flex-row items-center space-x-1.5">
                <Text className="text-22px text-blue-500 font-medium truncate max-w-[240px]">
                  {checklist.targetName}
                </Text>
                {checklist.targetType && (
                  <Text className={`text-20px px-1.5 py-0.5 rounded flex-shrink-0 font-semibold ${TARGET_TYPE_TAG[checklist.targetType] || 'bg-stone-100 text-stone-500'}`}>
                    {TARGET_TYPE_NAMES[checklist.targetType] || checklist.targetType}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* 操作按钮区域 */}
          <View className="flex flex-row items-center flex-shrink-0 space-x-4">
            {/* 编辑按钮 */}
            <View
              className="text-stone-500 flex flex-row items-center justify-center active:text-stone-700 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navToEdit(checklist);
              }}
            >
              <Text className='iconfont icon-edit mr-1' />
              <Text className="text-[28px]">编辑</Text>
            </View>

            {/* 精致温和的删除按钮 */}
            <View
              className="text-red-500 flex flex-row items-center justify-center active:text-red-600 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(checklist);
              }}
            >
              <Text className='iconfont icon-remove mr-1' />
              <Text className="text-[28px]">删除</Text>
            </View>
          </View>
        </View>

        {/* 清单子项列表 */}
        {checklist.items && checklist.items.length > 0 ? (
          <View className="px-5 pb-5 pt-1 space-y-0.5">
            {checklist.items.map((item) => {
              const checked = !!item.checked;
              return (
                <View
                  key={item.id}
                  className="flex flex-row items-center py-2.5 rounded-xl -mx-1.5 px-1.5 active:bg-stone-50/80 transition-colors duration-150"
                  onClick={() => handleToggle(item)}
                >
                  <Checkbox
                    checked={checked}
                    label={item.text}
                    labelClassName={`ml-3 flex-1 tracking-wide transition-all duration-200 ${checked ? 'text-stone-300 line-through font-normal' : 'text-stone-700 font-medium'}`}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View className="px-5 pb-5 pt-1">
            <Text className="text-stone-300 text-[24px] italic tracking-wide block bg-stone-50/40 rounded-xl py-3 text-center border border-dashed border-stone-100">
              暂无备忘事项 🏕️
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-[#FAFAF9] relative w-full overflow-x-hidden pt-4 box-border">
      {/* 瀑布式列表流 */}
      <ScrollLoadList
        ref={listRef}
        request={getChecklists}
        renderItem={renderCard}
        emptyText="暂无清单，点击下方开始创建 🌿"
        scrollViewProps={{ className: 'px-4 pb-28 w-full box-border' }}
      />

      {/* 底部全宽按钮 */}
      <View
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-row items-center justify-center bg-[#10B981] py-3 pb-safe active:bg-[#0d9668] transition-all duration-200 ease-out"
        onClick={navToCreate}
      >
        <Text className="text-white text-[30px] font-light mr-1.5 leading-none transform translate-y-[-1px]">＋</Text>
        <Text className="text-white font-semibold tracking-wider">新建清单</Text>
      </View>

      {/* 删除确认弹窗 */}
      <Modal
        visible={!!deleteTarget}
        title='删除清单'
        confirmText='删除'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      >
        <View className='py-2 text-center'>
          <Text className='text-gray-600 leading-relaxed'>
            确定删除「{deleteTarget?.name}」吗？删除后不可恢复。
          </Text>
        </View>
      </Modal>
    </View>
  );
}