import { View, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuthStore } from '@/store/authStore';
import { useRequest } from 'ahooks';
import { getFootprints } from '@/api/footprint';
import Image from '@/components/Image';

export default function Mine() {
  const { userInfo, logout } = useAuthStore();
  const { data: footprints } = useRequest(getFootprints);

  return (
    <View className="p-4">
      <View className="flex items-center mb-4">
        <Image src={userInfo?.avatarUrl || ''} className="w-16 h-16 rounded-full" />
        <View className="ml-4">
          <View className="text-lg font-bold">{userInfo?.nickname}</View>
        </View>
      </View>

      <View className="grid grid-cols-2 gap-4 mb-4">
        <View
          className="bg-white p-4 rounded shadow text-center"
          onClick={() => Taro.navigateTo({ url: '/pages/accounting/list' })}
        >
          记账本
        </View>
        <View
          className="bg-white p-4 rounded shadow text-center"
          onClick={() => Taro.navigateTo({ url: '/pages/checklist/index' })}
        >
          备忘清单
        </View>
      </View>

      <View className="mb-4">
        <View className="text-lg font-bold mb-2">我的足迹</View>
        {footprints?.length ? (
          <View>已点亮 {footprints.length} 个城市</View>
        ) : (
          <View>暂无足迹</View>
        )}
        <Button size="mini" onClick={() => Taro.navigateTo({ url: '/pages/footprint/index' })}>
          查看足迹地图
        </Button>
      </View>

      <Button onClick={logout}>退出登录</Button>
    </View>
  );
}