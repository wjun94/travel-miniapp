import { View, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { getNearby, getTopRecommend } from '@/api/nearby';
import ScrollLoadList from '@/components/ScrollLoadList';
import Image from '@/components/Image';  // 若无自定义则用 @tarojs/components 的 Image

export default function Nearby() {
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    Taro.getLocation({ type: 'gcj02' }).then(({ latitude, longitude }) => {
      setLoc({ lat: latitude, lng: longitude });
    });
  }, []);

  const { data: topData } = useRequest(() => getTopRecommend());
  const { data: nearbyData } = useRequest(
    () => (loc ? getNearby(loc.lat, loc.lng) : Promise.resolve([])),
    { refreshDeps: [loc] }
  );

  return (
    <View>
      {/* TOP推荐横向滚动 */}
      <View className="p-4">
        <View className="text-lg font-bold mb-2">本周 TOP 推荐</View>
        <ScrollView scrollX>
          {topData?.map((item: any) => (
            <View key={item.id} className="inline-block w-40 mr-3 bg-white rounded-lg shadow p-2">
              <Image src={item.cover} className="w-full h-24 rounded" mode="aspectFill" />
              <View className="text-sm mt-1">{item.title}</View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 周边列表使用 ScrollLoadList */}
      {loc && (
        <ScrollLoadList
          request={() => getNearby(loc.lat, loc.lng)} // 这里可能需适配分页
          renderItem={(poi) => (
            <View className="flex justify-between items-center p-4 bg-white border-b">
              <View>
                <View className="font-semibold">{poi.name}</View>
                <View className="text-gray-500 text-sm">{poi.address}</View>
              </View>
              <Button
                size="mini"
                onClick={() => Taro.openLocation({
                  latitude: parseFloat(poi.location.split(',')[0]),
                  longitude: parseFloat(poi.location.split(',')[1]),
                  name: poi.name,
                })}
              >
                导航
              </Button>
            </View>
          )}
          pageSize={20}
        />
      )}
    </View>
  );
}