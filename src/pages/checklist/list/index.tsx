import React, { useRef } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getChecklists, deleteChecklist, updateChecklistItem, type Checklist } from '@/api/checklist';
import { ScrollLoadList } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';

export default function ChecklistPage() {
  const listRef = useRef<ScrollLoadListRef>(null);

  const refreshList = () => {
    listRef.current?.refresh();
  };

  // 跳转到新建/编辑页面
  const navToCreate = () => {
    Taro.navigateTo({
      url: '/pages/checklist/edit/index'
    });
  };

  // 触发删除模态框
  const handleDelete = (item: Checklist) => {
    Taro.showModal({
      title: '删除清单',
      content: `确定删除「${item.name}」吗？删除后不可恢复。`,
      confirmColor: '#10B981', // 完美同步鼠尾草绿
      success: async (res) => {
        if (res.confirm) {
          await deleteChecklist(item.id);
          refreshList();
        }
      },
    });
  };

  // 切换勾选状态
  const handleToggle = async (checklistItem: any) => {
    await updateChecklistItem(checklistItem.id, checklistItem.checked ? 0 : 1);
    refreshList();
  };

  // Bento Box / 大圆角卡片渲染
  const renderCard = (checklist: Checklist) => {
    const totalItems = checklist.items?.length || 0;
    const checkedItems = checklist.items?.filter(i => i.checked).length || 0;
    const isCompleted = totalItems > 0 && checkedItems === totalItems;

    return (
      <View className="bg-white rounded-3xl shadow-sm border border-stone-100/80 overflow-hidden mb-4 box-border transition-all duration-200 active:scale-[0.985] active:shadow-none">
        {/* 卡片头部区域 */}
        <View className="flex flex-row items-center justify-between px-5 pt-5 pb-2.5">
          <View className="flex-1 flex flex-row items-center min-w-0 mr-3">
            <Text className={`text-base font-bold tracking-wide truncate transition-colors ${isCompleted ? 'text-stone-400' : 'text-stone-800'}`}>
              {checklist.name}
            </Text>
            {checklist.items && (
              <Text className={`text-xs ml-2.5 px-2.5 py-0.5 rounded-full flex-shrink-0 font-medium transition-colors ${
                isCompleted ? 'bg-stone-100 text-stone-400' : 'bg-[#10B981]/10 text-[#10B981]'
              }`}>
                {checkedItems}/{totalItems}
              </Text>
            )}
          </View>
          {/* 更加精致温和的删除按钮 */}
          <View
            className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center active:bg-red-50 active:text-red-500 transition-colors flex-shrink-0 text-stone-400"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(checklist);
            }}
          >
            <Text className="text-xs font-sans">✕</Text>
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
                  className="flex flex-row items-center py-2.5 rounded-2xl -mx-1 px-1 active:bg-stone-50/60 transition-colors"
                  onClick={() => handleToggle(item)}
                >
                  {/* 沉浸式圆圈复选框 - 升级为鼠尾草绿 */}
                  <View
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      checked 
                        ? 'bg-[#10B981] border-[#10B981] scale-100 shadow-sm shadow-[#10B981]/20' 
                        : 'border-stone-200 bg-stone-50/30'
                    }`}
                  >
                    {checked && <Text className="text-white text-[10px] font-black leading-none">✓</Text>}
                  </View>
                  <Text
                    className={`ml-3.5 text-sm flex-1 tracking-wide transition-all duration-200 ${
                      checked ? 'text-stone-300 line-through' : 'text-stone-600 font-medium'
                    }`}
                  >
                    {item.text}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="px-5 pb-5 pt-2">
            <Text className="text-stone-300 text-xs italic tracking-wide block bg-stone-50/40 rounded-xl py-3 text-center">
              暂无备忘事项 🏕️
            </Text>
          </View>
        )}
      </View>
    );
  };

  // 页面顶部温和治愈的标题栏
  const renderHeader = () => (
    <View className="bg-[#FAFAF9] px-4 pb-4 pt-6">
      <Text className="text-2xl font-bold text-stone-800 tracking-tight">行前备忘</Text>
      <Text className="text-xs text-stone-400 mt-1 block tracking-wider">探索世界，从井井有条的清单开始</Text>
    </View>
  );

  return (
    <View className="min-h-screen bg-[#FAFAF9] relative w-full overflow-x-hidden box-border">
      {/* 瀑布式列表流 */}
      <ScrollLoadList
        ref={listRef}
        request={async (_page, _pageSize) => {
          const res = await getChecklists();
          // 优雅兼容标准返回格式格式和原始数组格式
          const list = (res as any)?.data || res;
          return { 
            list: Array.isArray(list) ? list : [], 
            total: list?.length || 0 
          };
        }}
        renderItem={renderCard}
        renderHeader={renderHeader}
        emptyText="暂无清单，点击下方开始创建 🌿"
        scrollViewProps={{ className: 'px-4 pb-28 w-full box-border' }}
      />

      {/* 底部悬浮行动按钮 (FAB) - 升级为大圆角自然质感 */}
      <View
        className="fixed bottom-8 right-6 z-50 flex flex-row items-center bg-[#10B981] pl-4 pr-5 py-3 rounded-full shadow-lg shadow-[#10B981]/20 active:scale-95 active:bg-[#0d9668] transition-all duration-150"
        onClick={navToCreate}
      >
        <Text className="text-white text-lg font-light mr-1.5 leading-none">＋</Text>
        <Text className="text-white text-sm font-medium tracking-wider">新建清单</Text>
      </View>
    </View>
  );
}