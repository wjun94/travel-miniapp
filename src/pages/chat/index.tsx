import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';

// 模拟初始聊天数据
const INITIAL_MESSAGES = [
  { id: 1, type: 'left', content: '嗨！今天过得怎么样？', time: '14:20' },
  { id: 2, type: 'right', content: '挺不错的，正在用 Taro 和 Tailwind 写一个超酷的聊天界面！', time: '14:22' },
  { id: 3, type: 'left', content: '哇，听起来很赞，使用的是什么主题色？', time: '14:23' },
  { id: 4, type: 'right', content: '当然是充满活力的日落橙 (#F97316) 啦！🍊 试试一串超长的测试文本看它会不会溢出：撑满全屏测试撑满全屏测试abcdefghijklmnopqrstuvwxyz1234567890', time: '14:25' },
];

export default function ChatView() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [scrollTop, setScrollTop] = useState(9999); // 用于滚动到最底部

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      type: 'right',
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setInputValue('');

    // 延迟确保 DOM 渲染完毕后平滑滚动到底部
    setTimeout(() => {
      setScrollTop(prev => prev + 1);
    }, 100);
  };

  return (
    // 【优化 1】：外层硬性限制 h-screen 与 overflow-hidden，确保视图绝不超出屏幕
    <View className='flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800'>

      {/* 1. 顶部导航栏 */}
      {/* 【优化 2】：添加 flex-shrink-0，防止头部被内容区无限挤压变形 */}
      <View className='bg-orange-500 text-white text-center py-4 font-bold shadow-sm pt-12 flex-shrink-0'>
        日落橙聊天室
      </View>

      {/* 2. 聊天内容区域 */}
      {/* 【优化 3】：移除可能失效的 style={{ height: 'calc...' }} */}
      {/* 采用 flex-1 配合 h-0，是现代 CSS 中让容器在 Flex 布局下精确自适应且正确触发滚动条的经典解法 */}
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
                {/* 时间 */}
                <Text className='text-xs text-gray-400 mb-1 px-1'>{msg.time}</Text>

                <View className='flex items-start max-w-[75%]'>
                  {/* 左侧头像 */}
                  {!isRight && (
                    <View className='w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center mr-2 text-sm flex-shrink-0'>
                      🤖
                    </View>
                  )}

                  {/* 消息气泡 */}
                  {/* 【优化 4】：在 Text 标签上追加 break-all 和 whitespace-pre-wrap，强制长英文、长数字和换行符正确换行 */}
                  <View
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${isRight
                        ? 'bg-orange-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                      }`}
                  >
                    <Text className='break-all whitespace-pre-wrap'>{msg.content}</Text>
                  </View>

                  {/* 右侧头像 */}
                  {isRight && (
                    <View className='w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center ml-2 text-sm text-white font-semibold flex-shrink-0'>
                      ME
                    </View>
                  )}
                </View>
              </View>
            );
          })}
          {/* 留出底部空白垫片 */}
          <View className='h-4' />
        </ScrollView>
      </View>

      {/* 3. 底部输入栏 */}
      {/* 【优化 5】：添加 flex-shrink-0，使其牢牢固定在最底部，同时增加 pb-safe 适配特殊全面屏 */}
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