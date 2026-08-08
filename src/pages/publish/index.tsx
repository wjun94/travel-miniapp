import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { NavBar, Modal, Image } from '@/components'
import TeamSvg from '@/assets/img/team.svg'
import Taro from '@tarojs/taro'

export default function PublishPage() {
  const [draftModalVisible, setDraftModalVisible] = useState(false);
  const [tripDraftModalVisible, setTripDraftModalVisible] = useState(false);
  const [partnerDraftModalVisible, setPartnerDraftModalVisible] = useState(false);

  // 点击"图文攻略"：检查是否有缓存草稿
  const handleCreateGuide = () => {
    const cached = Taro.getStorageSync('TEMP_ITINERARY_PLANS');
    if (cached) {
      setDraftModalVisible(true);
    } else {
      Taro.navigateTo({ url: '/pages/guide/where/index' });
    }
  };

  // 继续编辑（沿用缓存）
  const handleContinueDraft = () => {
    setDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/guide/itinerary/index' });
  };

  // 重新开始（清除缓存）
  const handleStartFresh = () => {
    Taro.removeStorageSync('TEMP_ITINERARY_PLANS');
    setDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/guide/where/index' });
  };

  // 行程规划：检查是否有缓存行程草稿（编辑草稿或 AI 生成数据任一存在都弹窗）
  const handleCreateTrip = () => {
    const cached = Taro.getStorageSync('TEMP_TRIP_ITINERARY_PLANS') || Taro.getStorageSync('TEMP_TRIP_AI_GENERATED');
    if (cached) {
      setTripDraftModalVisible(true);
    } else {
      Taro.navigateTo({ url: '/pages/trip/where/index' });
    }
  };

  const handleContinueTripDraft = () => {
    setTripDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/trip/itinerary/index' });
  };

  const handleStartTripFresh = () => {
    Taro.removeStorageSync('TEMP_TRIP_ITINERARY_PLANS');
    Taro.removeStorageSync('TEMP_TRIP_DESTINATIONS');
    Taro.removeStorageSync('TEMP_TRIP_AI_GENERATED');
    setTripDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/trip/where/index' });
  };

  // 创建搭子：检查是否有缓存草稿
  const handleCreatePartner = () => {
    // 编辑草稿或 AI 生成数据任一存在都弹窗
    const cached = Taro.getStorageSync('TEMP_PARTNER_ITINERARY_PLANS') || Taro.getStorageSync('TEMP_PARTNER_AI_GENERATED');
    if (cached) {
      setPartnerDraftModalVisible(true);
    } else {
      Taro.navigateTo({ url: '/pages/partner/where/index' });
    }
  };

  const handleContinuePartnerDraft = () => {
    setPartnerDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/partner/itinerary/index' });
  };

  const handleStartPartnerFresh = () => {
    Taro.removeStorageSync('TEMP_PARTNER_ITINERARY_PLANS');
    Taro.removeStorageSync('TEMP_PARTNER_DESTINATION');
    Taro.removeStorageSync('TEMP_PARTNER_AI_GENERATED');
    setPartnerDraftModalVisible(false);
    Taro.navigateTo({ url: '/pages/partner/where/index' });
  };

  // 模拟数据 (建议在实际项目中从 API 获取)
  const features = [
    {
      id: 1,
      title: '图文攻略',
      desc: '分享你的旅行经验',
      icon: '📝',
      bg: 'bg-orange-50',
      color: 'bg-orange-200',
      textColor: 'text-orange-500',
      fn: handleCreateGuide
    },
    {
      id: 2,
      title: '行程规划',
      desc: 'AI/手动创建行程',
      icon: '🧭',
      bg: 'bg-green-50',
      color: 'bg-green-200',
      textColor: 'text-green-500',
      fn: handleCreateTrip
    },
    {
      id: 3,
      title: '创建搭子',
      desc: '寻找旅行同行伙伴',
      icon: '👥',
      bg: 'bg-red-50',
      color: 'bg-red-200',
      textColor: 'text-red-500',
      fn: handleCreatePartner
    },
    {
      id: 4,
      title: '分享行程',
      desc: '邀请他人共同编辑',
      icon: '🔗',
      bg: 'bg-blue-50',
      color: 'bg-blue-200',
      textColor: 'text-blue-500',
      fn: () => Taro.navigateTo({ url: '/pages/publish/share-trip/index' })
    },
  ]



  return (
    <>
      <NavBar />
      <View className="min-h-screen px-4 font-sans">

      {/*  功能区（2x2 网格） - 使用 Grid */}
      <View className="grid grid-cols-2 gap-3 mb-5 mt-2">
        {features.map(item => (
          <View
            key={item.id}
            className={`${item.bg} rounded-2xl p-4 flex flex-row items-center shadow-sm`}
            onClick={() => {
              item?.fn?.()
            }}
          >
            {/* 图标区 */}
            <View className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${item.color} ${item.textColor} mr-3`}>
              {item.icon === '👥' ? <Image src={TeamSvg} className='h-4 w-4' /> : <Text className="text-lg">{item.icon}</Text>}
            </View>
            {/* 文字区 */}
            <View className="flex flex-col justify-center overflow-hidden">
              <Text className="font-bold text-gray-800 truncate">{item.title}</Text>
              <Text className="text-[22px] text-gray-400 mt-1 truncate">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 热门目的地模块 */}
      {/* <View className="mb-8">
        <View className="flex justify-between items-center mb-4 px-1">
          <Text className="text-base font-bold text-gray-800">热门目的地</Text>
          <Text className="text-xs text-gray-400">更多 {'>'}</Text>
        </View>

        <ScrollView scrollX className="w-full whitespace-nowrap" showScrollbar={false}>
          {destinationList.map((dest, index) => (
            <View key={index} className="inline-block mr-3 last:mr-0 relative w-24 h-32 rounded-xl overflow-hidden shadow-sm">
              <Image src={dest.image} mode="aspectFill" className="w-full h-full absolute inset-0" />
              <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></View>
              <Text className="absolute bottom-2 left-0 w-full text-center text-white text-sm font-medium tracking-wider">
                {dest.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View> */}

      {/* 我的草稿箱入口 */}
      <View
        className="flex flex-row items-center bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-4 mb-5 shadow-sm active:opacity-90"
        onClick={() => Taro.navigateTo({ url: '/pages/publish/drafts/index' })}
      >
        <View className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <Text className="text-lg">📋</Text>
        </View>
        <View className="flex flex-col flex-1">
          <Text className="font-bold text-white">我的草稿</Text>
          <Text className="text-[22px] text-white/80 mt-0.5">查看并继续编辑攻略/行程/搭子草稿</Text>
        </View>
        <Text className="text-white/90 text-xl">›</Text>
      </View>

      {/* 草稿继续编辑弹窗 */}
      <Modal
        visible={draftModalVisible}
        title="发现未完成的攻略草稿"
        confirmText="继续编辑"
        cancelText="重新开始"
        onConfirm={handleContinueDraft}
        onCancel={handleStartFresh}
        onMaskClick={() => setDraftModalVisible(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            检测到您之前有正在编辑的攻略草稿，是否继续编辑？
          </Text>
        </View>
      </Modal>

      {/* 行程草稿继续编辑弹窗 */}
      <Modal
        visible={tripDraftModalVisible}
        title="发现未完成的行程草稿"
        confirmText="继续编辑"
        cancelText="重新开始"
        onConfirm={handleContinueTripDraft}
        onCancel={handleStartTripFresh}
        onMaskClick={() => setTripDraftModalVisible(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            检测到您之前有正在编辑的行程草稿，是否继续编辑？
          </Text>
        </View>
      </Modal>

      {/* 搭子草稿继续编辑弹窗 */}
      <Modal
        visible={partnerDraftModalVisible}
        title="发现未完成的搭子草稿"
        confirmText="继续编辑"
        cancelText="重新开始"
        onConfirm={handleContinuePartnerDraft}
        onCancel={handleStartPartnerFresh}
        onMaskClick={() => setPartnerDraftModalVisible(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            检测到您之前有正在编辑的搭子草稿，是否继续编辑？
          </Text>
        </View>
      </Modal>
      </View>
    </>
  )
}