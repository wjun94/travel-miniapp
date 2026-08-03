import { useState, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ScrollLoadList, GuideCard } from '@/components'
import { getGuides } from '@/api/post'
import type { Guide } from '@/api/post'
import { getHeaderHeight } from '@/utils'

export default function SearchPage() {
  const router = useRouter()
  const headerHeight = getHeaderHeight()

  // 初始关键词来自首页跳转参数（已 encodeURIComponent 编码，需解码）；输入框内容独立维护，点击搜索才提交
  const initialKeyword = (() => {
    const raw = (router.params?.keyword as string) || ''
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  })()
  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [inputValue, setInputValue] = useState<string>(initialKeyword)

  // 点击搜索：更新 keyword，ScrollLoadList 检测 params 变化自动刷新
  const handleSearch = () => {
    const kw = inputValue.trim()
    setKeyword(kw)
  }

  const renderCard = useCallback((item: Guide) => {
    return <GuideCard item={item} />
  }, [])

  return (
    <View
      className='flex flex-col bg-[#FCFBF7] font-sans box-border overflow-hidden'
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
    >
      {/* 搜索输入框 + 搜索按钮（固定顶部，自带导航栏下方） */}
      <View className='flex flex-row items-center px-4 pt-2 pb-2'>
        <View className='flex-1 flex flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mr-3'>
          <Text className='iconfont icon-search text-gray-400 mr-2 text-base leading-none' />
          <Input
            placeholder='搜索标题/目的地/简介'
            placeholderClass='text-gray-300 text-sm'
            className='text-sm text-gray-700 flex-1 h-5 min-h-5'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            confirmType='search'
            onConfirm={handleSearch}
          />
          {inputValue && (
            <Text
              className='iconfont icon-close text-gray-300 text-base leading-none ml-1 active:opacity-60'
              onClick={() => setInputValue('')}
            />
          )}
        </View>
        {/* 搜索按钮 */}
        <Text
          className='text-[#e97442] text-sm font-bold flex-shrink-0 active:opacity-70'
          onClick={handleSearch}
        >
          搜索
        </Text>
      </View>

      <View className='flex-1 min-h-0'>
        <ScrollLoadList
          request={(page, pageSize) => (keyword ? getGuides(page, pageSize, undefined, keyword) : getGuides(page, pageSize))}
          params={{ keyword }}
          renderItem={renderCard}
          numColumns={2}
          columnGap={12}
          rowGap={12}
          masonry
          pageSize={10}
          emptyText={keyword ? '未找到相关攻略' : '暂无攻略'}
          scrollViewProps={{
            className: 'px-4 pb-10 box-border',
          }}
        />
      </View>
    </View>
  )
}
