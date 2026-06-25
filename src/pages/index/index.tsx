import { View, Navigator } from '@tarojs/components';
import ScrollLoadList from '@/components/ScrollLoadList';
import { getFeed } from '@/api/post';
import Taro from '@tarojs/taro';

export default function Home() {
  // ScrollLoadList 要求的 request 签名: (page, pageSize) => Promise<{list, total}>
  return (
    <ScrollLoadList
      className="h-full bg-gray-100"
      request={getFeed}
      renderItem={(item) => (
        <View
          className="m-4 p-4 bg-white rounded-lg shadow-sm"
          onClick={() => Taro.navigateTo({ url: `/pages/post/detail?id=${item.id}` })}
        >
          <View className="text-base font-medium mb-2">{item.city}</View>
          <View className="text-sm text-gray-600">{JSON.parse(item.content).text}</View>
          {/* 如果有图片展示，可使用 Image 组件 */}
        </View>
      )}
      emptyText="还没有攻略，快去发布吧～"
      renderHeader={() => (
        <View className="m-4 p-4 bg-green-50 rounded-lg flex justify-between items-center">
          <View className="text-lg font-bold">寻找搭子</View>
          <Navigator url="/pages/partner/list" className="text-green-600">查看全部 ➜</Navigator>
        </View>
      )}
    />
  );
}