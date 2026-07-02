import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface Props {
  label: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  onPick: (res: { address: string; latitude: number; longitude: number }) => void;
}

export default function LocationPicker({ label, address, latitude, longitude, onPick }: Props) {
  const handlePick = async () => {
    try {
      const res = await Taro.chooseLocation({});
      onPick({ address: res.address || res.name, latitude: res.latitude, longitude: res.longitude });
    } catch (_) {}
  };

  return (
    <View className='space-y-1.5 box-border'>
      <Text className='text-gray-700 text-[26px] font-medium'>位置<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
      <View onClick={handlePick} className='flex justify-between items-center p-3 bg-gray-50 rounded-xl min-h-[55px] active:bg-gray-100/80 transition-all box-border'>
        <View className='flex-1 pr-2 truncate'>
          <Text className='text-gray-700 block truncate text-[26px] font-medium'>{address || `点击选择${label}`}</Text>
          {latitude ? (
            <Text className='text-[20px] text-gray-400 block mt-0.5'>纬度: {latitude?.toFixed(4)}, 经度: {longitude?.toFixed(4)}</Text>
          ) : null}
        </View>
        <View className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[18px] flex-shrink-0 font-bold'>📍</View>
      </View>
    </View>
  );
}
