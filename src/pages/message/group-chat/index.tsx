import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { NavBar, Avatar } from '@/components'
import { useAuthStore } from '@/store/authStore';
import { getGroupMessages, sendGroupMessage, type GroupMessage } from '@/api/conversation'
import { getImageUrl } from '@/utils'

// 前端聊天消息结构
type ChatMessage = {
  id: string | number;
  type: 'left' | 'right';
  content: string;
  nickname: string;
  avatarUrl: string;
  time: string;
};

// 将后端返回的群消息转为前端 ChatMessage
const toChatMessage = (msg: GroupMessage, myUserId: string): ChatMessage => ({
  id: msg.id,
  type: String(msg.fromUserId) === myUserId ? 'right' : 'left',
  content: msg.content,
  nickname: msg.nickname,
  avatarUrl: msg.avatarUrl,
  time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
});

export default function GroupChatPage() {
  const { userInfo } = useAuthStore(state => state);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [scrollTop, setScrollTop] = useState(9999);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);           // 当前已加载到第几页（1为最新一页）
  const [hasMore, setHasMore] = useState(true);  // 是否还有更早消息
  const [loadingMore, setLoadingMore] = useState(false);
  const [anchor, setAnchor] = useState('');      // 加载更早后定位锚点
  const refreshTimer = useRef<any>(null);

  // 从路由参数获取群聊ID和群名
  const router = Taro.getCurrentInstance().router;
  const convId = router?.params?.id || '';
  const convName = router?.params?.name ? decodeURIComponent(router.params.name) : '群聊';

  // 加载历史消息（第一页=最新一页）
  const loadMessages = async () => {
    try {
      const res = await getGroupMessages(convId, 1, 20);
      const myId = String(userInfo?.id || '');
      const formatted = (res?.list || []).map(msg => toChatMessage(msg, myId));
      setMessages(formatted);
      setPage(1);
      setHasMore((res?.total || 0) > formatted.length);
      setTimeout(() => setScrollTop(prev => prev + 9999), 300);
    } catch (err) {
      console.error('加载群消息失败', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载更早的群消息（上滑到顶部触发）
  const loadOlder = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getGroupMessages(convId, nextPage, 20);
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
      console.error('加载更早群消息失败', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!convId) {
      Taro.showToast({ title: '缺少群聊ID', icon: 'none' });
      return;
    }
    loadMessages();
    // 定时轮询刷新（群聊暂无 WebSocket 推送）
    refreshTimer.current = setInterval(loadMessages, 15000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [convId]);

  // 追加消息到视图
  const appendMessage = (msg: GroupMessage) => {
    const myId = String(userInfo?.id || '');
    setMessages(prev => [...prev, toChatMessage(msg, myId)]);
    setTimeout(() => { setScrollTop(prev => prev + 9999); }, 100);
  };

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();
    sendGroupMessage(convId, content).then((res: any) => {
      appendMessage(res);
      setInputValue('');
    }).catch(() => {
      Taro.showToast({ title: '发送失败', icon: 'none' });
    });
  };

  // 进入群聊详情
  const goDetail = () => {
    Taro.navigateTo({ url: `/pages/message/group-detail/index?id=${convId}&name=${encodeURIComponent(convName)}` });
  };

  return (
    <View className='flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800'>
      {/* 顶部导航栏：右侧更多进入群聊详情 */}
      <NavBar showBack>
        <View className='flex-1 flex flex-row items-center'>
          <Text className='text-[34px] font-semibold text-gray-700 truncate max-w-[320px]'>{convName}</Text>
          <Text className='iconfont icon-more text-40px text-black ml-1 active:opacity-60' onClick={goDetail} />
        </View>
      </NavBar>

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
                    <Avatar name={msg.nickname} src={getImageUrl(msg.avatarUrl)} mode='aspectFill' className='w-9 h-9 rounded-full mr-1 flex-shrink-0' />
                  )}

                  <View
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${isRight
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                      }`}
                  >
                    {!isRight && (
                      <Text className='block text-[20px] text-stone-400 mb-1'>{msg.nickname}</Text>
                    )}
                    <Text className='break-all whitespace-pre-wrap'>{msg.content}</Text>
                  </View>

                  {isRight && <Avatar name={userInfo?.nickname} src={userInfo?.avatarUrl || ''} mode='aspectFill' className='w-9 h-9 rounded-full ml-1 flex-shrink-0' />}
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
