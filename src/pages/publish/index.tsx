import { View, Button, Input, Textarea, Picker } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { createPost } from '@/api/post';
import { generateTrip, createTrip } from '@/api/trip';
import BottomSheet from '@/components/BottomSheet';
import Modal from '@/components/Modal';

export default function Publish() {
  const [tab, setTab] = useState(0); // 0攻略 1行程
  const [showPostModal, setShowPostModal] = useState(false);
  const [content, setContent] = useState('');
  const [city, setCity] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(1);
  const [aiMode, setAiMode] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const publishPost = async () => {
    await createPost({ content: JSON.stringify({ text: content, images: [] }), city });
    Taro.showToast({ title: '发布成功' });
    setShowPostModal(false);
  };

  const handleCreateTrip = async () => {
    const trip = await createTrip({ destination, days });
    Taro.navigateTo({ url: `/pages/trip/detail/index?id=${trip.id}` });
  };

  const handleAIGenerate = async () => {
    const trip = await generateTrip({ destination, days, tags });
    Taro.navigateTo({ url: `/pages/trip/detail/index?id=${trip.id}` });
  };

  return (
    <View className="p-4">
      <View className="flex space-x-4 mb-4">
        <Button size="mini" type={tab === 0 ? 'primary' : 'default'} onClick={() => setTab(0)}>发攻略</Button>
        <Button size="mini" type={tab === 1 ? 'primary' : 'default'} onClick={() => setTab(1)}>写行程</Button>
      </View>

      {tab === 0 && (
        <Button onClick={() => setShowPostModal(true)}>写攻略</Button>
      )}

      {tab === 1 && (
        <View>
          <Input placeholder="目的地" value={destination} onInput={e => setDestination(e.detail.value)} />
          <Picker mode="selector" range={[1, 2, 3, 4, 5, 6, 7]} onChange={e => setDays(+e.detail.value + 1)}>
            <View className="py-2">{days}天</View>
          </Picker>
          <View className="flex space-x-2 mt-2">
            <Button size="mini" onClick={handleCreateTrip}>手动编辑</Button>
            <Button size="mini" onClick={() => setAiMode(true)}>AI 生成</Button>
          </View>
        </View>
      )}

      {/* 攻略发布弹窗 */}
      <Modal
        visible={showPostModal}
        title="发布攻略"
        onCancel={() => setShowPostModal(false)}
        onConfirm={publishPost}
        confirmText="发布"
      >
        <Textarea placeholder="分享你的旅行故事" value={content} onInput={e => setContent(e.detail.value)} />
        <Input placeholder="城市" value={city} onInput={e => setCity(e.detail.value)} />
      </Modal>

      {/* AI 生成底部弹窗 */}
      <BottomSheet visible={aiMode} title="选择旅行偏好" onClose={() => setAiMode(false)}>
        <View className="space-y-2">
          <Picker mode="multiSelector" range={[['特种兵', '慢游', '亲子', '情侣']]} onChange={e => setTags(['特种兵'])}>
            <View>选择标签</View>
          </Picker>
          <Button onClick={handleAIGenerate} type="primary">生成</Button>
        </View>
      </BottomSheet>
    </View>
  );
}