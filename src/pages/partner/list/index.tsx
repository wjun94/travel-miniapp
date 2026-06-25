import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ScrollLoadList from '@/components/ScrollLoadList';
import { getPartnerList } from '@/api/partner';

export default function PartnerList() {
  return (
    <ScrollLoadList
      request={getPartnerList}
      renderItem={(item) => (
        <View
          className="m-4 p-4 bg-white rounded-lg shadow"
          onClick={() => Taro.navigateTo({ url: `/pages/partner/detail?id=${item.id}` })}
        >
          <View className="text-base font-semibold">{item.destination}</View>
          <View className="text-sm text-gray-500">
            {item.startDate} | {item.days}天 | {item.currentMembers}/{item.maxMembers}人
          </View>
          {item.type === 1 && <View className="text-green-600 text-xs">官方</View>}
        </View>
      )}
      emptyText="暂无搭子信息"
    />
  );
}