import { View, Text, Image } from '@tarojs/components'
import { NavBar } from '@/components'
import { navigateTo } from '@tarojs/taro'

export default function MessagePage() {
  // 1. 顶部金刚区数据
  const categories = [
    { id: 1, title: '搭子申请', icon: '👥', bgColor: 'bg-[#EAF5F1]', textColor: 'text-[#56A88E]', badge: 3 },
    { id: 2, title: '评论点赞', icon: '❤️', bgColor: 'bg-[#FFF0E6]', textColor: 'text-[#FA8C4F]', badge: 0 },
    { id: 3, title: '行程协同', icon: '📅', bgColor: 'bg-[#EAF5F1]', textColor: 'text-[#56A88E]', badge: 2 },
    { id: 4, title: '系统通知', icon: '🔔', bgColor: 'bg-[#EBF2FC]', textColor: 'text-[#5C94E0]', badge: 0 },
  ]

  // 2. 消息列表数据（完全对应UI图内容）
  const messageList = [
    {
      id: 1,
      title: '搭子小助手',
      desc: '你发布的“川西小环线 5天4晚”有3人申请，快去看看吧~',
      time: '10:30',
      badge: 3,
      isSystem: true,
      avatarBg: 'bg-[#56A88E]',
      icon: '👤',
      online: false,
    },
    {
      id: 2,
      title: '旅行搭子 · 小雨',
      desc: '你好呀！我对你的行程很感兴趣~',
      time: '昨天',
      badge: 1,
      isSystem: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      online: true,
    },
    {
      id: 3,
      title: '行程协同通知',
      desc: '小雨 已编辑了行程【川西小环线 5天4晚】',
      time: '昨天',
      badge: 0,
      isSystem: true,
      avatarBg: 'bg-[#70B09D]',
      icon: '📝',
      online: false,
    },
    {
      id: 4,
      title: '阿乐在路上',
      desc: '[图片]',
      time: '05-22',
      badge: 0,
      isSystem: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      online: true,
    },
    {
      id: 5,
      title: '系统通知',
      desc: '你的攻略《大理3天2晚超详细攻略》已通过审核',
      time: '05-21',
      badge: 0,
      isSystem: true,
      avatarBg: 'bg-[#8CA2BA]',
      icon: '⚙️',
      online: false,
    },
  ]

  return (
    <View className="min-h-screen bg-[#FCFBF9] px-4 pb-4 font-sans">

      <NavBar title="消息中心" />

      {/* 1. 顶部圆圈功能区 */}
      <View className="grid grid-cols-4 gap-2 text-center mt-2 mb-8">
        {categories.map((item) => (
          <View key={item.id} className="flex flex-col items-center">
            {/* 圆圈图标容器 */}
            <View className={`w-14 h-14 rounded-full ${item.bgColor} flex items-center justify-center relative mb-2 shadow-sm`}>
              <Text className="text-xl">{item.icon}</Text>

              {/* 红点数字角标 */}
              {item.badge > 0 && (
                <View className="absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[14px] font-bold px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center border border-white">
                  {item.badge}
                </View>
              )}
            </View>
            <Text className="text-[26px] font-medium text-gray-700 tracking-wide">{item.title}</Text>
          </View>
        ))}
      </View>

      {/* 2. 消息列表区 */}
      <View className="flex flex-col">
        {messageList.map((msg) => (
          <View
            key={msg.id}
            className="flex flex-row items-center py-3.5 border-b border-gray-50/60 last:border-0"
            onClick={() => navigateTo({ url: `/pages/chat/index?id=${msg.id}` })}
          >

            {/* 左侧头像区 */}
            <View className="relative w-12 h-12 flex-shrink-0">
              {msg.isSystem ? (
                // 系统类头像
                <View className={`w-full h-full rounded-full ${msg.avatarBg} flex items-center justify-center opacity-85`}>
                  <Text className="text-white text-lg">{msg.icon}</Text>
                </View>
              ) : (
                // 用户真实头像
                <Image src={msg.avatar || ''} mode="aspectFill" className="w-full h-full rounded-full bg-gray-100" />
              )}

              {/* 右下角绿色在线状态指示灯 */}
              {!msg.isSystem && msg.online && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CD964] rounded-full border-2 border-white" />
              )}
            </View>

            {/* 中间文本区 */}
            <View className="flex-1 ml-3.5 overflow-hidden flex flex-col justify-center">
              <Text className="font-bold text-gray-800 text-[28px] leading-snug tracking-wide">
                {msg.title}
              </Text>
              <Text className="text-xs text-gray-400 mt-1 truncate tracking-normal">
                {msg.desc}
              </Text>
            </View>

            {/* 右侧时间与未读状态 */}
            <View className="ml-3 flex flex-col items-end justify-between h-10 flex-shrink-0">
              <Text className="text-[24px] text-gray-500">{msg.time}</Text>

              {/* 未读数字气泡 */}
              {msg.badge > 0 ? (
                <View className="bg-[#FF3B30] text-white text-[14px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {msg.badge}
                </View>
              ) : (
                // 占位保持上下对齐空间
                <View className="h-4.5" />
              )}
            </View>

          </View>
        ))}
      </View>

    </View >
  )
}