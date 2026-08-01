import { useState, useCallback, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { getHeaderHeight, getImageCdnUrl } from '@/utils'
import { NavBar, ScrollLoadList, GuideCard, Image } from '@/components'
import { getGuides } from '@/api/post'
import type { Guide } from '@/api/post'
import { likeTravelGuide, unlikeTravelGuide } from '@/api/guide'
import { useUpdate } from 'ahooks'
import { useAuthStore } from '@/store/authStore'

// 1. 将静态数组移到组件外部，避免不必要的 renderHeader 依赖重绘
const TABS = [
  { label: '推荐', value: 'recommend' },
  { label: '热门', value: 'hot' },
  { label: '最新', value: 'latest' },
  { label: '国内', value: 'domestic' },
  { label: '国外', value: 'overseas' },
]

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState(0)
  const headerHeight = getHeaderHeight()
  const update = useUpdate()

  // 分享好友：URL 携带邀请码，新用户注册后邀请者可免费获得 1 次 AI 生成额度
  useShareAppMessage(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode
    return {
      title: '规划行程、找旅行搭子，AI 一键搞定出游计划',
      path: `/pages/home/index${inviteCode ? `?inviteCode=${inviteCode}` : ''}`,
      imageUrl: getImageCdnUrl('share.png')
    }
  })

  // 分享朋友圈：query 携带邀请码（朋友圈分享自动拼接至当前页面路径）
  useShareTimeline(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode
    return {
      title: '规划行程、找旅行搭子，AI 一键搞定出游计划',
      query: inviteCode ? `inviteCode=${inviteCode}` : '',
      imageUrl: getImageCdnUrl('share.png')
    }
  })

  const likeStateMap = useRef<Record<string, { isLiked: boolean; likeCount: number }>>({})
  const handleLikeRef = useRef<(e: any, item: Guide) => void>(async (e, item) => {
    e.stopPropagation()
    try {
      const current = likeStateMap.current[item.id]
      const isCurrentlyLiked = current?.isLiked ?? item.isLiked
      const currentLikeCount = current?.likeCount ?? item.likeCount

      if (!isCurrentlyLiked) {
        await likeTravelGuide(item.id)
      } else {
        await unlikeTravelGuide(item.id)
      }
      likeStateMap.current[item.id] = {
        isLiked: !isCurrentlyLiked,
        likeCount: currentLikeCount + (isCurrentlyLiked ? -1 : 1)
      }
      update()
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  })

  // 优化 2: 抽取头部渲染，修复异常的 text-[34px] 为响应式字号
  const renderHeader = useCallback(() => (
    <>
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
        <View className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

        <View className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 pr-20 z-10">
          <Text className="text-xl font-bold text-white tracking-wide mb-1">寻找搭子</Text>
          <Text className="text-xs text-white/90 font-light mb-4 truncate">一个人旅行太无聊？找个搭子一起出发吧！</Text>
          <View className="flex flex-row">
            <View onClick={() => Taro.navigateTo({ url: '/pages/partner/list/index' })} className="bg-white px-4 py-1.5 rounded-full shadow-sm flex flex-row items-center active:opacity-80">
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
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute w-4 h-[3px] bg-[#e97442] rounded-full bottom-0" />
                )}
              </View>
            )
          })}
        </ScrollView>
      </View>
    </>
  ), [headerHeight, currentTab])

  // 卡片渲染
  const renderCard = useCallback((item: Guide) => {
    return <GuideCard item={item} onLike={(e) => handleLikeRef.current(e, item)} />
  }, [])

  return (
    <View className="min-h-screen bg-[#FCFBF7] font-sans box-border pb-20px">
      <NavBar />
      <View className='px-4'>
        {renderHeader()}
      </View>
      <ScrollLoadList
        request={getGuides}
        params={{ category: TABS[currentTab].value }}
        renderItem={renderCard}
        numColumns={2}
        columnGap={12}
        rowGap={12}
        masonry
        pageSize={10}
        emptyText="暂无攻略"
        scrollViewProps={{
          className: 'px-4 box-border',
        }}
      />
    </View>
  )
}