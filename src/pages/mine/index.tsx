import { View, Text, Button } from '@tarojs/components'
import { NavBar, Avatar } from '@/components'
import { getImageCdnUrl } from '@/utils'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { getProfile } from '@/api/auth'
import { GENDER_META } from '@/constants/gender'
import { useRequest } from 'ahooks'
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  // 每次进入页面都刷新个人资料
  const { data: profile, refresh } = useRequest(getProfile, {
    manual: true
  })

  useDidShow(() => {
    refresh()
  })

  // 分享好友：URL 携带邀请码，新用户注册后邀请者可免费获得 1 次 AI 生成额度
  useShareAppMessage(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title: '规划行程、找旅行搭子，AI 一键搞定出游计划',
      path: `/pages/home/index${inviteCode ? `?inviteCode=${inviteCode}` : ''}`,
      imageUrl: getImageCdnUrl('share.png')
    };
  });

  // 分享朋友圈：query 携带邀请码（朋友圈分享自动拼接至当前页面路径）
  useShareTimeline(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title: '规划行程、找旅行搭子，AI 一键搞定出游计划',
      query: inviteCode ? `inviteCode=${inviteCode}` : '',
      imageUrl: getImageCdnUrl('share.png')
    };
  });

  // 1. 自由行工具箱数据
  const tools = [
    {
      id: 1,
      title: '记账本',
      icon: 'icon-notepad',
      onFn: () => {
        Taro.navigateTo({ url: '/pages/accounting/index/index' })
      }
    },
    // { id: 2, title: '备忘录', icon: 'icon-checklists' },
    {
      id: 3,
      title: '备忘清单',
      icon: 'icon-memos',
      onFn: () => {
        Taro.navigateTo({ url: '/pages/checklist/list/index' })
      }
    },
    /* {
      id: 4,
      title: '汇率换算',
      icon: 'icon-rates',
      onFn: () => {
        Taro.navigateTo({ url: `/pages/webview/index?src=${encodeURIComponent(`${H5_BASE_URL}/convert`)}` })
      }
    }, */
  ]

  // 角色徽标配置：0普通 1领队 2管理员
  const ROLE_BADGES: Record<number, { label: string; bg: string }> = {
    1: { label: '领队', bg: 'bg-emerald-500' },
    2: { label: '管理员', bg: 'bg-[#F97316]' },
  }

  // 2. 更多服务数据
  const services = [
    {
      id: 1,
      title: '我的收藏',
      icon: 'icon-weishoucang',
      onFn: () => {
        Taro.navigateTo({ url: '/pages/favorite/index' })
      }
    },
    {
      id: 2,
      title: '浏览历史',
      icon: 'icon-history',
      onFn: () => {
        Taro.navigateTo({ url: '/pages/history/index' })
      }
    },
    {
      id: 'invite',
      title: '邀请好友',
      icon: 'icon-share',
      openType: 'share' // 使用微信分享
    },
    {
      id: 4,
      title: '联系客服',
      icon: 'icon-contact',
      openType: 'contact'
    },
    {
      id: 5,
      title: '问题投诉',
      icon: 'icon-complaint',
      onFn: () => {
        Taro.navigateTo({ url: '/pages/complaint/index/index' })
      }
    },
  ]

  return (
    <>
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
            {/* 头像（右下角为编辑资料入口） */}
            <View className="relative">
              <Avatar
                name={profile?.nickname}
                src={profile?.avatarUrl!}
                mode="aspectFill"
                preview
                className="w-full h-full w-16 h-16 rounded-full overflow-hidden border border-white shadow-sm text-44px"
              />
              <View
                className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center active:opacity-80"
                onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })}
              >
                <Text className="iconfont icon-edit1 font-bold text-[#F97316] text-30px" />
              </View>
            </View>

            {/* 名字与标签 */}
            <View className="flex flex-col ml-4 flex-1">
              <View className="flex flex-row items-center">
                <Text onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })} className="text-xl font-black text-gray-800 tracking-wide max-w-40 truncate">{profile?.nickname || '驴友'}</Text>
                {profile?.gender && profile.gender !== 'unknown' && (
                  <View
                    className='inline-flex items-center justify-center w-[36px] h-[36px] rounded-full ml-1 flex-shrink-0'
                    style={{ backgroundColor: GENDER_META[profile.gender]?.badge }}
                  >
                    <Text
                      className={'iconfont ' + (GENDER_META[profile.gender]?.icon || '') + ' text-[22px]'}
                      style={{ color: GENDER_META[profile.gender]?.color }}
                    />
                  </View>
                )}
                {ROLE_BADGES[profile?.role ?? 0] && (
                  <Text className={`ml-1.5 text-[20px] text-white px-2 py-0.5 rounded-md flex-shrink-0 ${ROLE_BADGES[profile!.role!].bg}`}>
                    {ROLE_BADGES[profile!.role!].label}
                  </Text>
                )}
              </View>
              {/* 标签 - 新增用户ID展示 */}
              <View className="flex flex-row items-center mt-1.5 overflow-hidden w-[max-content]">
                <Text className="text-24px">
                  ID: {profile?.id ?? '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* 3. 数据统计交互行：获赞+收藏合并为一个数 / 笔记(攻略+行程+搭子) / 粉丝 / 关注 / 拉黑 */}
          <View className="grid grid-cols-5 text-center my-4 px-1 gap-y-3">
            {[
              { value: (profile?.guideCount ?? 0) + (profile?.tripCount ?? 0) + (profile?.partnerCount ?? 0), label: '笔记', url: '/pages/notes/index' },
              { value: profile?.followerCount ?? '0', label: '粉丝', url: '/pages/fans/index' },
              { value: profile?.followCount ?? '0', label: '关注', url: '/pages/follow/index' },
              { value: (profile?.totalLikes ?? 0) + (profile?.totalFavs ?? 0), label: '获赞与收藏' },
              { value: profile?.blockCount ?? '0', label: '拉黑', url: '/pages/blacklist/index' }
            ].map((stat, i) => (
              <View key={i} className="flex flex-col items-center active:opacity-70" onClick={() => stat.url && Taro.navigateTo({ url: stat.url })}>
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
            <Text className="text-base font-black text-gray-800 tracking-wide block">更多服务</Text>
            <View className="grid grid-cols-4 gap-2 text-center">
              {services.map((service) => (
                <Button
                  openType={service.openType as any}
                  key={service.id}
                  className='flex items-center flex-col px-0 text-28px bg-transparent border-0 text-[#333] py-2 transition-colors duration-150'
                  onClick={service.onFn}
                >
                  {/* 底部图标可以直接使用轻量图标或文字符号 */}
                  <View className="w-10 h-10 flex items-center justify-center">
                    <Text className={`text-60px iconfont ${service.icon}`} />
                  </View>
                  <Text className="text-xs font-medium text-gray-600 tracking-wide">{service.title}</Text>
                </Button>
              ))}
            </View>
          </View>
        </View>

      </View>
    </>
  )
}