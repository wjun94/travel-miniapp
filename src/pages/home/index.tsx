import { useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import { getHeaderHeight } from '@/utils'
import { NavBar, ScrollLoadList } from '@/components'
import { getGuides } from '@/api/post'
import type { Guide } from '@/api/post'

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0)
  const headerHeight = getHeaderHeight()

  const tabs = ['推荐', '热门', '最新', '国内', '国外', '小众']

  const renderHeader = useCallback(() => (
    <>
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

      {/* 2. "寻找搭子" Banner 区域 */}
      <View className="relative w-full h-44 rounded-3xl overflow-hidden my-4 shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80"
          mode="aspectFill"
          className="w-full h-full absolute inset-0"
        />
        <View className="absolute inset-0 bg-gradient-to-r from-[#e97442]/90 via-[#f09366]/70 to-transparent"></View>

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
                {isActive && (
                  <View className="absolute w-5 h-[6px] bg-[#e97442] rounded-full -bottom-[10px]" />
                )}
              </View>
            )
          })}
        </ScrollView>
        <View className="pl-2 border-l border-gray-200 flex items-center justify-center">
          <Text className="text-lg text-gray-400 font-bold">⊞</Text>
        </View>
      </View>
    </>
  ), [headerHeight, tabs, currentTab])

  const renderCard = useCallback((item: Guide) => (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-50/50">
      <View className="w-full h-40 relative bg-gray-100">
        <Image src={item.coverImage} mode="aspectFill" className="w-full h-full" />
      </View>

      <View className="p-3 flex flex-col">
        <Text className="font-bold text-gray-800 leading-tight truncate">{item.title}</Text>
        <Text className="text-[26px] text-gray-400 mt-1 truncate">{item.summary}</Text>

        <View className="flex flex-row items-center justify-between mt-2">
          <View className="flex flex-row items-center flex-1 min-w-0 mr-2">
            <Image src={item.authorAvatar} className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
            <Text className="text-[26px] text-gray-500 ml-1.5 truncate flex-1">{item.authorName}</Text>
          </View>
          <View className="flex flex-row items-center flex-shrink-0">
            <Text className="text-base text-red-400 mr-0.5">♥</Text>
            <Text className="text-[26px] text-gray-400 font-medium">{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </View>
  ), [])

  return (
    <View className="min-h-screen bg-[#FCFBF7] font-sans">
      <ScrollLoadList
        request={getGuides}
        renderItem={renderCard}
        renderHeader={renderHeader}
        numColumns={2}
        columnGap={14}
        rowGap={14}
        masonry
        pageSize={10}
        scrollViewProps={{ className: 'px-4 pb-10' }}
      />
    </View>
  )
}
