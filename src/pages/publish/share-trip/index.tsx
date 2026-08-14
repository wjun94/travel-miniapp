import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { useShareAppMessage } from '@tarojs/taro';
import { NavBar, ScrollLoadList, Image } from '@/components';
import { getMyTrips } from '@/api/trip';

// 从我的已发布行程中挑选一条，通过小程序分享卡片发送给好友
export default function ShareTripPage() {
  // 当前选中的行程（分享卡片内容基于它生成）
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // 分享好友：卡片跳转所选行程详情
  useShareAppMessage(() => {
    const t = selectedTrip;
    return {
      title: t ? `我的旅行计划｜${t.title || '精彩行程'}` : '分享我的旅行计划',
      path: t ? `/pages/trip/detail/index?id=${t.id}` : '/pages/home/index',
      imageUrl: t?.coverImage || undefined,
    };
  });

  const handleSelect = (item: any) => {
    setSelectedTrip((prev: any) => (prev?.id === item.id ? prev : item));
  };

  return (
    <View className="min-h-screen bg-gray-50 pb-28">
      <NavBar title="分享行程" showBack />
      <View className="px-4 pt-3">
        <ScrollLoadList
          pageSize={10}
          emptyText="还没有已发布的行程，先去发布一个吧"
          request={(page: number, pageSize: number) => getMyTrips(page, pageSize, 2)}
          keyExtractor={(item: any) => item.id}
          renderItem={(item: any) => {
            const active = selectedTrip?.id === item.id;
            const dayCount = Array.isArray(item.days) ? item.days.length : 0;
            return (
              <View
                className={`bg-white rounded-2xl p-3 mb-3 flex flex-row items-center shadow-sm border ${active ? 'border-green-500' : 'border-transparent'}`}
                onClick={() => handleSelect(item)}
              >
                {item.coverImage ? (
                  <Image src={item.coverImage} className="w-20 h-20 rounded-xl flex-shrink-0" mode="aspectFill" />
                ) : (
                  <View className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                    <View className="w-full h-full bg-[#ffedd5] flex items-center justify-center">
                      <Text className="text-stone-700 text-[26px] font-bold text-center break-all leading-[27px] block w-full overflow-hidden px-1">
                        {item.title || 'TRAVEL'}
                      </Text>
                    </View>
                  </View>
                )}
                <View className="flex-1 ml-3 flex flex-col overflow-hidden">
                  <Text className="text-sm font-bold text-gray-800 truncate">{item.title || '未命名行程'}</Text>
                  <Text className="text-xs text-gray-400 mt-1 truncate">
                    {(item.cities || []).join(' / ') || '未设置目的地'} · {dayCount > 0 ? `${dayCount} 天` : '行程待完善'}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: active ? '#22c55e' : '#9ca3af' }}>
                    {active ? '✓ 已选中，点击下方按钮分享' : '点击选择该行程'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* 底部固定分享按钮 */}
      <View className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 shadow-md">
        <Button
          openType="share"
          className="w-full py-3 text-sm font-medium bg-green-500 text-white rounded-full flex items-center justify-center m-0 active:opacity-90"
        >
          {selectedTrip ? `分享「${String(selectedTrip.title || '行程').slice(0, 10)}」给好友` : '分享行程给好友'}
        </Button>
        <Text className="block text-center text-xs text-gray-400 mt-2">
          仅展示已发布的行程，点击卡片选中后分享
        </Text>
      </View>
    </View>
  );
}
