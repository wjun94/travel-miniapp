import { View } from '@tarojs/components';
import { getMessageList } from '@/api/message';
import ScrollLoadList from '@/components/ScrollLoadList';

export default function Message() {

  return (
    <ScrollLoadList
      request={getMessageList} // 待实现
      renderItem={(item) => <View className="p-4">{item.content}</View>}
      emptyText="暂无消息"
    />
  );
}