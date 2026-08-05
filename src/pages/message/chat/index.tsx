import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Avatar } from '@/components'
import { useAuthStore } from '@/store/authStore';
import { getMessageList, sendMessage as sendMessageApi, Message } from '@/api/message'
import { getProfile } from '@/api/personal'

// 前端聊天消息结构，兼容后端返回的 Message 类型
type ChatMessage = {
  id: number | string;
  type: 'left' | 'right';
  content: string;
  senderId?: string;
  time: string;
};

// 将后端返回的 Message 转为前端 ChatMessage
const toChatMessage = (msg: Message, myUserId: string): ChatMessage => ({
  id: msg.id,
  type: String(msg.fromUserId) === myUserId ? 'right' : 'left',
  content: msg.content,
  senderId: String(msg.fromUserId),
  time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
});

// 根据两个用户 ID 生成一致的聊天房间名（保证双向一样）
const makeChatRoomId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join(':');
};

export default function ChatView() {
  const { userInfo } = useAuthStore(state => state);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [scrollTop, setScrollTop] = useState(9999);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);           // 当前已加载到第几页（1为最新一页）
  const [hasMore, setHasMore] = useState(true);  // 是否还有更早消息
  const [loadingMore, setLoadingMore] = useState(false);
  const [anchor, setAnchor] = useState('');      // 加载更早后定位锚点

  // 从路由参数获取对方用户 ID 和昵称
  const router = Taro.getCurrentInstance().router;
  const targetUserId = router?.params?.userId || '';
  const [nickname, setNickname] = useState(router?.params?.nickname || '聊天');

  // 进入页面后按 userId 拉取对方真实昵称（消息中心跳转未带 nickname 时也能正确显示）
  useEffect(() => {
    if (!targetUserId) return;
    getProfile(targetUserId)
      .then((res) => {
        if (res?.nickname) setNickname(res.nickname);
      })
      .catch(() => { /* 拉取失败时保留路由参数昵称 */ });
  }, [targetUserId]);

  // 使用 useRef 保存 socketTask 和心跳定时器，防止组件刷新时丢失引用
  const socketTask = useRef<Taro.SocketTask | null>(null);
  const heartbeatTimer = useRef<any>(null);
  const isConnect = useRef<boolean>(false);
  const token = Taro.getStorageSync('token') || '';
  const wsUrl = SOCKET_BASE + '/ws' + `?token=${token}`;

  // 初始化：先加载历史消息，再连接 WebSocket
  useEffect(() => {
    if (!targetUserId) {
      Taro.showToast({ title: '缺少聊天对象', icon: 'none' });
      return;
    }

    // 加载历史消息
    loadHistory();

    return () => {
      closeWS();
    };
  }, [targetUserId]);

  // 加载历史消息（第一页=最新一页）
  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getMessageList(targetUserId, 1, 20);
      const myId = String(userInfo?.id || '');
      const formatted = (res?.list || []).map(msg => toChatMessage(msg, myId));
      setMessages(formatted);
      setPage(1);
      setHasMore((res?.total || 0) > formatted.length);
      // 消息加载完毕后再连 WS，保证消息顺序
      connectWS();
      setTimeout(() => setScrollTop(prev => prev + 9999), 300);
    } catch (err) {
      console.error('加载历史消息失败', err);
      connectWS();
    } finally {
      setLoading(false);
    }
  };

  // 加载更早的消息（上滑到顶部触发）
  const loadOlder = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getMessageList(targetUserId, nextPage, 20);
      const myId = String(userInfo?.id || '');
      const older = (res?.list || []).map(msg => toChatMessage(msg, myId));
      if (older.length > 0) {
        // 记录当前第一条消息作为锚点，加载后定位回原视口位置
        const firstId = messages.length > 0 ? String(messages[0].id) : '';
        setMessages(prev => [...older, ...prev]);
        setPage(nextPage);
        setHasMore((res?.total || 0) > nextPage * 20);
        if (firstId) {
          setAnchor('');
          setTimeout(() => setAnchor(firstId), 50);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('加载更早消息失败', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 1. 建立连接
  const connectWS = () => {
    if (isConnect.current || !targetUserId) return;

    Taro.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket 任务创建成功');
      },
      fail: (err) => {
        console.error('WebSocket 任务创建失败', err);
        setTimeout(() => connectWS(), 5000);
      }
    }).then(task => {
      socketTask.current = task;

      task.onOpen(() => {
        console.log('WebSocket 连接已打开！');
        isConnect.current = true;
        startHeartbeat();
        // 加入当前聊天房间
        const roomId = makeChatRoomId(String(userInfo?.id || ''), targetUserId);
        task.send({
          data: JSON.stringify({ action: "join_trip", tripId: roomId }),
        });
      });

      task.onMessage((res) => {
        console.log('收到服务器消息：', res.data);
        if (res.data === 'ping' || res.data === 'pong') return;

        try {
          const data = JSON.parse(res.data);
          if (data.action === "send_message") {
            // 收到其他人发的消息，若 senderId 不是自己才追加
            const senderId = String(data.senderId || '');
            const myId = String(userInfo?.id || '');
            if (senderId !== myId) {
              appendMessage('left', data.content, senderId);
            }
          }
        } catch (e) {
          // 纯文本消息
          appendMessage('left', res.data);
        }
      });

      task.onClose((res) => {
        console.log('WebSocket 连接已关闭：', res);
        isConnect.current = false;
        stopHeartbeat();
        setTimeout(() => connectWS(), 5000);
      });

      task.onError((err) => {
        console.error('WebSocket 报错：', err);
        isConnect.current = false;
      });
    });
  };

  // 2. 心跳检测
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer.current = setInterval(() => {
      if (isConnect.current && socketTask.current) {
        socketTask.current.send({
          data: 'ping',
          fail: () => console.log('心跳发送失败')
        });
      }
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  // 3. 主动关闭连接
  const closeWS = () => {
    stopHeartbeat();
    if (socketTask.current) {
      socketTask.current.close({});
    }
  };

  // 辅助函数：追加消息到视图
  const appendMessage = (type: 'left' | 'right', content: string, senderId?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      content,
      senderId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setTimeout(() => { setScrollTop(prev => prev + 1); }, 100);
  };

  // 4. 发送消息按钮点击
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();

    // 1) 调用 HTTP API 持久化消息
    sendMessageApi(targetUserId, content).then(() => {
      // 2) 本地立即渲染自己的消息
      appendMessage('right', content);
      setInputValue('');

      // 3) 通过 WebSocket 通知对方
      if (isConnect.current && socketTask.current) {
        const roomId = makeChatRoomId(String(userInfo?.id || ''), targetUserId);
        const payload = {
          action: "send_message",
          tripId: roomId,
          content,
        };
        socketTask.current.send({
          data: JSON.stringify(payload),
          fail: (err) => console.error('WS 实时推送失败：', err),
        });
      }
    }).catch((err) => {
      Taro.showToast({ title: '发送失败', icon: 'none' });
      console.error('发送失败：', err);
    });
  };

  // 进入对方用户详情
  const goProfile = () => {
    Taro.navigateTo({ url: `/pages/personal/index?userId=${targetUserId}` })
  }

  return (
    <View className='flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800'>
      {/* 顶部信息栏：左侧名称，右侧更多进入用户详情 */}
      <View className='bg-white flex flex-row items-center px-4 py-3 flex-shrink-0'>
        <Text className='text-[30px] font-semibold text-gray-700 truncate flex-1'>{nickname}</Text>
        <Text className='iconfont icon-more text-40px text-black ml-2 active:opacity-60' onClick={goProfile} />
      </View>

      {/* 聊天内容区域 */}
      <View className='flex-1 h-0 p-4'>
        <ScrollView
          scrollY
          scrollTop={scrollTop}
          scrollIntoView={anchor}
          scrollWithAnimation
          onScrollToUpper={loadOlder}
          className='h-full'
        >
          {!loading && hasMore && !loadingMore && (
            <View className='flex items-center justify-center py-2'>
              <Text className='text-gray-300 text-xs'>上滑加载更早消息</Text>
            </View>
          )}
          {loadingMore && (
            <View className='flex items-center justify-center py-2'>
              <Text className='text-gray-400 text-xs'>加载中...</Text>
            </View>
          )}
          {loading && (
            <View className='flex items-center justify-center py-8'>
              <Text className='text-gray-400 text-sm'>加载中...</Text>
            </View>
          )}
          {!loading && messages.length === 0 && (
            <View className='flex items-center justify-center py-8'>
              <Text className='text-gray-400 text-sm'>暂无消息，开始聊天吧</Text>
            </View>
          )}
          {messages.map((msg) => {
            const isRight = msg.type === 'right';
            return (
              <View key={msg.id} id={String(msg.id)} className={`flex flex-col mb-4 ${isRight ? 'items-end' : 'items-start'}`}>
                <Text className='text-xs text-gray-400 mb-1 px-1'>{msg.time}</Text>

                <View className='flex items-start max-w-[75%]'>
                  {!isRight && (
                    <Avatar name={userInfo?.nickname} src={userInfo?.avatarUrl || ''} mode='aspectFill' className='w-9 h-9 rounded-full mr-1' /> 
                  )}

                  <View
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${isRight
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                      }`}
                  >
                    <Text className='break-all whitespace-pre-wrap'>{msg.content}</Text>
                  </View>

                  {isRight ? <Avatar name={userInfo?.nickname} src={userInfo?.avatarUrl || ''} mode='aspectFill' className='w-9 h-9 rounded-full ml-1' /> : null}
                </View>
              </View>
            );
          })}
          <View className='h-4' />
        </ScrollView>
      </View>

      {/* 底部输入栏 */}
      <View className='bg-white border-t border-gray-100 px-4 py-3 flex items-center space-x-3 flex-shrink-0 pb-safe'>
        <Input
          type='text'
          confirmType='send'
          value={inputValue}
          onInput={(e) => setInputValue(e.detail.value)}
          onConfirm={handleSend}
          placeholder='聊点什么吧...'
          className='flex-1 bg-gray-100 rounded-full h-10 px-4 text-sm border-0 focus:bg-white focus:border focus:border-orange-500'
        />
        <Button
          onClick={handleSend}
          className='bg-orange-500 text-white text-xs px-4 h-10 rounded-full flex items-center justify-center font-medium active:opacity-80 m-0'
          style={{ width: '70px', minHeight: 'unset' }}
        >
          发送
        </Button>
      </View>
    </View>
  );
}