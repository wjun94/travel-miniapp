import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface Props {
  title?: string;
  label: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  onPick: (res: { address: string; latitude: number; longitude: number }) => void;
}

export default function LocationPicker({ title = "位置", label, address, latitude, longitude, onPick }: Props) {
  const handlePick = async () => {
    try {
      const res = await Taro.chooseLocation({});
      // 兼容不同 Taro 版本返回结构
      const data = (res as any).data || res;
      const addr = data.name || data.address || '';
      const lat = data.latitude;
      const lng = data.longitude;
      if (addr || lat) {
        onPick({ address: addr, latitude: lat, longitude: lng });
      }
    } catch (err) {
      console.log('chooseLocation error:', err);
    }
  };

  return (
    <View className='box-border'>
      <Text className='text-gray-700 text-[26px] font-medium'>{title}<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
      <View onClick={handlePick} className='flex justify-between items-center p-2 bg-gray-50 rounded-xl min-h-[55px] active:bg-gray-100/80 transition-all box-border mt-1.5'>
        <View className='flex-1 pr-2'>
          <Text className='text-gray-700 block text-[26px] font-medium break-all'>{address || `点击选择${label}`}</Text>
          {latitude ? (
            <Text className='text-[20px] text-gray-400 block mt-0.5'>纬度: {latitude?.toFixed(4)}, 经度: {longitude?.toFixed(4)}</Text>
          ) : null}
        </View>
        <View className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[18px] flex-shrink-0 font-bold'>📍</View>
      </View>
    </View>
  );
}
