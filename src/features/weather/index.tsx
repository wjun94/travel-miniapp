import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getQweather } from '@/api/common';
import { useRequest } from 'ahooks';

// 和风天气图标代码 → 天气图标映射
const iconMap: Record<string, string> = {
  '100': '☀️', '101': '🌤️', '102': '⛅', '103': '☁️', '104': '☁️',
  '150': '🌙', '151': '☁️', '152': '☁️', '153': '☁️',
  '300': '🌧️', '301': '🌦️', '302': '⛈️', '303': '🌧️', '304': '🌧️',
  '305': '🌦️', '306': '🌧️', '307': '🌧️', '308': '🌧️', '309': '🌦️',
  '310': '🌧️', '311': '🌧️', '312': '🌧️', '313': '🌧️',
  '314': '🌧️', '315': '🌧️', '316': '🌧️', '317': '🌧️', '318': '🌧️', '399': '🌧️',
  '400': '🌨️', '401': '❄️', '402': '❄️', '403': '❄️', '404': '🌨️',
  '405': '🌨️', '406': '🌨️', '407': '❄️', '408': '🌨️', '409': '❄️',
  '410': '❄️', '499': '❄️',
  '500': '🌫️', '501': '🌫️', '502': '🌫️', '503': '🌫️', '504': '🌫️',
  '507': '💨', '508': '💨', '509': '🌫️', '510': '🌫️',
  '511': '🌫️', '512': '🌫️', '513': '🌫️', '514': '🌫️', '515': '🌫️',
};

/** 获取日期对应的星期标签 */
const getDayLabel = (fxDate: string, index: number) => {
  if (index === 0) return '今天';
  if (index === 1) return '明天';
  if (index === 2) return '后天';
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekDays[new Date(fxDate).getDay()];
};

/** 格式化日期为 M/d */
const formatDate = (fxDate: string) => {
  const d = new Date(fxDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function WeatherWidget() {
  const destinationMeta = Taro.getStorageSync('TEMP_TRIP_DESTINATIONS') || {};
  const weatherCity = !destinationMeta.isOverseas && destinationMeta.cities?.length > 0
    ? destinationMeta.cities[0]
    : null;

  const { data: weatherData } = useRequest(
    () => getQweather({ city: weatherCity }),
    { ready: !!weatherCity }
  );

  if (!weatherCity || !weatherData?.daily?.length) return null;

  return (
    <View className='bg-[#fef1e3] rounded-2xl py-4 px-1px shadow-sm mx-4 my-4'>
      <View className="flex justify-between items-center mb-4 px-4">
        <Text className="text-base font-bold text-gray-800">{weatherCity} · 未来7天天气</Text>
      </View>
      <View className="w-full flex flex-row justify-between items-center">
        {weatherData.daily.map((item, index) => (
          <View
            key={item.fxDate}
            className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl ${index === 0 ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className="text-xs text-gray-500 mb-1">{getDayLabel(item.fxDate, index)}</Text>
            <Text className="text-[24px] text-gray-400 mb-2">{formatDate(item.fxDate)}</Text>
            <Text className="text-2xl my-1.5">{iconMap[item.iconDay] || '☁️'}</Text>
            <Text className="text-sm font-bold text-gray-800">{item.tempMax}°</Text>
            <Text className="text-[24px] text-gray-400 mt-1">{item.tempMin}°</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
