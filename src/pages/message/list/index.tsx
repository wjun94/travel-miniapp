import { useEffect, useRef, useState } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getNotificationList, markNotificationTypeAllRead, NotificationItem } from '@/api/message';
import { clearSystemMessages } from '@/api/conversation';
import { handlePartnerApplication } from '@/api/partner';
import { NavBar, ScrollLoadList, Avatar, Modal } from '@/components';
import type { ScrollLoadListRef } from '@/components/ScrollLoadList';
import { formatTime } from '@/utils';

const TYPE_BG: Record<number, string> = {
    1: 'bg-blue-50',
    2: 'bg-red-50',
    3: 'bg-green-50',
    4: 'bg-orange-50',
    5: 'bg-purple-50',
    6: 'bg-teal-50',
};

export default function MessageList() {
    const router = useRouter();
    const defaultType = router.params?.type ? Number(router.params.type) : undefined;
    // 列表刷新句柄（清空系统消息后刷新）
    const listRef = useRef<ScrollLoadListRef>(null);
  // ===== WebSocket 实时推送：后台发送系统消息时即时刷新列表 =====
  const socketTask = useRef<any>(null)
  const isConnect = useRef<boolean>(false)
  const heartbeatTimer = useRef<any>(null)

  const connectWS = () => {
    if (isConnect.current) return
    const token = Taro.getStorageSync('token') || ''
    if (!token) return
    Taro.connectSocket({ url: `${SOCKET_BASE}/ws?token=${token}` }).then((task) => {
      socketTask.current = task
      task.onOpen(() => {
        isConnect.current = true
        startHeartbeat()
      })
      task.onMessage((res) => {
        if (res.data === 'ping' || res.data === 'pong') return
        try {
          const data = JSON.parse(res.data)
          if (data.action === 'new_notification') {
            // 收到系统消息推送：刷新列表
            listRef.current?.refresh()
          }
        } catch (e) { /* 忽略非 JSON 消息 */ }
      })
      task.onClose(() => {
        isConnect.current = false
        stopHeartbeat()
        setTimeout(() => connectWS(), 5000)
      })
      task.onError(() => {
        isConnect.current = false
      })
    })
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer.current = setInterval(() => {
      if (isConnect.current && socketTask.current) {
        socketTask.current.send({ data: 'ping', fail: () => {} })
      }
    }, 30000)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
      heartbeatTimer.current = null
    }
  }

  const closeWS = () => {
    stopHeartbeat()
    if (socketTask.current) {
      socketTask.current.close({})
      socketTask.current = null
    }
  }

  // 页面显示时连接 WS，隐藏时断开
  Taro.useDidShow(() => {
    connectWS()
  })
  Taro.useDidHide(() => {
    closeWS()
  })

    // 拒绝二次确认弹窗
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectTarget, setRejectTarget] = useState<NotificationItem | null>(null);
    // 本地处理状态映射（key 为通知 id），操作成功后即时更新列表状态
    const [statusMap, setStatusMap] = useState<Record<string, number>>({});
    // 本地拒绝原因映射（key 为通知 id），拒绝后即时展示
    const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

    // 进入页面：按类型批量标记该分类通知为已读
    useEffect(() => {
        if (defaultType) {
            markNotificationTypeAllRead(defaultType).catch(() => { });
        }
    }, [defaultType]);

    // 清空全部系统消息（仅系统消息列表展示入口）
    const handleClearSystem = () => {
        Taro.showModal({
            title: '清空公告',
            content: '确定清空全部公告吗？清空后不可恢复',
            confirmText: '清空',
            success: async (res) => {
                if (res.confirm) {
                    await clearSystemMessages();
                    listRef.current?.refresh();
                    Taro.showToast({ title: '已清空', icon: 'success' });
                }
            },
        });
    };

    // 同意申请
    const handleApprove = async (item: NotificationItem) => {
        if (!item.targetId || !item.relatedId) return;
        Taro.showLoading({ title: '处理中...', mask: true });
        const ok = await handlePartnerApplication(item.targetId, { applicationId: item.relatedId, status: 1, reason: '' })
            .then(() => true).catch(() => false);
        Taro.hideLoading();
        if (!ok) return;
        // 本地即时更新列表状态，无需整列表刷新
        setStatusMap(prev => ({ ...prev, [item.id]: 1 }));
        Taro.showToast({ title: '已同意', icon: 'success' });
    };

    // 打开拒绝弹窗（二次确认 + 输入拒绝理由）
    const openRejectModal = (item: NotificationItem) => {
        setRejectTarget(item);
        setRejectReason('');
        setRejectModalVisible(true);
    };

    // 确认拒绝
    const handleRejectConfirm = async () => {
        if (!rejectTarget || !rejectTarget.targetId || !rejectTarget.relatedId) return;
        setRejectModalVisible(false);
        Taro.showLoading({ title: '处理中...', mask: true });
        const ok = await handlePartnerApplication(rejectTarget.targetId, {
            applicationId: rejectTarget.relatedId,
            status: 2,
            reason: rejectReason.trim(),
        }).then(() => true).catch(() => false);
        Taro.hideLoading();
        if (!ok) return;
        // 本地即时更新列表状态，无需整列表刷新
        setStatusMap(prev => ({ ...prev, [rejectTarget.id]: 2 }));
        setReasonMap(prev => ({ ...prev, [rejectTarget.id]: rejectReason.trim() }));
        Taro.showToast({ title: '已拒绝', icon: 'success' });
    };

    // 点击用户：进入用户详情页
    const goUserDetail = (item: NotificationItem) => {
        if (!item.fromUserId) return;
        Taro.navigateTo({ url: `/pages/personal/index?userId=${item.fromUserId}` });
    };

    const handleItemClick = (item: NotificationItem) => {
        // 系统消息：进入消息详情页（详情页内展示全文与跳转链接）
        if (item.type === 4) {
            Taro.navigateTo({ url: `/pages/message/detail/index?id=${item.id}` });
            return;
        }
        // 新增关注：跳转到关注者主页（后端 targetType 为 user）
        if (item.targetType === 'user' && item.targetId) {
            Taro.navigateTo({ url: `/pages/personal/index?userId=${item.targetId}` });
            return;
        }
        // 根据 targetType/targetId 跳转
        const routeMap: Record<string, string> = {
            guide: '/pages/guide/detail/index',
            trip: '/pages/trip/detail/index',
            partner: '/pages/partner/detail/index',
        };
        const basePath = routeMap[item.targetType];
        if (basePath && item.targetId) {
            Taro.navigateTo({ url: `${basePath}?id=${item.targetId}` });
        }
    };

    return (
        <>
            <NavBar showBack title='消息中心' />
            <View className='min-h-screen bg-gray-50 flex flex-col'>

            {/* 系统消息：顶部清空入口 */}
            {defaultType === 4 && (
                <View className='flex flex-row items-center justify-end px-4 py-2 bg-white bb'>
                    <Text
                        className='text-[24px] text-gray-500 px-3 py-1 rounded-full bg-gray-100 active:bg-gray-200'
                        onClick={handleClearSystem}
                    >
                        清空公告
                    </Text>
                </View>
            )}

            {/* 通知列表 */}
            <ScrollLoadList
                ref={listRef}
                className='flex-1'
                request={(page, pageSize) =>
                    getNotificationList({ type: defaultType, page, pageSize })
                }
                renderItem={(item) => {
                    const bg = item.type ? TYPE_BG[item.type] : TYPE_BG[4];
                    // 优先使用本地操作后的状态，未操作时取后端返回状态
                    const status = statusMap[item.id] ?? item.status;
                    // 拒绝原因：优先本地输入，否则取后端返回
                    const reason = reasonMap[item.id] ?? item.reason;
                    return (
                        <View
                            onClick={() => handleItemClick(item)}
                            className={`
                                relative flex flex-row items-start px-4 py-4 bb transition-all duration-150 active:scale-[0.99]
                                ${item.isRead
                                    ? 'bg-white active:bg-gray-50'
                                    : 'bg-orange-50/10 active:bg-orange-50/30'
                                }
                            `}
                        >
                            {/* 未读状态左侧主题色竖条：改用圆角，视觉更柔和 */}
                            {!item.isRead && (
                                <View className='absolute left-0 top-3 bottom-3 w-[4px] rounded-r-md bg-[#F97316]' />
                            )}

                            {/* 用户头像 + 类型小标：改为 items-start 顶部对齐；公告用公告图标 */}
                            <View className='relative shrink-0 mt-0.5'>
                                {item.type === 4 ? (
                                    <View className='w-[80px] h-[80px] rounded-12px bg-orange-500 flex items-center justify-center'>
                                        <Text className='iconfont icon-bulletin text-white text-50px' />
                                    </View>
                                ) : (
                                    <View
                                        className='relative'
                                        onClick={(e) => { e.stopPropagation(); goUserDetail(item); }}
                                    >
                                        <Avatar
                                            name={item.fromUser?.nickname}
                                            src={item.fromUser?.avatarUrl}
                                            className='w-[80px] h-[80px] rounded-full ring-2 ring-white shadow-sm'
                                        />
                                        <View className={`absolute -bottom-1 -right-1 w-[10px] h-[10px] rounded-full ring-2 ring-white ${bg}`} />
                                    </View>
                                )}
                            </View>

                            {/* 内容区：去除了固定的 h-[80px]，改为自适应高度，配合 space-y 控制间距 */}
                            <View className='flex-1 ml-3 min-w-0 flex flex-col justify-start py-0.5 space-y-1'>
                                {/* 第一行：昵称 + 时间 */}
                                <View className='flex flex-row items-center justify-between'>
                                    <View className='flex flex-row items-center min-w-0'>
                                        <Text
                                            className={`text-[26px] font-semibold truncate ${item.isRead ? 'text-gray-600' : 'text-gray-900'}`}
                                            onClick={(e) => { e.stopPropagation(); goUserDetail(item); }}
                                        >
                                            {item.type === 4 ? (item.title || '公告') : (item.fromUser?.nickname || '')}
                                        </Text>
                                        {!item.isRead && (
                                            <View className='w-[10px] h-[10px] rounded-full bg-[#F97316] shrink-0 ml-2 animate-pulse' />
                                        )}
                                    </View>
                                    {/* 时间戳移到右上角，更符合主流社交 App 规范 */}
                                    <Text className='text-[20px] text-gray-400 shrink-0 ml-4'>{formatTime(item.createdAt)}</Text>
                                </View>

                                {/* 第二行：消息正文 */}
                                <Text className={`text-[24px] leading-relaxed line-clamp-2 ${item.isRead ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {item.content}
                                </Text>

                                {/* 点赞/收藏：展示被操作内容标题 */}
                                {item.type === 2 && item.title && (
                                    <View className='mt-2 bg-gray-50 border border-solid border-gray-100 px-3 py-2 rounded-lg max-w-full'>
                                        <Text className='text-[22px] text-gray-500 line-clamp-2 leading-relaxed'>
                                            {item.title}
                                        </Text>
                                    </View>
                                )}

                                {/* 第三行：评论/回复气泡背景 */}
                                {item.commentContent && (
                                    <View className='mt-2 bg-gray-50 border border-solid border-gray-100 px-3 py-2 rounded-lg max-w-full'>
                                        <Text className='text-[22px] text-gray-500 line-clamp-2 leading-relaxed'>
                                            {item.commentContent}
                                        </Text>
                                    </View>
                                )}

                                {/* 第四行：申请备注 */}
                                {item.remark && (
                                    <View className='mt-2 bg-orange-50 border border-solid border-orange-100 px-3 py-2 rounded-lg max-w-full'>
                                        <Text className='text-[22px] text-orange-600 leading-relaxed'>
                                            备注：{item.remark}
                                        </Text>
                                    </View>
                                )}

                                {/* 第五行：搭子解散原因 */}
                                {item.type === 6 && item.cancelReason && (
                                    <View className='mt-2 bg-teal-50 border border-solid border-teal-100 px-3 py-2 rounded-lg max-w-full'>
                                        <Text className='text-[22px] text-teal-600 leading-relaxed'>
                                            解散原因：{item.cancelReason}
                                        </Text>
                                    </View>
                                )}

                                {/* 第五行：解散原因（仅已拒绝状态展示） */}
                                {item.type === 1 && status === 2 && reason && (
                                    <View className='mt-2 flex flex-row items-start bg-red-50/70 border border-solid border-red-100 px-3 py-2.5 rounded-lg'>
                                        <View className='w-[8px] h-[8px] rounded-full bg-red-400 mt-[9px] mr-2 shrink-0' />
                                        <View className='flex-1 min-w-0'>
                                            <Text className='text-[20px] font-medium text-red-400 block mb-1'>解散原因</Text>
                                            <Text className='text-[22px] text-red-600 leading-relaxed break-all'>{reason}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* 搭子申请：根据处理状态展示 */}
                                {item.type === 1 && (
                                    status === 0 ? (
                                        <View className='flex flex-row items-center justify-end space-x-3 pt-2'>
                                            <View
                                                className='px-5 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-[22px] active:bg-gray-200'
                                                onClick={(e) => { e.stopPropagation(); openRejectModal(item); }}
                                            >
                                                拒绝
                                            </View>
                                            <View
                                                className='px-5 h-8 flex items-center justify-center rounded-full bg-[#F97316] text-white text-[22px] active:bg-[#EA580C]'
                                                onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                                            >
                                                同意
                                            </View>
                                        </View>
                                    ) : (
                                        <View className='flex flex-row items-center justify-end pt-2'>
                                            <View className={`px-4 h-8 flex items-center justify-center rounded-full text-[22px] ${status === 1 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {status === 1 ? '已同意' : status === 3 ? '已退出' : '已拒绝'}
                                            </View>
                                        </View>
                                    )
                                )}
                            </View>
                        </View>
                    );
                }}
                emptyText='暂无通知消息'
                pageSize={20}
            />

            {/* 拒绝申请二次确认弹窗 */}
            <Modal
                visible={rejectModalVisible}
                title="拒绝搭子申请"
                confirmText="确定拒绝"
                cancelText="再想想"
                onConfirm={handleRejectConfirm}
                onCancel={() => setRejectModalVisible(false)}
                onMaskClick={() => setRejectModalVisible(false)}
            >
                <View className="py-2">
                    <Textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-[26px] box-border h-28 leading-relaxed"
                        placeholder="请输入拒绝理由（选填）"
                        placeholderClass="text-gray-400"
                        value={rejectReason}
                        onInput={(e) => setRejectReason(e.detail.value)}
                        maxlength={100}
                    />
                </View>
            </Modal>
            </View>
        </>
    );
}