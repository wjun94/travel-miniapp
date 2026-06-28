import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import { NavBar } from '@/components'

export default function DiscoverPage() {
  const [currentCate, setCurrentCate] = useState(1)

  // 1. 分类金刚区数据 (对应图标色系)
  const categories = [
    { id: 1, title: '推荐', icon: '🌲', bgColor: 'bg-[#EBF5F1]', textColor: 'text-[#3B8466]' },
    { id: 2, title: '徒步', icon: '🥾', bgColor: 'bg-[#F2F6F3]', textColor: 'text-[#617568]' },
    { id: 3, title: '露营', icon: '⛺', bgColor: 'bg-[#F5F6EE]', textColor: 'text-[#737A5C]' },
    { id: 4, title: '亲子', icon: '👶', bgColor: 'bg-[#FAF1EC]', textColor: 'text-[#A36D54]' },
    { id: 5, title: '自驾', icon: '🚗', bgColor: 'bg-[#FDF0F0]', textColor: 'text-[#AD6461]' },
  ]

  // 2. 周边推荐卡片数据 (完全还原UI图数据)
  const recommendList = [
    {
      id: 1,
      title: '大鹏半岛',
      location: '深圳 · 约1.5小时车程',
      tag: '海滩露营',
      distance: '35km',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      badgeDistance: '32km'
    },
    {
      id: 2,
      title: '七娘山徒步',
      location: '深圳 · 约2小时车程',
      tag: '荒野登山',
      distance: '45km',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
      badgeDistance: '45km'
    },
    {
      id: 3,
      title: '桔钓沙',
      location: '深圳 · 约1.8小时车程',
      tag: '蓝色玻璃海',
      distance: '38km',
      image: 'https://images.unsplash.com/photo-1540202404-b711e458319c?w=400&q=80',
      badgeDistance: '36km'
    },
    {
      id: 4,
      title: '梧桐山风景区',
      location: '深圳 · 约0.5小时车程',
      tag: '云海奇观',
      distance: '18km',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
      badgeDistance: '15km'
    }
  ]

  return (
    <View className="min-h-screen bg-[#FCFBF7] px-4 pb-10 font-sans">

      <NavBar title="📍 深圳" titleAlign="left" />

      {/* 搜索输入框 */}
      <View className="w-full flex flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100/60 mt-2">
        <Text className="text-gray-400 mr-2 text-sm">🔍</Text>
        <Input
          placeholder="搜索周边目的地 / 景点"
          placeholderClass="text-gray-300 text-xs"
          className="text-xs text-gray-700 flex-1"
        />
      </View>

      {/* 1. 发现周边 Banner 区域 */}
      <View className="relative w-full h-40 bg-gradient-to-br from-[#E2F4EC] via-[#D5F0E4] to-[#CBEBDD] rounded-3xl overflow-hidden my-4 shadow-sm">
        {/* 右侧渐隐的半透明大头针背景点缀 */}
        <View className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15">
          <Text className="text-7xl text-[#3B8466]">📍</Text>
        </View>

        {/* Banner 文本及按钮 */}
        <View className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 z-10">
          <Text className="text-2xl font-black text-[#1C3E2F] tracking-wide mb-1">发现周边好去处</Text>
          <Text className="text-xs text-[#5A7E6E] font-medium mb-4">周末去哪玩？附近有这些好地方</Text>
          <View className="flex flex-row">
            <View className="bg-[#3B8466] px-3 py-1.5 rounded-full shadow-sm flex flex-row items-center active:opacity-90">
              <Text className="text-[11px] font-bold text-white mr-1.5">重新定位</Text>
              <Text className="text-[9px] text-white">➔</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. 五列分类金刚区 */}
      <View className="grid grid-cols-5 gap-1 text-center my-6">
        {categories.map((item) => {
          const isActive = currentCate === item.id
          return (
            <View
              key={item.id}
              onClick={() => setCurrentCate(item.id)}
              className="flex flex-col items-center"
            >
              {/* 圆形图标圈，激活用专属浅绿背景，未激活用意境灰底 */}
              <View className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 transition-all ${isActive ? item.bgColor + ' shadow-sm' : 'bg-[#F6F6F2]'
                }`}>
                <Text className="text-lg opacity-90">{item.icon}</Text>
              </View>
              <Text className={`text-[12px] ${isActive ? item.textColor + ' font-bold' : 'text-gray-400 font-normal'}`}>
                {item.title}
              </Text>
            </View>
          )
        })}
      </View>

      {/* 3. 周边推荐主标题 */}
      <View className="flex flex-row justify-between items-center mt-6 mb-4 px-0.5">
        <Text className="text-base font-black text-gray-800 tracking-wide">周边推荐</Text>
        <View className="flex flex-row items-center active:opacity-70">
          <Text className="text-xs text-gray-400">更多</Text>
          <Text className="text-[10px] text-gray-400 ml-0.5">{'>'}</Text>
        </View>
      </View>

      {/* 4. 瀑布流双列网格 */}
      <View className="grid grid-cols-2 gap-3.5">
        {recommendList.map((card) => (
          <View key={card.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-50/40">

            {/* 卡片顶部图片及浮层覆盖物 */}
            <View className="w-full h-36 relative bg-gray-100">
              <Image src={card.image} mode="aspectFill" className="w-full h-full" />

              {/* 右上角心形收藏按钮 */}
              <View className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/15 backdrop-blur-xs flex items-center justify-center">
                <Text className="text-white text-xs">♡</Text>
              </View>

              {/* 右下角距离气泡 */}
              <View className="absolute bottom-2 right-2 bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-full flex flex-row items-center">
                <Text className="text-white text-[9px] font-medium tracking-wide">{card.badgeDistance}</Text>
              </View>
            </View>

            {/* 卡片文本描述区域 */}
            <View className="p-3 flex flex-col">
              <Text className="font-bold text-gray-800 text-[14px] leading-snug truncate">
                {card.title}
              </Text>
              <Text className="text-[10px] text-gray-400 mt-1 truncate">
                {card.location}
              </Text>

              {/* 底部标签和里程排版 */}
              <View className="flex flex-row items-center justify-between mt-3.5">
                {/* 推荐特色小标签 */}
                <View className="bg-[#F7F5F0] px-2 py-0.5 rounded-md flex items-center max-w-[65%]">
                  <Text className="text-[#9E9580] text-[10px] font-medium truncate">{card.tag}</Text>
                </View>

                {/* 底部红心加数值里程 */}
                <View className="flex flex-row items-center flex-shrink-0">
                  <Text className="text-[10px] text-red-400 font-medium mr-0.5">❤️</Text>
                  <Text className="text-[10px] text-gray-400 font-semibold">{card.distance}</Text>
                </View>
              </View>

            </View>
          </View>
        ))}
      </View>

    </View>
  )
}