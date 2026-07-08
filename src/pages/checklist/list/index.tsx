import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRef } from 'react';
import { getChecklists, deleteChecklist, updateChecklistItem, type Checklist } from '@/api/checklist';
import { ScrollLoadList } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';

export default function ChecklistPage() {
  const listRef = useRef<ScrollLoadListRef>(null);

  const refreshList = () => {
    listRef.current?.refresh();
  };

  // 跳转到新建页面
  const navToCreate = () => {
    Taro.navigateTo({
      url: '/pages/checklist/edit/index' // 请根据你的实际路由调整
    });
  };

  const handleDelete = (item: Checklist) => {
    Taro.showModal({
      title: '删除清单',
      content: `确定删除「${item.name}」吗？删除后不可恢复。`,
      confirmColor: '#F97316', // 使用主题日落橙
      success: async (res) => {
        if (res.confirm) {
          await deleteChecklist(item.id);
          refreshList();
        }
      },
    });
  };

  const handleToggle = async (checklistItem: any) => {
    await updateChecklistItem(checklistItem.id, checklistItem.checked ? 0 : 1);
    refreshList(); // 建议：如果体验要求高，这里可以先局部修改 state，再静默同步后台
  };

  // Bento Box / 大圆角卡片渲染
  const renderCard = (checklist: Checklist) => (
    <View className='bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-4 box-border transition-all active:scale-[0.99]'>
      {/* 卡片头部 */}
      <View className='flex flex-row items-center justify-between px-4 pt-4 pb-2'>
        <View className='flex-1 flex flex-row items-center min-w-0 mr-2'>
          <Text className='text-base font-bold text-stone-900 truncate'>{checklist.name}</Text>
          {checklist.items && (
            <Text className='text-stone-400 text-xs ml-2 px-1.5 py-0.5 bg-stone-50 rounded-md flex-shrink-0'>
              {checklist.items.filter(i => i.checked).length}/{checklist.items.length}
            </Text>
          )}
        </View>
        <View
          className='w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center active:bg-stone-100 flex-shrink-0'
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(checklist);
          }}
        >
          <Text className='text-stone-400 text-xs'>🗑</Text>
        </View>
      </View>

      {/* 清单子项 */}
      {checklist.items && checklist.items.length > 0 ? (
        <View className='px-4 pb-4 pt-1'>
          {checklist.items.map((item) => {
            const checked = !!item.checked;
            return (
              <View
                key={item.id}
                className='flex flex-row items-center py-2.5 active:bg-stone-50/60 rounded-xl -mx-1 px-1 transition-colors'
                onClick={() => handleToggle(item)}
              >
                {/* 沉浸式圆圈复选框 */}
                <View
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${checked ? 'bg-[#F97316] border-[#F97316] scale-100' : 'border-stone-300 bg-white'
                    }`}
                >
                  {checked && <Text className='text-white text-xs font-bold leading-none'>✓</Text>}
                </View>
                <Text
                  className={`ml-3 text-sm flex-1 transition-all ${checked ? 'text-stone-400 line-through' : 'text-stone-700 font-medium'
                    }`}
                >
                  {item.text}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className='px-4 pb-4 pt-1'>
          <Text className='text-stone-300 text-xs italic'>暂无备忘事项</Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View className='bg-[#FAFAF9] px-4 pb-4 pt-4'>
      <Text className='text-2xl font-black text-stone-900 tracking-tight'>行前备忘</Text>
      <Text className='text-xs text-stone-400 mt-1 block'>探索世界，从井井有条的清单开始</Text>
    </View>
  );

  return (
    <View className='min-h-screen bg-[#FAFAF9] relative box-border'>
      {/* 列表流 */}
      <ScrollLoadList
        ref={listRef}
        request={async (_page, _pageSize) => {
          const list = await getChecklists();
          return { list, total: list.length };
        }}
        renderItem={renderCard}
        renderHeader={renderHeader}
        emptyText='暂无清单，点击下方开始创建'
        scrollViewProps={{ className: 'px-4 pb-24' }} // 留出底部悬浮按钮的距离
      />

      {/* 底部悬浮行动按钮 (FAB) */}
      <View
        className='fixed bottom-8 right-6 z-50 flex flex-row items-center bg-[#F97316] pl-4 pr-5 py-3 rounded-full shadow-lg shadow-orange-600/20 active:scale-95 active:opacity-90 transition-all'
        onClick={navToCreate}
      >
        <Text className='text-white text-lg font-bold mr-1.5 leading-none'>+</Text>
        <Text className='text-white text-sm font-semibold tracking-wide'>新建清单</Text>
      </View>
    </View>
  );
}