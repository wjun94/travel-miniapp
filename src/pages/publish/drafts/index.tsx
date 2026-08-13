import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useRef, useState } from 'react'
import { NavBar, ScrollLoadList, Modal, Image } from '@/components'
import LocationsSvg from '@/assets/itinerary/locations.svg'
import { getHeaderHeight } from '@/utils'
import { getMyGuides, deleteTravelGuide } from '@/api/guide'
import { getMyTrips, deleteTrip } from '@/api/trip'
import { getMyPartners, deletePartner } from '@/api/partner'

type TabKey = 'all' | 'guide' | 'trip' | 'partner'

interface DraftItem {
  id: string
  type: 'guide' | 'trip' | 'partner'
  title: string
  cover: string
  updatedAt: string
  destination?: string
  dayCount?: number
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'guide', label: '攻略' },
  { key: 'trip', label: '行程' },
  { key: 'partner', label: '搭子' },
]

const TYPE_LABEL: Record<string, string> = { guide: '攻略草稿', trip: '行程草稿', partner: '搭子草稿' }
const TYPE_COLOR: Record<string, string> = { guide: 'bg-orange-100 text-orange-600', trip: 'bg-green-100 text-green-600', partner: 'bg-red-100 text-red-500' }

const formatTime = (s: string) => {
  if (!s) return ''
  const d = new Date(s)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const requestDrafts = async (tab: TabKey, page: number, pageSize: number) => {
  if (tab === 'guide') {
    const res: any = await getMyGuides(page, pageSize, 0)
    const list = res?.list?.list || res?.list || []
    const total = res?.list?.total || res?.total || 0
    return {
      list: list.map((g: any) => ({
        id: g.id,
        type: 'guide' as const,
        title: g.title || '未命名攻略',
        cover: g.coverImage || '',
        updatedAt: g.updatedAt || g.createdAt || '',
        destination: g.destination,
        dayCount: g.tripDays || g.sectionCount || 0,
      })),
      total,
    }
  }
  if (tab === 'trip') {
    const res: any = await getMyTrips(page, pageSize, 1)
    const list = res?.list?.list || res?.list || []
    const total = res?.list?.total || res?.total || 0
    return {
      list: list.map((t: any) => ({
        id: t.id,
        type: 'trip' as const,
        title: t.title || '未命名行程',
        cover: t.coverImage || '',
        updatedAt: t.updatedAt || t.createdAt || '',
        destination: (t.cities || t.destinations || []).join(' · '),
        dayCount: t.days?.length || 0,
      })),
      total,
    }
  }
  if (tab === 'partner') {
    const res: any = await getMyPartners({ page, pageSize, isDraft: 1 })
    const list = res?.list?.list || res?.list || []
    const total = res?.list?.total || res?.total || 0
    return {
      list: list.map((p: any) => ({
        id: p.id,
        type: 'partner' as const,
        title: p.title || '未命名搭子',
        cover: p.cover || '',
        updatedAt: p.updatedAt || p.createdAt || '',
        destination: p.destination,
        dayCount: p.days || 0,
      })),
      total,
    }
  }
  // 全部：三类各取一批合并，按更新时间倒序
  const [g, t, p] = await Promise.all([
    getMyGuides(1, pageSize, 0).then((res: any) => (res?.list?.list || res?.list || [])),
    getMyTrips(1, pageSize, 1).then((res: any) => (res?.list?.list || res?.list || [])),
    getMyPartners({ page: 1, pageSize, isDraft: 1 }).then((res: any) => (res?.list?.list || res?.list || [])),
  ])
  const merged: DraftItem[] = [
    ...g.map((x: any) => ({ id: x.id, type: 'guide' as const, title: x.title || '未命名攻略', cover: x.coverImage || '', updatedAt: x.updatedAt || x.createdAt || '', destination: x.destination, dayCount: x.tripDays || 0 })),
    ...t.map((x: any) => ({ id: x.id, type: 'trip' as const, title: x.title || '未命名行程', cover: x.coverImage || '', updatedAt: x.updatedAt || x.createdAt || '', destination: (x.cities || x.destinations || []).join(' · '), dayCount: x.days?.length || 0 })),
    ...p.map((x: any) => ({ id: x.id, type: 'partner' as const, title: x.title || '未命名搭子', cover: x.cover || '', updatedAt: x.updatedAt || x.createdAt || '', destination: x.destination, dayCount: x.days || 0 })),
  ].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  return { list: merged, total: merged.length }
}

export default function DraftsPage() {
  const [tab, setTab] = useState<TabKey>('all')
  const listRef = useRef<any>(null)
  const [delTarget, setDelTarget] = useState<DraftItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const headerHeight = getHeaderHeight()

  // 页面显示时刷新（草稿状态变更后返回同步数据）；首次进入由列表组件初始加载负责，跳过避免重复请求
  const isFirstShow = useRef(true)
  useDidShow(() => {
    if (isFirstShow.current) {
      isFirstShow.current = false
      return
    }
    listRef.current?.refresh()
  })

  const handleDelete = async () => {
    if (!delTarget) return
    setDeleting(true)
    const ok = await (delTarget.type === 'guide'
      ? deleteTravelGuide(delTarget.id)
      : delTarget.type === 'trip'
        ? deleteTrip(delTarget.id)
        : deletePartner(delTarget.id)
    ).then(() => true).catch(() => false)
    setDeleting(false)
    if (!ok) return
    Taro.showToast({ title: '已删除', icon: 'success' })
    setDelTarget(null)
    listRef.current?.refresh()
  }

  const editUrl = (item: DraftItem) => {
    if (item.type === 'guide') return `/pages/guide/basic/index?draftId=${item.id}`
    if (item.type === 'trip') return `/pages/trip/basic/index?draftId=${item.id}`
    return `/pages/partner/basic/index?draftId=${item.id}`
  }

  return (
    <View className='min-h-screen bg-gray-100/70 pb-6'>
      <NavBar title='草稿箱' showBack />

      {/* Tab 切换：吸顶在导航栏下方 */}
      <View className='flex flex-row bg-white px-2 py-1.5 sticky z-30 shadow-sm' style={{ top: headerHeight }}>
        {TABS.map((t) => (
          <View
            key={t.key}
            className={`flex-1 py-2 text-center text-[26px] font-medium rounded-full mx-1 ${tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </View>
        ))}
      </View>

      <ScrollLoadList
        key={tab}
        ref={listRef}
        pageSize={10}
        emptyText='暂无草稿，快去创建吧'
        request={(page, pageSize) => requestDrafts(tab, page, pageSize)}
        renderItem={(item: DraftItem) => (
          <View
            key={item.id}
            className='mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 active:scale-[0.99] transition-transform duration-150'
            onClick={() => Taro.navigateTo({ url: editUrl(item) })}
          >
            <View className='flex flex-row p-3'>
              {/* 封面 */}
              <View className='w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative'>
                {item.cover ? (
                  <Image src={item.cover} mode='aspectFill' className='w-full h-full' />
                ) : (
                  <View className='w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center'>
                    <Text className='text-white/40 text-xl font-bold'>TRAVEL</Text>
                  </View>
                )}
              </View>
              {/* 内容 */}
              <View className='flex-1 ml-3 flex flex-col justify-between min-w-0'>
                <View>
                  <View className='flex flex-row items-center justify-between'>
                    <Text className='text-[26px] font-bold text-gray-800 truncate flex-1 mr-2'>{item.title}</Text>
                    <Text className={`shrink-0 text-[20px] px-2 py-0.5 rounded-md font-medium ${TYPE_COLOR[item.type]}`}>
                      {TYPE_LABEL[item.type]}
                    </Text>
                  </View>
                  {item.destination && (
                    <View className='flex items-center mt-1'>
                      <Image src={LocationsSvg} className='h-3.5 w-3.5 mr-6px flex-shrink-0' />
                      <Text className='text-[22px] text-gray-500 truncate flex-1'>{item.destination}</Text>
                    </View>
                  )}
                </View>
                <View className='flex flex-row items-center justify-between'>
                  <Text className='text-[20px] text-gray-400'>
                    {formatTime(item.updatedAt)}
                    {item.dayCount ? ` · ${item.dayCount}天` : ''}
                  </Text>
                  <View
                    className='text-[22px] text-rose-500 px-3 py-1 rounded-lg bg-rose-50 active:bg-rose-100'
                    onClick={(e) => { e.stopPropagation(); setDelTarget(item) }}
                  >
                    删除
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* 删除确认弹窗 */}
      <Modal
        visible={!!delTarget}
        title='删除草稿'
        confirmText='删除'
        cancelText='取消'
        confirmLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
        onMaskClick={() => setDelTarget(null)}
      >
        <View className='py-2 text-center'>
          <Text className='text-gray-600 text-[28px] leading-relaxed'>
            确定删除草稿「{delTarget?.title}」吗？删除后不可恢复。
          </Text>
        </View>
      </Modal>
    </View>
  )
}
