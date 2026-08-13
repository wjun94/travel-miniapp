import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, ScrollLoadList, Image, CoverImage } from '@/components'
import CalendarSvg from '@/assets/img/calendar.svg'
import LandmarkSvg from '@/assets/img/landmark.svg'
import LocationsSvg from '@/assets/itinerary/locations.svg'
import TeamSvg from '@/assets/img/team.svg'
import { getMyGuides } from '@/api/guide'
import { getMyTrips } from '@/api/trip'
import { getMyPartners } from '@/api/partner'
import type { Guide } from '@/api/post'
import { getHeaderHeight } from '@/utils'

type TabKey = 'guide' | 'trip' | 'partner'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'guide', label: '攻略' },
  { key: 'trip', label: '行程' },
  { key: 'partner', label: '搭子' },
]

// 攻略/行程 双列卡片
const renderNoteCard = (item: Guide, type: 'guide' | 'trip') => (
  <View
    className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 w-full box-border"
    onClick={() => Taro.navigateTo({ url: `/pages/${type}/detail/index?id=${item.id}` })}
  >
    <CoverImage src={item.coverImage} title={item.title} className="w-full h-44">
      {/* 浏览量 */}
      <View className='absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[20px] px-2 py-0.5 rounded-full z-10 flex items-center'>
        <Text className='iconfont icon-eye mr-1' />
        <Text className='text-22px'>{item.viewCount ?? 0}</Text>
      </View>
    </CoverImage>
    <View className="p-2.5 flex flex-col">
      <Text className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 white-space-normal mb-1">
        {item.title}
      </Text>
      {(item.tripDays || item.sectionCount) && (
        <View className="flex flex-row items-center gap-2 mb-1">
          {item.tripDays ? (
            <View className="bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              <Image src={CalendarSvg} className='h-3.5 w-3.5 mr-6px' />
              <Text className="text-[20rpx] text-emerald-600 font-medium">{item.tripDays}天</Text>
            </View>
          ) : null}
          {item.sectionCount ? (
            <View className="bg-stone-50 px-2 py-0.5 rounded-full flex items-center">
              <Image src={LandmarkSvg} className='h-3.5 w-3.5 mr-6px' />
              <Text className="text-[20rpx] text-stone-500 font-medium">{item.sectionCount}个行程</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  </View>
)

// 搭子 单列卡片
const renderPartnerCard = (item: any) => (
  <View
    className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 active:scale-[0.99] transition-transform duration-150"
    onClick={() => Taro.navigateTo({ url: `/pages/partner/detail/index?id=${item.id}` })}
  >
    <View className="relative h-40 bg-gray-900 overflow-hidden">
      {item.cover ? (
        <Image src={item.cover} mode="aspectFill" className="w-full h-full" />
      ) : (
        <View className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center px-3">
          <Text className="text-white/70 text-[30px] font-bold text-center line-clamp-2">
            {item.title || item.destination}
          </Text>
        </View>
      )}
      {/* 浏览量 */}
      <View className='absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-[20px] px-2.5 py-0.5 rounded-full z-10 flex items-center'>
        <Text className='iconfont icon-eye mr-1' />
        <Text className='text-22px'>{item.viewCount ?? 0}</Text>
      </View>
      {/* 底部黑 gradient 渐变 */}
      <View className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
      {item.destination && (
        <View className="absolute bottom-2.5 left-3 z-10 flex items-center">
          <Image src={LocationsSvg} className='h-3.5 w-3.5 mr-6px' />
          <Text className="text-white text-[22px] font-medium drop-shadow-sm">{item.destination}</Text>
        </View>
      )}
    </View>
    <View className="p-3.5 space-y-2">
      <Text className="text-[28px] font-bold text-gray-800 leading-snug line-clamp-1">
        {item.title || item.destination}
      </Text>
      <View className="flex flex-row items-center justify-between pt-1 border-t border-gray-50">
        <View className="flex items-center">
          <Image src={CalendarSvg} className='h-3.5 w-3.5 mr-6px' />
          <Text className="text-[24px] text-gray-500 font-medium">
            {item.startDate ? new Date(item.startDate).getMonth() + 1 + '月' + new Date(item.startDate).getDate() + '日' : '时间待定'}
          </Text>
        </View>
        <View className="flex items-center">
          <Image src={TeamSvg} className='h-4 min-w-4 w-4 mr-6px' />
          <Text className="text-[24px] font-medium text-gray-700">
            {item.currentMembers}/{item.maxMembers} 人
          </Text>
        </View>
      </View>
    </View>
  </View>
)

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('guide')
  const headerHeight = getHeaderHeight()

  return (
    <View className="min-h-screen bg-[#FCFBF7] font-sans flex flex-col">
      <NavBar title="我的笔记" showBack />

      {/* 顶部 Tab 切换（吸顶） */}
      <View
        className="flex border-b border-gray-100 bg-[#FCFBF7] sticky z-30 px-4 pt-2.5 pb-2"
        style={{ top: headerHeight }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <View
              key={tab.key}
              className="flex-1 relative flex flex-col items-center py-0.5"
              onClick={() => setActiveTab(tab.key)}
            >
              <Text
                className={`text-sm tracking-wide transition-all ${
                  isActive ? 'font-bold text-gray-900 scale-110' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View className="absolute -bottom-1.5 w-4 h-[3px] bg-[#e97442] rounded-full" />
              )}
            </View>
          )
        })}
      </View>

      {/* 列表区：仅内容区域滚动，Tab 固定 */}
      <View className="flex-1 overflow-hidden">
        {activeTab === 'guide' && (
          <ScrollLoadList
            key="guide"
            request={getMyGuides}
            renderItem={(item) => renderNoteCard(item, 'guide')}
            numColumns={2}
            columnGap={12}
            rowGap={12}
            masonry
            pageSize={10}
            emptyText="暂无攻略"
            scrollViewProps={{ className: 'px-4 pt-3 pb-6 box-border' }}
          />
        )}
        {activeTab === 'trip' && (
          <ScrollLoadList
            key="trip"
            request={getMyTrips}
            renderItem={(item) => renderNoteCard(item, 'trip')}
            numColumns={2}
            columnGap={12}
            rowGap={12}
            masonry
            pageSize={10}
            emptyText="暂无行程"
            scrollViewProps={{ className: 'px-4 pt-3 pb-6 box-border' }}
          />
        )}
        {activeTab === 'partner' && (
          <ScrollLoadList
            key="partner"
            request={(page, pageSize) =>
              getMyPartners({ page, pageSize }).then((res: any) => ({
                list: res?.list || [],
                total: res?.total || 0,
              }))
            }
            renderItem={renderPartnerCard}
            pageSize={10}
            emptyText="暂无搭子"
            scrollViewProps={{ className: 'pt-2 pb-6 box-border' }}
          />
        )}
      </View>
    </View>
  )
}
