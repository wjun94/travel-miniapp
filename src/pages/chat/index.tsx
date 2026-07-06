import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

// 初始模拟数据
const INITIAL_MESSAGES = [
  { id: 1, type: 'left', content: '嗨！今天过得怎么样？', time: '14:20' },
  { id: 2, type: 'right', content: '挺不错的，正在用 Taro 和 Tailwind 写一个超酷的聊天界面！', time: '14:22' },
  { id: 3, type: 'left', content: '哇，听起来很赞，使用的是什么主题色？', time: '14:23' },
  { id: 4, type: 'right', content: '当然是充满活力的日落橙 (#F97316) 啦！🍊 试试一串超长的测试文本看它会不会溢出：撑满全屏测试撑满全屏测试abcdefghijklmnopqrstuvwxyz1234567890', time: '14:25' },
];

export default function ChatView() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [scrollTop, setScrollTop] = useState(9999);

  // 使用 useRef 保存 socketTask 和心跳定时器，防止组件刷新时丢失引用
  const socketTask = useRef<Taro.SocketTask | null>(null);
  const heartbeatTimer = useRef<any>(null);
  const isConnect = useRef<boolean>(false);
  const token = Taro.getStorageSync('token') || '';
  // WebSocket 服务器地址（请替换为你的真实 WS/WSS 地址）
  const wsUrl = SOCKET_BASE + '/ws' + `?token=${token}`;

  // 初始化 WebSocket 连接
  useEffect(() => {
    connectWS();

    // 组件销毁时关闭连接，清除定时器
    return () => {
      closeWS();
    };
  }, []);

  // 1. 建立连接
  const connectWS = () => {
    if (isConnect.current) return;

    Taro.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket 任务创建成功');
      },
      fail: (err) => {
        console.error('WebSocket 任务创建失败', err);
        // 失败后尝试重连
        setTimeout(() => connectWS(), 5000);
      }
    }).then(task => {
      socketTask.current = task;

      // 监听连接打开
      task.onOpen(() => {
        console.log('WebSocket 连接已打开！');
        isConnect.current = true;
        startHeartbeat(); // 开启心跳
      });

      // 监听收到服务器消息
      task.onMessage((res) => {
        console.log('收到服务器消息：', res.data);

        // 如果收到的是心跳回应，则不展示在聊天界面
        if (res.data === 'ping' || res.data === 'pong') return;

        // 解析并渲染接收到的消息
        try {
          // 假设后端返回的是 JSON 字符串
          const data = JSON.parse(res.data);
          appendMessage('left', data.content || res.data);
        } catch (e) {
          // 如果是一般字符串文本
          appendMessage('left', res.data);
        }
      });

      // 监听连接关闭
      task.onClose((res) => {
        console.log('WebSocket 连接已关闭：', res);
        isConnect.current = false;
        stopHeartbeat();
        // 自动重连机制
        setTimeout(() => connectWS(), 5000);
      });

      // 监听连接错误
      task.onError((err) => {
        console.error('WebSocket 报错：', err);
        isConnect.current = false;
      });
    });
  };

  // 2. 心跳检测（防止小程序在后台或网络波动时被动断开）
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer.current = setInterval(() => {
      if (isConnect.current && socketTask.current) {
        socketTask.current.send({
          data: 'ping', // 向后端发送心跳包，内容根据后端约定修改
          fail: () => console.log('心跳发送失败')
        });
      }
    }, 30000); // 每 30 秒发送一次心跳
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
  const appendMessage = (type: 'left' | 'right', content: string) => {
    const newMsg = {
      id: Date.now() + Math.random(),
      type,
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 使用函数式更新确保拿到最新的消息列表
    setMessages(prev => [...prev, newMsg]);

    // 滚动到底部
    setTimeout(() => {
      setScrollTop(prev => prev + 1);
    }, 100);
  };

  // 4. 发送消息按钮点击
  const handleSend = () => {
    if (!inputValue.trim()) return;

    if (!isConnect.current || !socketTask.current) {
      Taro.showToast({ title: '网络未连接', icon: 'none' });
      return;
    }

    // 构建发送给后端的数据结构（这里直接发送文本，也可以转为 JSON 字符串）
    const sendData = inputValue;

    // 通过 WebSocket 发送数据
    socketTask.current.send({
      data: sendData,
      success: () => {
        // 发送成功后，本地先渲染自己发的消息
        appendMessage('right', inputValue);
        setInputValue('');
      },
      fail: (err) => {
        Taro.showToast({ title: '发送失败', icon: 'none' });
        console.error('发送失败：', err);
      }
    });
  };

  return (
    <View className='flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800'>
      {/* 顶部导航栏 */}
      <View className='bg-orange-500 text-white text-center py-4 font-bold shadow-sm pt-12 flex-shrink-0'>
        日落橙实时聊天室
      </View>

      {/* 聊天内容区域 */}
      <View className='flex-1 h-0 p-4'>
        <ScrollView
          scrollY
          scrollTop={scrollTop}
          scrollWithAnimation
          className='h-full'
        >
          {messages.map((msg) => {
            const isRight = msg.type === 'right';
            return (
              <View key={msg.id} className={`flex flex-col mb-4 ${isRight ? 'items-end' : 'items-start'}`}>
                <Text className='text-xs text-gray-400 mb-1 px-1'>{msg.time}</Text>

                <View className='flex items-start max-w-[75%]'>
                  {!isRight && (
                    <View className='w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center mr-2 text-sm flex-shrink-0'>
                      🤖
                    </View>
                  )}

                  <View
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${isRight
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                      }`}
                  >
                    <Text className='break-all whitespace-pre-wrap'>{msg.content}</Text>
                  </View>

                  {isRight && (
                    <View className='w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center ml-2 text-sm text-white font-semibold flex-shrink-0'>
                      ME
                    </View>
                  )}
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