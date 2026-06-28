import { View, Text, Image, ScrollView } from '@tarojs/components'
import { NavBar } from '@/components'

export default function PublishPage() {
  // 模拟数据 (建议在实际项目中从 API 获取)
  const features = [
    { id: 1, title: '图文攻略', desc: '分享你的旅行经验', icon: '📝', bg: 'bg-orange-50', color: 'bg-orange-200', textColor: 'text-orange-500' },
    { id: 2, title: '视频攻略', desc: '记录旅行精彩瞬间', icon: '🎥', bg: 'bg-red-50', color: 'bg-red-200', textColor: 'text-red-500' },
    { id: 3, title: '行程规划', desc: 'AI/手动创建行程', icon: '🧭', bg: 'bg-green-50', color: 'bg-green-200', textColor: 'text-green-500' },
    { id: 4, title: '分享行程', desc: '邀请他人共同编辑', icon: '🔗', bg: 'bg-blue-50', color: 'bg-blue-200', textColor: 'text-blue-500' },
  ]

  const weatherList = [
    { day: '今天', date: '5/24', icon: '☀️', temp: '22°', minTemp: '8°' },
    { day: '明天', date: '5/25', icon: '🌧️', temp: '23°', minTemp: '9°' },
    { day: '周一', date: '5/26', icon: '⛅', temp: '24°', minTemp: '19°' },
    { day: '周二', date: '5/27', icon: '🌧️', temp: '20°', minTemp: '9°' },
    { day: '周三', date: '5/28', icon: '🌧️', temp: '19°', minTemp: '8°' },
    { day: '周四', date: '5/29', icon: '🌧️', temp: '21°', minTemp: '8°' },
    { day: '周五', date: '5/30', icon: '🌧️', temp: '22°', minTemp: '8°' },
  ]

  const destinationList = [
    { name: '大理', image: 'https://images.unsplash.com/photo-1590076215667-875d4efdb625?w=300&q=80' },
    { name: '成都', image: 'https://images.unsplash.com/photo-1587474498305-674b62dbd613?w=300&q=80' },
    { name: '三亚', image: 'https://images.unsplash.com/photo-1540202404-b711e458319c?w=300&q=80' },
    { name: '西藏', image: 'https://images.unsplash.com/photo-1525049386811-933e144a169b?w=300&q=80' },
  ]
  return (
    <View className="min-h-screen px-4 font-sans">

      <NavBar />

      {/*  功能区（2x2 网格） - 使用 Grid */}
      <View className="grid grid-cols-2 gap-3 mb-5 mt-2">
        {features.map(item => (
          <View
            key={item.id}
            className={`${item.bg} rounded-2xl p-4 flex flex-row items-center shadow-sm`}
          >
            {/* 图标区 */}
            <View className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${item.color} ${item.textColor} mr-3`}>
              <Text className="text-lg">{item.icon}</Text>
            </View>
            {/* 文字区 */}
            <View className="flex flex-col justify-center overflow-hidden">
              <Text className="font-bold text-gray-800 truncate">{item.title}</Text>
              <Text className="text-[22px] text-gray-400 mt-1 truncate">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 天气预报模块 */}
      <View className="bg-[#fef1e3] rounded-2xl py-4 px-1px shadow-sm mb-6">
        <View className="flex justify-between items-center mb-4 px-4">
          <Text className="text-base font-bold text-gray-800">丽江 · 未来7天天气</Text>
          <Text className="text-xs text-gray-400">更多 {'>'}</Text>
        </View>

        <View className="w-full flex flex-row justify-between items-center">
          {weatherList.map((item, index) => (
            <View
              key={index}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl ${index === 0 ? 'bg-white shadow-sm' : ''
                }`}
            >
              <Text className="text-xs text-gray-500 mb-1">{item.day}</Text>
              <Text className="text-[24px] text-gray-400 mb-2">{item.date}</Text>
              <Text className="text-2xl my-1.5">{item.icon}</Text>
              <Text className="text-sm font-bold text-gray-800">{item.temp}</Text>
              <Text className="text-[24px] text-gray-400 mt-1">{item.minTemp}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 热门目的地模块 */}
      <View className="mb-8">
        <View className="flex justify-between items-center mb-4 px-1">
          <Text className="text-base font-bold text-gray-800">热门目的地</Text>
          <Text className="text-xs text-gray-400">更多 {'>'}</Text>
        </View>

        <ScrollView scrollX className="w-full whitespace-nowrap" showScrollbar={false}>
          {destinationList.map((dest, index) => (
            <View key={index} className="inline-block mr-3 last:mr-0 relative w-24 h-32 rounded-xl overflow-hidden shadow-sm">
              <Image src={dest.image} mode="aspectFill" className="w-full h-full absolute inset-0" />
              <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></View>
              <Text className="absolute bottom-2 left-0 w-full text-center text-white text-sm font-medium tracking-wider">
                {dest.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

    </View>
  )
}