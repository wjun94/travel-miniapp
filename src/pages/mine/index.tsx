import { View, Text } from '@tarojs/components'
import { NavBar, Image } from '@/components'
import { getImageCdnUrl } from '@/utils'
import { navigateTo } from '@tarojs/taro'

export default function ProfilePage() {
  // 1. 自由行工具箱数据
  const tools = [
    { id: 1, title: '记账本', icon: 'icon-notepad' },
    { id: 2, title: '备忘录', icon: 'icon-memos' },
    {
      id: 3,
      title: '备忘清单',
      icon: 'icon-checklists',
      onFn: () => {
        navigateTo({ url: '/pages/checklist/list/index' })
      }
    },
    { id: 4, title: '汇率换算', icon: 'icon-rates' },
  ]

  // 2. 更多服务数据
  const services = [
    { id: 1, title: '我的收藏', icon: 'icon-weishoucang' },
    { id: 2, title: '浏览历史', icon: 'icon-history' },
    { id: 4, title: '联系客服', icon: 'icon-contact' },
  ]

  return (
    <View
      className="min-h-screen bg-[#FCFBF7] pt-2 pb-10 font-sans"
      style={{
        backgroundImage: `url(${getImageCdnUrl('mine-bg3.png')})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <NavBar className="bg-transparent" />
      <View className="px-4">
        {/* 2. 用户个人信息区域 */}
        <View className="flex flex-row items-center px-1 mb-6">
          {/* 头像 */}
          <View className="w-16 h-16 rounded-full overflow-hidden border border-white shadow-sm bg-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=150&q=80"
              mode="aspectFill"
              className="w-full h-full"
            />
          </View>

          {/* 名字与标签 */}
          <View className="flex flex-col ml-4 flex-1">
            <Text className="text-xl font-black text-gray-800 tracking-wide">旅行者小七</Text>
            {/* 标签 */}
            <View className="flex flex-row items-center mt-1.5 bg-[#FFEFE6] rounded-full overflow-hidden w-[max-content]">
              {/* Lv 标签 */}
              <View className="bg-[#FF7A38] px-2 py-1 rounded-full flex flex-row items-center shadow-2xs h-28px leading-28px">
                <Text className="text-white text-[24px] font-black">📍 Lv.6</Text>
              </View>
              {/* 达人标签 */}
              <View className="px-2.5 rounded-full py-1 h-28px leading-28px">
                <Text className="text-[#FF7A38] text-[24px] font-bold">旅行达人</Text>
              </View>
            </View>
          </View>

          {/* 编辑资料按钮 - 右侧居中 */}
          <View className="bg-[#ecf3fd] px-3 py-1.5 rounded-full active:opacity-70 flex-shrink-0">
            <Text className="text-[#3688C7] text-[22px] font-medium">编辑资料</Text>
          </View>
        </View>

        {/* 3. 数据统计交互行 */}
        <View className="grid grid-cols-4 text-center my-6 px-1">
          {[
            { value: '23', label: '攻略' },
            { value: '18', label: '行程' },
            { value: '326', label: '粉丝' },
            { value: '89', label: '关注' }
          ].map((stat, i) => (
            <View key={i} className="flex flex-col active:opacity-70">
              <Text className="text-lg font-black text-gray-800 tracking-tight">{stat.value}</Text>
              <Text className="text-xs mt-1 font-medium">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 4. 自由行工具箱（浅绿卡片） */}
        <View className="bg-[#f0efd5] rounded-3xl p-5 mb-5 shadow-2xs border border-[#E9F3E8]/60">
          <Text className="text-base font-black text-[#0c0e0c] tracking-wide block mb-4">自由行工具箱</Text>
          <View className="grid grid-cols-4 gap-2 text-center">
            {tools.map((tool) => (
              <View
                key={tool.id}
                className="flex flex-col items-center active:opacity-70"
                onClick={tool?.onFn}
              >
                {/* 工具箱子图标圈 */}
                <View className="w-11 h-11 rounded-2xl bg-[#d4dcae] flex items-center justify-center mb-2 shadow-2xs">
                  <Text className={`text-46px text-[#312e29] iconfont opacity-85 ${tool.icon}`} />
                </View>
                <Text className="text-xs font-semibold text-gray-700 tracking-wide">{tool.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. 更多服务模块 */}
        <View className="p-5 mb-5 bg-white rounded-3xl">
          <Text className="text-base font-black text-gray-800 tracking-wide block mb-4">更多服务</Text>
          <View className="grid grid-cols-4 gap-2 text-center">
            {services.map((service) => (
              <View key={service.id} className="flex flex-col items-center active:opacity-70">
                {/* 底部图标可以直接使用轻量图标或文字符号 */}
                <View className="w-10 h-10 flex items-center justify-center">
                  <Text className={`text-60px iconfont ${service.icon}`} />
                </View>
                <Text className="text-xs font-medium text-gray-600 tracking-wide">{service.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

    </View>
  )
}