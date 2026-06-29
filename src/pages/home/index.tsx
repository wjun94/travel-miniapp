import { useState } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import { getHeaderHeight } from '@/utils'
import { NavBar } from '@/components'

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0)
  const headerHeight = getHeaderHeight()

  // 标签分类
  const tabs = ['推荐', '热门', '最新', '国内', '国外', '小众']

  // 瀑布流卡片模拟数据（完全还原UI图内容）
  const cardList = [
    {
      id: 1,
      title: '大理 3天2晚',
      desc: '超详细攻略',
      image: 'https://images.unsplash.com/photo-1590076215667-875d4efdb625?w=400&q=80',
      author: '小小旅行家',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      likes: 328
    },
    {
      id: 2,
      title: '川西小环线',
      desc: '自驾全攻略',
      image: 'https://images.unsplash.com/photo-1525049386811-933e144a169b?w=400&q=80',
      author: '阿乐在路上',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      likes: 862
    },
    {
      id: 3,
      title: '厦门 | 海边慢生活',
      desc: '吹吹海风发发呆',
      image: 'https://images.unsplash.com/photo-1540202404-b711e458319c?w=400&q=80',
      author: '鹭岛慢行',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      likes: 521
    },
    {
      id: 4,
      title: '长沙 | 本地人推荐',
      desc: '吃喝玩乐不踩雷',
      image: 'https://images.unsplash.com/photo-1587474498305-674b62dbd613?w=400&q=80',
      author: '辣妹子吃长沙',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      likes: 943
    },
    {
      id: 5,
      title: '大理 3天2晚',
      desc: '超详细攻略',
      image: 'https://images.unsplash.com/photo-1590076215667-875d4efdb625?w=400&q=80',
      author: '小小旅行家',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      likes: 328
    },
    {
      id: 6,
      title: '川西小环线',
      desc: '自驾全攻略',
      image: 'https://images.unsplash.com/photo-1525049386811-933e144a169b?w=400&q=80',
      author: '阿乐在路上',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      likes: 862
    },
    {
      id: 7,
      title: '厦门 | 海边慢生活',
      desc: '吹吹海风发发呆',
      image: 'https://images.unsplash.com/photo-1540202404-b711e458319c?w=400&q=80',
      author: '鹭岛慢行',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      likes: 521
    },
    {
      id: 8,
      title: '长沙 | 本地人推荐',
      desc: '吃喝玩乐不踩雷',
      image: 'https://images.unsplash.com/photo-1587474498305-674b62dbd613?w=400&q=80',
      author: '辣妹子吃长沙',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      likes: 943
    }
  ]

  return (
    <View className="min-h-screen bg-[#FCFBF7] px-4 pb-10 font-sans">

      <NavBar />

      {/* 1. 顶部搜索栏 */}
      <View className="flex flex-row items-center justify-between my-3">
        <View className="flex-1 flex flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
          <Text className="text-gray-400 mr-2 text-base">🔍</Text>
          <Input
            placeholder="搜索目的地 / 攻略 / 用户"
            placeholderClass="text-gray-300 text-sm"
            className="text-sm text-gray-700 flex-1"
          />
        </View>
      </View>

      {/* 2. “寻找搭子” Banner 区域 */}
      <View className="relative w-full h-44 rounded-3xl overflow-hidden my-4 shadow-md">
        {/* 背景图 + 温暖落日渐变层 */}
        <Image
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80"
          mode="aspectFill"
          className="w-full h-full absolute inset-0"
        />
        <View className="absolute inset-0 bg-gradient-to-r from-[#e97442]/90 via-[#f09366]/70 to-transparent"></View>

        {/* Banner 内容 */}
        <View className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 z-10">
          <Text className="text-3xl font-extrabold text-white tracking-wider mb-1">寻找搭子</Text>
          <Text className="text-[22px] text-white/90 font-light mb-5">一个人旅行太无聊？找个搭子一起出发吧！</Text>
          <View className="flex flex-row">
            <View className="bg-white px-4 py-1.5 rounded-full shadow-sm flex flex-row items-center active:opacity-80">
              <Text className="text-[20px] font-bold text-[#e97442] mr-1">去看看</Text>
              <Text className="text-[14px] text-[#e97442]">➔</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Tab 导航栏 */}
      <View className="flex flex-row items-center justify-between sticky z-10 bg-[#FCFBF7] py-3" style={{ top: headerHeight }}>
        <ScrollView scrollX showScrollbar={false} className="flex-1 whitespace-nowrap pr-2">
          {tabs.map((tab, index) => {
            const isActive = currentTab === index
            return (
              <View
                key={index}
                onClick={() => setCurrentTab(index)}
                className="inline-flex flex-col items-center mr-6 last:mr-0 relative py-1"
              >
                <Text className={`text-base tracking-wide transition-all ${isActive ? 'font-bold text-gray-900 text-[34px]' : 'text-gray-400'}`}>
                  {tab}
                </Text>
                {/* 活跃状态的小橙线 */}
                {isActive && (
                  <View className="absolute w-5 h-[6px] bg-[#e97442] rounded-full -bottom-[10px]" />
                )}
              </View>
            )
          })}
        </ScrollView>
        {/* 最右侧网格矩阵图标 */}
        <View className="pl-2 border-l border-gray-200 flex items-center justify-center">
          <Text className="text-lg text-gray-400 font-bold">⊞</Text>
        </View>
      </View>

      {/* 4. 双列网格瀑布流 */}
      <View className="grid grid-cols-2 gap-3.5">
        {cardList.map((card) => (
          <View key={card.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-50/50">
            {/* 卡片封面图 */}
            <View className="w-full h-40 relative bg-gray-100">
              <Image src={card.image} mode="aspectFill" className="w-full h-full" />
            </View>

            {/* 卡片文字及底部信息 */}
            <View className="p-3 flex flex-col">
              <Text className="font-bold text-gray-800 leading-tight truncate">{card.title}</Text>
              <Text className="text-[26px] text-gray-400 mt-1 truncate">{card.desc}</Text>

              {/* 底部作者与点赞 */}
              <View className="flex flex-row items-center justify-between mt-2">
                {/* 作者头像名字 */}
                <View className="flex flex-row items-center flex-1 min-w-0 mr-2">
                  <Image src={card.avatar} className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
                  <Text className="text-[26px] text-gray-500 ml-1.5 truncate flex-1">{card.author}</Text>
                </View>
                {/* 点赞数量 */}
                <View className="flex flex-row items-center flex-shrink-0">
                  <Text className="text-base text-red-400 mr-0.5">♥</Text>
                  <Text className="text-[26px] text-gray-400 font-medium">{card.likes}</Text>
                </View>
              </View>

            </View>
          </View>
        ))}
      </View>

    </View>
  )
}