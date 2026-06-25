import { View, Button } from '@tarojs/components';
import { useState } from 'react';
import { useRouter } from '@tarojs/taro';
import ScrollLoadList from '@/components/ScrollLoadList';
import { getAccounts, Accounting } from '@/api/accounting';
import { BottomSheet } from '@/components';

export default function AccountingList() {
  const { tripId } = useRouter().params;
  const [showAdd, setShowAdd] = useState(false);

  return (
    <View className="h-full">
      <ScrollLoadList<Accounting>
        request={() => getAccounts(Number(tripId)).then(res => ({ list: res, total: res.length }))}
        renderItem={(item) => (
          <View className="flex justify-between p-4 bg-white border-b">
            <View>{item.category}</View>
            <View>¥{item.amount}</View>
            <View className="text-xs text-gray-400">{item.note}</View>
          </View>
        )}
        emptyText="暂无记账"
      />
      <Button className="fixed bottom-0 w-full" onClick={() => setShowAdd(true)}>添加记账</Button>

      <BottomSheet visible={showAdd} title="记账" onClose={() => setShowAdd(false)}>
        {/* 添加记账表单，调用 addAccount 接口 */}
      </BottomSheet>
    </View>
  );
}