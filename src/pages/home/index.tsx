import { useState, useCallback } from 'react'
import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getHeaderHeight } from '@/utils'
import { NavBar, ScrollLoadList } from '@/components'
import { getGuides } from '@/api/post'
import type { Guide } from '@/api/post'

// 1. 将静态数组移到组件外部，避免不必要的 renderHeader 依赖重绘
const TABS = ['推荐', '热门', '最新', '国内', '国外', '小众']

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0)
  const headerHeight = getHeaderHeight()

  // 优化 2: 抽取头部渲染，修复异常的 text-[34px] 为响应式字号
  const renderHeader = useCallback(() => (
    <>
      <NavBar />

      {/* 1. 顶部搜索栏 */}
      <View className="flex flex-row items-center justify-between my-3 px-0.5">
        <View className="flex-1 flex flex-row items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-100">
          <Text className="text-gray-400 mr-2 text-base leading-none">🔍</Text>
          <Input
            placeholder="搜索目的地 / 攻略 / 用户"
            placeholderClass="text-gray-300 text-sm"
            className="text-sm text-gray-700 flex-1 h-5 min-h-5"
          />
        </View>
      </View>

      {/* 2. "寻找搭子" Banner 区域 */}
      <View className="relative w-full h-40 rounded-2xl overflow-hidden my-3 shadow-sm">
        <Image
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&q=80"
          mode="aspectFill"
          className="w-full h-full absolute inset-0"
        />
        {/* 蒙层渐变 */}
        <View className="absolute inset-0 bg-gradient-to-r from-[#e97442]/95 via-[#f09366]/75 to-transparent" />

        <View className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 pr-20 z-10">
          <Text className="text-xl font-bold text-white tracking-wide mb-1">寻找搭子</Text>
          <Text className="text-xs text-white/90 font-light mb-4 truncate">一个人旅行太无聊？找个搭子一起出发吧！</Text>
          <View className="flex flex-row">
            <View className="bg-white px-4 py-1.5 rounded-full shadow-sm flex flex-row items-center active:opacity-80">
              <Text className="text-xs font-bold text-[#e97442] mr-1">去看看</Text>
              <Text className="text-xs text-[#e97442]">➔</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Tab 导航栏 */}
      <View
        className="flex flex-row items-center justify-between sticky z-30 bg-[#FCFBF7] py-2.5 mb-2"
        style={{ top: headerHeight }}
      >
        <ScrollView
          scrollX
          showScrollbar={false}
          enhanced // 开启增强特性，方便在小程序端隐藏滚动条
          className="flex-1 whitespace-nowrap pr-2"
        >
          {TABS.map((tab, index) => {
            const isActive = currentTab === index
            return (
              <View
                key={index}
                onClick={() => setCurrentTab(index)}
                className="inline-flex flex-col items-center mr-6 last:mr-4 relative py-1"
              >
                <Text className={`text-sm tracking-wide transition-all ${isActive ? 'font-bold text-gray-900 scale-110' : 'text-gray-400'}`}>
                  {tab}
                </Text>
                {isActive && (
                  <View className="absolute w-4 h-[3px] bg-[#e97442] rounded-full bottom-0" />
                )}
              </View>
            )
          })}
        </ScrollView>
        <View className="pl-3 border-l border-gray-200 flex items-center justify-center bg-[#FCFBF7]">
          <Text className="text-lg text-gray-400 font-bold leading-none">⊞</Text>
        </View>
      </View>
    </>
  ), [headerHeight, currentTab])

  // 优化 3: 修复卡片内部文字大小，保证瀑布流不会因大字号撑变形
  const renderCard = useCallback((item: Guide) => (
    <View
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 w-full box-border"
      onClick={() => Taro.navigateTo({ url: `/pages/guide/detail/index?id=${item.id}` })}
    >
      <View className="w-full h-44 relative bg-gray-50">
        <Image src={item.coverImage} mode="aspectFill" className="w-full h-full" />
      </View>

      <View className="p-2.5 flex flex-col">
        <Text className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 white-space-normal mb-1">
          {item.title}
        </Text>
        <Text className="text-xs text-gray-400 truncate mb-2">
          {item.summary}
        </Text>

        <View className="flex flex-row items-center justify-between mt-auto">
          <View className="flex flex-row items-center flex-1 min-w-0 mr-2">
            <Image src={item.authorAvatar} className="w-4 h-4 rounded-full bg-gray-100 flex-shrink-0" />
            <Text className="text-[22rpx] text-gray-500 ml-1 truncate flex-1">{item.authorName}</Text>
          </View>
          <View className="flex flex-row items-center flex-shrink-0 text-gray-500">
            <Text className={`iconfont leading-none mr-8px ${item.isLiked ? 'icon-follow-fill text-red-400' : 'icon-follow'}`} />
            <Text className="leading-1">{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </View>
  ), [])

  return (
    <View className="min-h-screen bg-[#FCFBF7] font-sans box-border">
      <ScrollLoadList
        request={getGuides}
        renderItem={renderCard}
        renderHeader={renderHeader}
        numColumns={2}
        columnGap={12}
        rowGap={12}
        masonry
        pageSize={10}
        emptyText="暂无攻略"
        scrollViewProps={{
          className: 'px-4 pb-10 box-border',
          style: { height: '100vh' } // 显式声明高度确保内部滚动顺畅
        }}
      />
    </View>
  )
}