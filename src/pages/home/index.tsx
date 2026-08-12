import { useState, useCallback, useRef } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline, useDidShow } from '@tarojs/taro'
import { getHeaderHeight, getImageCdnUrl } from '@/utils'
import { NavBar, ScrollLoadList, GuideCard, Image } from '@/components'
import type { ScrollLoadListRef } from '@/components/ScrollLoadList'
import { getGuides } from '@/api/post'
import type { Guide } from '@/api/post'
import { likeTravelGuide, unlikeTravelGuide } from '@/api/guide'
import { useUpdate } from 'ahooks'
import { useAuthStore } from '@/store/authStore'
import LogoPng from '@/assets/logo.png'

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
  const [searchKeyword, setSearchKeyword] = useState('')
  const headerHeight = getHeaderHeight()
  const update = useUpdate()
  // 列表刷新句柄：页面显示时同步最新数据（新建发布/详情点赞返回后）
  const listRef = useRef<ScrollLoadListRef>(null)
  // Tab 栏在文档中的绝对位置（页面显示时测量缓存，切换 Tab 时用于定位列表顶部）
  const tabsTopRef = useRef(0)

  // 页面显示时：刷新列表 + 测量 Tab 文档位置（视口坐标 + 当前滚动偏移，滚动状态下同样准确）
  // useDidShow(() => {
  //   listRef.current?.refresh(true)
  //   const query = Taro.createSelectorQuery()
  //   query.select('#home-tabs').boundingClientRect()
  //   query.selectViewport().scrollOffset()
  //   query.exec((res) => {
  //     if (!Array.isArray(res)) return
  //     const rect = res[0] as Taro.NodesRef.BoundingClientRectCallbackResult | undefined
  //     const viewport = res[1] as { scrollTop?: number } | undefined
  //     if (rect && viewport) {
  //       tabsTopRef.current = rect.top + (viewport.scrollTop || 0)
  //     }
  //   })
  // })

  // 点击搜索：跳转搜索页并携带关键词
  const handleSearch = useCallback(() => {
    const keyword = searchKeyword.trim()
    Taro.navigateTo({ url: `/pages/search/index${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}` })
  }, [searchKeyword])

  // 切换 Tab：更新分类并滚动到列表顶部（Tab 吸顶处，列表从第一项开始展示）
  // 目标值 = Tab 文档绝对位置（useDidShow 时测量缓存）- NavBar 高度，同步执行不依赖查询时序
  const handleTabChange = useCallback((index: number) => {
    setCurrentTab(index)
    Taro.pageScrollTo({ scrollTop: Math.max(tabsTopRef.current - headerHeight, 0), duration: 0 })
  }, [headerHeight])

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
  })

  // 卡片渲染
  const renderCard = useCallback((item: Guide) => {
    return <GuideCard item={item} onLike={(e) => handleLikeRef.current(e, item)} />
  }, [])

  return (
    <>
      <NavBar>
        <View className='flex flex-row items-center ml-4'>
          <Image src={LogoPng} className='w-70px h-70px mr-1.5 rounded-20px' />
          <View className='flex flex-col leading-none'>
            <Text className='font-bold text-[#e97442] tracking-wide text-30px'>邻刻走</Text>
            <Text className='text-[22px] text-black font-bold tracking-widest mt-1'>LinkGo</Text>
          </View>
        </View>
      </NavBar>
      <View className='px-4'>
        {/* 1. 顶部搜索栏 */}
        <View className="flex flex-row items-center justify-between my-2 px-0.5">
          <View className="flex-1 flex flex-row items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-100">
            <Text className="iconfont icon-search text-gray-400 mr-2 text-base leading-none" />
            <Input
              placeholder="搜索标题/目的地/简介"
              placeholderClass="text-gray-300 text-sm"
              className="text-sm text-gray-700 flex-1 h-5 min-h-5"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
              confirmType="search"
              onConfirm={handleSearch}
            />
            {searchKeyword && (
              <Text
                className="iconfont icon-close text-gray-300 text-base leading-none ml-1 active:opacity-60"
                onClick={() => setSearchKeyword('')}
              />
            )}
          </View>
          <Text
            className="text-[#e97442] text-sm font-bold ml-3 flex-shrink-0 active:opacity-70"
            onClick={handleSearch}
          >
            搜索
          </Text>
        </View>

        {/* 2. "寻找搭子" Banner 区域 */}
        <View className="relative w-full h-40 rounded-2xl overflow-hidden my-3 shadow-sm">
          <Image
            src="home-banner.jfif"
            cdn
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
      </View>
      {/* 3. Tab 导航栏 */}
      <View
        id="home-tabs"
        className="sticky z-30 bg-[#FCFBF7] py-2.5 mb-2 px-4"
        style={{ top: headerHeight }}
      >
        <View
          className="flex-1 whitespace-nowrap pr-2"
        >
          {TABS.map((tab, index) => {
            const isActive = currentTab === index
            return (
              <View
                key={index}
                onClick={() => handleTabChange(index)}
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
        </View>
      </View>
      <View className="min-h-screen bg-[#FCFBF7] font-sans box-border pb-20px">
        <ScrollLoadList
          ref={listRef}
          request={(page, pageSize, params) => getGuides(page, pageSize, undefined, undefined, params?.category)}
          params={{ category: TABS[currentTab].value }}
          renderItem={renderCard}
          numColumns={2}
          columnGap={12}
          rowGap={12}
          masonry
          pageScroll
          pageSize={10}
          emptyText="暂无攻略"
          scrollViewProps={{
            className: 'px-4 box-border',
          }}
        />
      </View>
    </>
  )
}