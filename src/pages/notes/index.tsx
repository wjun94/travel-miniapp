import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, ScrollLoadList, Image, CoverImage } from '@/components'
import CalendarSvg from '@/assets/img/calendar.svg'
import LandmarkSvg from '@/assets/img/landmark.svg'
import LocationsSvg from '@/assets/itinerary/locations.svg'
import TeamSvg from '@/assets/img/team.svg'
import { getMyGuides, getMyNotes } from '@/api/guide'
import { getMyTrips } from '@/api/trip'
import { getMyPartners } from '@/api/partner'
import type { Guide } from '@/api/post'
import { getHeaderHeight } from '@/utils'
import { getPartnerStatusColor, PARTNER_STATUS_BADGE_CLASS } from '@/utils/partnerStatus'

type TabKey = 'all' | 'guide' | 'trip' | 'partner'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'guide', label: '攻略' },
  { key: 'trip', label: '行程' },
  { key: 'partner', label: '搭子' },
]

// 笔记状态徽标：仅非默认状态显示（草稿/私密/下架/满员/解散/过期/结束等）
const getStatusBadge = (item: any, type?: string): { label: string; bg: string; text: string } | null => {
  const t = type || item?.itemType || 'guide'
  if (t === 'guide') {
    if (item.status === 0) return { label: '草稿', bg: 'bg-amber-100', text: 'text-amber-600' }
    if (item.status === 2) return { label: '已下架', bg: 'bg-rose-100', text: 'text-rose-500' }
    return null
  }
  if (t === 'trip') {
    if (item.status === 1) return { label: '草稿', bg: 'bg-amber-100', text: 'text-amber-600' }
    if (item.status === 3) return { label: '已归档', bg: 'bg-sky-100', text: 'text-sky-600' }
    if (item.isPublic === 0) return { label: '私密', bg: 'bg-gray-200/70', text: 'text-gray-500' }
    return null
  }
  // partner：始终回显状态（含招募中），优先使用后端返回的 statusText，样式与详情/列表页统一（具体色值+白字）
  if (item.statusText) {
    return { label: item.statusText, bg: getPartnerStatusColor(item.statusText), text: 'text-white' }
  }
  if (item.isDraft === 1) return { label: '草稿', bg: getPartnerStatusColor('草稿'), text: 'text-white' }
  if (item.isPublic === 0) return { label: '仅自己可见', bg: getPartnerStatusColor('仅自己可见'), text: 'text-white' }
  const partnerLabelMap: Record<number, string> = {
    0: '招募中',
    1: '已满员',
    2: '已解散',
    3: '已过期',
    4: '行程结束',
  }
  const partnerLabel = partnerLabelMap[item.status] || '招募中'
  return { label: partnerLabel, bg: getPartnerStatusColor(partnerLabel), text: 'text-white' }
}

// 攻略/行程 双列卡片
const renderNoteCard = (item: Guide, type: 'guide' | 'trip') => {
  const statusBadge = getStatusBadge(item, type)
  const destination = item.destination || item.destinations?.[0] || ''
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 w-full box-border"
      onClick={() => Taro.navigateTo({ url: `/pages/${type}/detail/index?id=${item.id}` })}
    >
      <CoverImage src={item.coverImage} title={item.title} className="w-full h-44">
        {statusBadge && (
          <View className={`absolute top-2 left-2 ${statusBadge.bg} ${statusBadge.text} text-[18px] px-2 py-0.5 rounded-full z-10`}>
            <Text>{statusBadge.label}</Text>
          </View>
        )}
        {/* 浏览量 */}
        <View className='absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[20px] px-2 py-0.5 rounded-full z-10 flex items-center'>
          <Text className='iconfont icon-eye mr-1' />
          <Text className='text-22px'>{item.viewCount ?? 0}</Text>
        </View>
        {/* 底部渐变 + 目的地（与搭子卡片一致） */}
        {destination ? (
          <>
            <View className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none' />
            <View className="absolute bottom-2 left-2.5 z-10 flex items-center">
              <Image src={LocationsSvg} className='h-3.5 w-3.5 mr-6px' />
              <Text className="text-white text-[22px] font-medium drop-shadow-sm line-clamp-1">{destination}</Text>
            </View>
          </>
        ) : null}
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
}

// 全部笔记 统一卡片（攻略/行程/搭子混合展示）
const renderAllNoteCard = (item: any) => {
  const type = item.itemType || 'guide'
  const cover = item.coverImage || item.cover || ''
  const destination = item.destinations?.[0] || item.destination || ''
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 w-full box-border"
      onClick={() => Taro.navigateTo({ url: `/pages/${type}/detail/index?id=${item.id}` })}
    >
      <CoverImage src={cover} title={item.title} className="w-full h-44">
        {/* 浏览量 */}
        <View className='absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[20px] px-2 py-0.5 rounded-full z-10 flex items-center'>
          <Text className='iconfont icon-eye mr-1' />
          <Text className='text-22px'>{item.viewCount ?? 0}</Text>
        </View>
        {/* 底部渐变 + 目的地（与搭子卡片一致） */}
        {destination ? (
          <>
            <View className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none' />
            <View className="absolute bottom-2 left-2.5 z-10 flex items-center">
              <Image src={LocationsSvg} className='h-3.5 w-3.5 mr-6px' />
              <Text className="text-white text-[22px] font-medium drop-shadow-sm line-clamp-1">{destination}</Text>
            </View>
          </>
        ) : null}
      </CoverImage>
      <View className="p-2.5 flex flex-col">
        <Text className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 white-space-normal mb-1">
          {item.title}
        </Text>
        {(item.tripDays || item.sectionCount) && (
          <View className="flex flex-row items-center gap-2">
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
}

// 搭子 单列卡片
const renderPartnerCard = (item: any) => {
  const statusBadge = getStatusBadge(item, 'partner')
  return (
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
        {statusBadge && (
          <View
            className={`absolute top-2.5 left-2.5 z-10 ${PARTNER_STATUS_BADGE_CLASS}`}
            style={{ backgroundColor: statusBadge.bg }}
          >
            <Text>{statusBadge.label}</Text>
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
          <View className="flex flex-row items-center space-x-2">
            <View className="flex items-center">
              <Image src={CalendarSvg} className='h-3.5 w-3.5 mr-6px' />
              <Text className="text-[24px] text-gray-500 font-medium">
                {item.startDate ? new Date(item.startDate).getMonth() + 1 + '月' + new Date(item.startDate).getDate() + '日' : '时间待定'}
              </Text>
            </View>
            {item.sectionCount > 0 && (
              <View className="bg-stone-50 px-2 py-0.5 rounded-full flex items-center">
                <Image src={LandmarkSvg} className='h-3.5 w-3.5 mr-6px' />
                <Text className="text-[20rpx] text-stone-500 font-medium">{item.sectionCount}个行程</Text>
              </View>
            )}
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
}

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const headerHeight = getHeaderHeight()

  return (
    <View className="min-h-screen bg-[#FCFBF7] font-sans flex flex-col">
      <NavBar title="我的笔记" showBack />

      {/* 顶部 Tab 切换（吸顶，分段胶囊样式） */}
      <View
        className="sticky z-30 px-4 pt-3 pb-2.5 bg-[#FCFBF7] border-b border-gray-100"
        style={{ top: headerHeight }}
      >
        <View className="flex flex-row items-center gap-1 bg-gray-200/40 rounded-full p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <View
                key={tab.key}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-full transition-all ${isActive ? 'bg-white shadow-sm' : ''
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Text
                  className={`text-sm tracking-wide transition-all ${isActive ? 'font-bold text-[#e97442]' : 'text-gray-400'
                    }`}
                >
                  {tab.label}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* 列表区：仅内容区域滚动，Tab 固定 */}
      <View className="flex-1 overflow-hidden">
        {activeTab === 'all' && (
          <ScrollLoadList
            key="all"
            request={getMyNotes}
            renderItem={renderAllNoteCard}
            numColumns={2}
            columnGap={12}
            rowGap={12}
            masonry
            pageSize={10}
            emptyText="暂无笔记"
            scrollViewProps={{ className: 'px-4 pt-3 pb-6 box-border' }}
          />
        )}
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
