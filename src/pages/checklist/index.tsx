import { View, Checkbox } from '@tarojs/components';
import { useRequest } from 'ahooks';
import { getChecklists, updateChecklistItem, Checklist, ChecklistItem } from '@/api/checklist';
import ScrollLoadList from '@/components/ScrollLoadList';

export default function ChecklistPage() {
  const { data, run } = useRequest(getChecklists);

  const handleToggle = async (item: ChecklistItem) => {
    await updateChecklistItem(item.id, item.checked ? 0 : 1);
    run();
  };

  return (
    <View className="h-full">
      <ScrollLoadList
        request={async () => ({ list: await getChecklists(), total: 0 })}
        renderItem={(list) => (
          <View className="p-4 bg-white mb-2">
            <View className="font-bold mb-2">{list.name}</View>
            {list.items?.map(item => (
              <View key={item.id} className="flex items-center py-1">
                <Checkbox checked={!!item.checked} value={item.id} onChange={() => handleToggle(item)} />
                <View className="ml-2">{item.text}</View>
              </View>
            ))}
          </View>
        )}
        emptyText="暂无清单"
      />
    </View>
  );
}