import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { NavBar } from '@/components'
import { useRequest } from 'ahooks'
import { getAccountOverview, TARGET_TYPE_NAMES, type AccountOverviewItem, type TargetType } from '@/api/accounting'
import { formatTime } from '@/utils'

// 各目标类型的图标与配色
const TYPE_STYLE: Record<TargetType, { icon: string; cls: string }> = {
  trip: { icon: 'icon-bus', cls: 'bg-blue-100 text-blue-600' },
  guide: { icon: 'icon-attrac', cls: 'bg-green-100 text-green-600' },
  partner: { icon: 'icon-people', cls: 'bg-orange-100 text-orange-600' },
}

export default function AccountingIndexPage() {
  const { data: list = [], loading, refresh } = useRequest(getAccountOverview)

  useDidShow(() => {
    refresh()
  })

  const totalAmount = list.reduce((sum, i) => sum + i.totalAmount, 0)

  const handleClick = (item: AccountOverviewItem) => {
    Taro.navigateTo({
      url: `/pages/accounting/list/index?targetType=${item.targetType}&targetId=${item.targetId}&name=${encodeURIComponent(item.targetName || '')}`,
    })
  }

  return (
    <>
      <NavBar title='记账本' showBack />
      <View className='min-h-screen bg-[#FAFAF9] px-4 pb-8 font-sans'>

        {/* 顶部统计卡 */}
        <View className='bg-white rounded-2xl px-5 py-4 shadow-sm mb-4 flex flex-row items-center'>
          <View className='flex-1'>
            <Text className='text-[22px] text-stone-400 block mb-1.5'>账本总支出</Text>
            <Text className='text-48px font-black text-stone-800 tracking-tight'>¥{totalAmount.toFixed(2)}</Text>
          </View>
          <View className='text-right'>
            <Text className='text-[22px] text-stone-400 block mb-1.5'>账本数</Text>
            <Text className='text-40px font-black text-orange-500'>{list.length}</Text>
          </View>
        </View>

        {loading ? (
          <View className='py-20 flex items-center justify-center'>
            <Text className='text-[28px] text-stone-400'>加载中...</Text>
          </View>
        ) : list.length === 0 ? (
          <View className='py-20 flex flex-col items-center justify-center space-y-2 text-stone-400'>
            <Text className='iconfont icon-notepad text-72px' />
            <Text className='text-[26px]'>还没有账本，去行程/攻略/搭子详情页记一笔吧</Text>
          </View>
        ) : (
          <View className='flex flex-col'>
            {list.map((item) => {
              const style = TYPE_STYLE[item.targetType as TargetType] || TYPE_STYLE.partner
              return (
                <View
                  key={`${item.targetType}-${item.targetId}`}
                  className='bg-white rounded-2xl p-4 mb-3 shadow-sm flex flex-row items-center active:bg-stone-50 transition-colors'
                  onClick={() => handleClick(item)}
                >
                  {/* 类型图标 */}
                  <View className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.cls}`}>
                    <Text className={`iconfont ${style.icon} text-40px`} />
                  </View>

                  {/* 中间信息 */}
                  <View className='flex-1 ml-3 overflow-hidden flex flex-col justify-center'>
                    <View className='flex flex-row items-center'>
                      <Text className='font-bold text-stone-800 text-[28px] truncate tracking-wide'>{item.targetName || '未命名'}</Text>
                      <Text className={`ml-2 text-[20px] px-1.5 py-0.5 rounded flex-shrink-0 ${style.cls}`}>
                        {TARGET_TYPE_NAMES[item.targetType as TargetType] || item.targetType}
                      </Text>
                    </View>
                    <Text className='text-[22px] text-stone-400 mt-1 truncate'>
                      共 {item.count} 笔{item.lastTime ? ` · 最后记账 ${formatTime(item.lastTime)}` : ''}
                    </Text>
                  </View>

                  {/* 金额 */}
                  <View className='ml-2 flex-shrink-0'>
                    <Text className='font-black text-orange-500 text-[30px]'>¥{item.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </>
  )
}
