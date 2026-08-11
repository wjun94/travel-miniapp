import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { ScrollView, View, Text } from '@tarojs/components'
import type { ScrollViewProps } from '@tarojs/components'
import { useReachBottom } from '@tarojs/taro'
import { Image } from '@/components'

export interface RequestResult<T> {
  list: T[]
  total: number
}

export interface ScrollLoadListProps<T = any> {
  request: (page: number, pageSize: number, params?: any) => Promise<RequestResult<T>>
  renderItem: (item: T | any, index: number) => React.ReactNode
  params?: any
  pageSize?: number
  initialPage?: number
  immediate?: boolean
  emptyText?: string
  loadingMoreText?: string
  noMoreText?: string
  errorText?: string
  renderHeader?: () => React.ReactNode
  renderFooter?: () => React.ReactNode
  renderEmpty?: () => React.ReactNode
  renderError?: () => React.ReactNode
  renderLoadMoreIndicator?: () => React.ReactNode
  keyExtractor?: (item: T | any, index: number) => string
  lowerThreshold?: number
  scrollViewProps?: Omit<ScrollViewProps, 'onScrollToLower'>
  className?: string
  style?: React.CSSProperties
  /** 每行显示的列数，默认 1（普通列表） */
  numColumns?: number
  /** 列间距（单位 px），仅在多列布局时生效，默认 0 */
  columnGap?: number
  /** 行间距（单位 px），仅在多列布局时生效，默认 0 */
  rowGap?: number
  /** 是否启用瀑布流布局（仅当 numColumns > 1 时生效），默认 false */
  masonry?: boolean
  /** 页面级滚动模式：scroll-view 不拦截滚动（高度自适应内容），由页面滚动承载；分页已默认生效，此参数仅控制滚动承载方式，用于外层有 sticky 吸顶元素的页面 */
  pageScroll?: boolean
}

export interface ScrollLoadListRef {
  /** 刷新列表；默认静默不触发下拉刷新动画，手动下拉场景传 false */
  refresh: (silent?: boolean) => void
  /** 手动加载下一页（滚动触底已默认自动分页，此方法用于自定义触发场景） */
  loadMore: () => void
}

// 静默刷新 loading 最小展示时长（ms）：请求过快时避免一闪而过
const MIN_SILENT_LOADING_MS = 400

const ScrollLoadList = forwardRef(<T = any>(props: ScrollLoadListProps<T>, ref: React.Ref<ScrollLoadListRef | any>) => {
  const {
    request,
    renderItem,
    params = {},
    pageSize = 10,
    initialPage = 1,
    immediate = true,
    emptyText = '暂无数据',
    loadingMoreText = '加载中...',
    noMoreText = '—— 已全部加载 ——',
    errorText = '加载失败，点击重试',
    renderHeader,
    renderFooter,
    renderEmpty,
    renderError,
    renderLoadMoreIndicator,
    keyExtractor = (_, index) => index.toString(),
    lowerThreshold = 100,
    scrollViewProps = {},
    className = '',
    style,
    numColumns = 1,
    columnGap = 0,
    rowGap = 0,
    masonry = false,
    pageScroll = false,
  } = props

  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [silentLoading, setSilentLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [initialLoading, setInitialLoading] = useState(immediate)

  const isMounted = useRef(true)
  const isLoadingMoreRef = useRef(false)
  // 标记是否首次渲染，避免 params effect 与初始加载 effect 重复请求
  const isFirstRender = useRef(true)
  // 数据快照：用于静默刷新时对比数据是否变化（避免重复渲染导致瀑布流重排闪动）
  const dataRef = useRef<T[]>([])
  // 静默加载开始时间：用于保证 loading 最小展示时长
  const silentStartRef = useRef(0)

  // 加载数据（通用）
  const loadData = useCallback(async (currentPage: number, isRefresh = false, silent = false) => {
    if (!isRefresh && loadingMore) return
    if (isRefresh && !silent) {
      setRefreshing(true)
    } else if (isRefresh && silent) {
      silentStartRef.current = Date.now()
      setSilentLoading(true)
    } else if (!isRefresh) {
      setLoadingMore(true)
    }
    setError(false)

    const res = await request(currentPage, pageSize, params).catch(() => null)
    if (!isMounted.current) return

    if (res) {
      const { list, total } = res
      const totalPage = Math.ceil(total / pageSize)

      if (isRefresh) {
        const nextList = list || []
        // 静默刷新：数据未变化时跳过 setData，避免列表整体替换导致瀑布流重排闪动
        if (!silent || JSON.stringify(nextList) !== JSON.stringify(dataRef.current)) {
          dataRef.current = nextList
          setData(nextList)
        }
        setPage(currentPage)
      } else {
        const merged = [...dataRef.current, ...list]
        dataRef.current = merged
        setData(merged)
      }
      setHasMore(currentPage < totalPage)
      setError(false)
    } else {
      setError(true)
    }
    if (isRefresh) {
      setRefreshing(false)
      // 已有数据的静默刷新：保证 loading 至少展示 MIN_SILENT_LOADING_MS，避免一闪而过
      if (silent && dataRef.current.length > 0) {
        const remain = MIN_SILENT_LOADING_MS - (Date.now() - silentStartRef.current)
        if (remain > 0) {
          setTimeout(() => {
            if (isMounted.current) setSilentLoading(false)
          }, remain)
        } else {
          setSilentLoading(false)
        }
      } else {
        setSilentLoading(false)
      }
    } else {
      setLoadingMore(false)
    }
    if (isRefresh && isMounted.current) {
      setInitialLoading(false)
    }
  }, [request, pageSize, loadingMore, params])

  // params 变化时自动刷新列表（首次挂载由初始加载 effect 负责，避免重复请求）
  // 直接调用 loadData 而非 refresh：绕过防重，避免快速切换参数时请求在飞导致数据停留在旧分类
  useEffect(() => {
    if (immediate && isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    loadData(initialPage, true, true)
  }, [JSON.stringify(params)])

  // 对外暴露的刷新方法：默认静默（不触发下拉刷新动画），手动下拉时传入 false
  const refresh = useCallback((silent = true) => {
    if (refreshing || loadingMore || silentLoading) return
    loadData(initialPage, true, silent)
  }, [refreshing, loadingMore, silentLoading, initialPage, loadData])

  // 初始加载（静默，不触发下拉刷新动画）
  useEffect(() => {
    if (immediate) {
      loadData(initialPage, true, true)
    }
    return () => {
      isMounted.current = false
    }
  }, [])

  // 上拉加载更多
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || refreshing || error || silentLoading || isLoadingMoreRef.current) return
    isLoadingMoreRef.current = true
    const nextPage = page + 1
    loadData(nextPage, false).finally(() => {
      setTimeout(() => {
        isLoadingMoreRef.current = false
      }, 200)
    })
  }, [loadingMore, hasMore, refreshing, error, page, loadData])

  // 页面滚动触底加载：默认生效，与 scroll-view 内部触底（onScrollToLower）互为补充，无需调用方传参
  // 覆盖场景：scroll-view 被内容撑开无内部滚动空间时（页面级滚动承载），页面滚动到底部自动加载下一页
  useReachBottom(() => {
    handleLoadMore()
  })

  useImperativeHandle(ref, () => ({
    refresh,
    loadMore: handleLoadMore
  }), [refresh, handleLoadMore])

  // 重试
  const handleRetry = useCallback(() => {
    if (error) {
      if (data.length === 0) {
        loadData(initialPage, true, true)
      } else {
        handleLoadMore()
      }
    }
  }, [error, data.length, initialPage, loadData, handleLoadMore])

  const renderFooterContent = () => {
    if (renderLoadMoreIndicator) return renderLoadMoreIndicator()
    if (error) {
      if (renderError) return renderError()
      return (
        <View className="flex justify-center items-center py-4" onClick={handleRetry}>
          <Text className="text-red-500 text-sm">{errorText}</Text>
        </View>
      )
    }
    if (loadingMore) {
      return (
        <View className="flex justify-center items-center py-4">
          <View className="sll-spinner mr-10px" />
          <Text className="text-[22px] text-stone-500">{loadingMoreText}</Text>
        </View>
      )
    }
    if (!hasMore && data.length > 9) {
      return (
        <View className="flex justify-center items-center py-4">
          <Text className="text-gray-400 text-sm">{noMoreText}</Text>
        </View>
      )
    }
    return null
  }

  const renderEmptyContent = () => {
    if (renderEmpty) return renderEmpty()
    return (
      <View className="flex flex-col justify-center items-center text-gray-400 py-20">
        <Image cdn src="list-none2.png" className="w-376px h-217px mt-4 opacity-60" />
        <Text className="text-28px mt-20px">{emptyText}</Text>
      </View>
    )
  }

  const showEmpty = data.length === 0 && !loadingMore && !refreshing && !silentLoading && !error && !initialLoading

  // 判断是否启用瀑布流布局（masonry 模式且多列）
  const isMasonry = masonry && numColumns > 1
  // 普通网格（flex 等高分列）
  const isGrid = !isMasonry && numColumns > 1

  // 瀑布流样式 (CSS Columns)
  const masonryContainerStyle: React.CSSProperties = isMasonry
    ? {
      columnCount: numColumns,
      columnGap: columnGap,
    }
    : {}

  const masonryItemStyle: React.CSSProperties = isMasonry
    ? {
      breakInside: 'avoid',
      marginBottom: rowGap,
    }
    : {}

  // 普通网格样式 (flex)
  const gridContainerStyle: React.CSSProperties = isGrid
    ? {
      display: 'flex',
      flexWrap: 'wrap',
      marginLeft: columnGap ? -columnGap / 2 : 0,
      marginRight: columnGap ? -columnGap / 2 : 0,
    }
    : {}

  const gridItemStyle: React.CSSProperties = isGrid
    ? {
      width: `${100 / numColumns}%`,
      paddingLeft: columnGap ? columnGap / 2 : 0,
      paddingRight: columnGap ? columnGap / 2 : 0,
      marginBottom: rowGap,
      boxSizing: 'border-box',
    }
    : {}

  return (
    <ScrollView
      scrollY={!pageScroll}
      className={pageScroll ? className : `h-full ${className}`}
      style={style}
      onScrollToLower={pageScroll ? undefined : handleLoadMore}
      lowerThreshold={lowerThreshold}
      {...scrollViewProps}
    >
      {renderHeader && renderHeader()}

      {!showEmpty && (
        <>
          {/* 瀑布流模式：使用 CSS columns */}
          {isMasonry && (
            <View style={masonryContainerStyle}>
              {data.map((item, index) => {
                const key = keyExtractor(item, index)
                return (
                  <View key={key} style={masonryItemStyle}>
                    {renderItem(item, index)}
                  </View>
                )
              })}
            </View>
          )}

          {/* 普通网格模式：flex */}
          {isGrid && (
            <View style={gridContainerStyle}>
              {data.map((item, index) => {
                const key = keyExtractor(item, index)
                return (
                  <View key={key} style={gridItemStyle}>
                    {renderItem(item, index)}
                  </View>
                )
              })}
            </View>
          )}

          {/* 单列模式：普通列表 */}
          {numColumns === 1 && (
            <View className="flex flex-col">
              {data.map((item, index) => (
                <View key={keyExtractor(item, index)}>
                  {renderItem(item, index)}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {data.length > 0 && renderFooterContent()}
      {renderFooter && renderFooter()}

      {showEmpty && renderEmptyContent()}
      {/* 静默刷新 loading：有数据时顶部胶囊条，无数据时居中指示 */}
      {silentLoading && (
        <View
          className={data.length > 0
            ? 'flex justify-center items-center py-6px'
            : 'flex flex-col justify-center items-center py-40px'}
        >
          {data.length > 0 ? (
            <View className="flex flex-row items-center px-16px py-6px rounded-full bg-white shadow-sm">
              <View className="sll-spinner" />
              <Text className="text-[22px] text-stone-500 ml-10px">
                刷新中<Text className="sll-dot-1">.</Text><Text className="sll-dot-2">.</Text><Text className="sll-dot-3">.</Text>
              </Text>
            </View>
          ) : (
            <>
              <View className="sll-spinner" />
              <Text className="text-[24px] text-stone-400 mt-12px">
                加载中<Text className="sll-dot-1">.</Text><Text className="sll-dot-2">.</Text><Text className="sll-dot-3">.</Text>
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
})

// 添加 displayName 便于调试
ScrollLoadList.displayName = 'ScrollLoadList'

export default ScrollLoadList